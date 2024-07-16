<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\AnalysisURL;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class AnalysisController extends Controller
{
    public function analyze(Request $request)
    {
        $userId = $request->input('userId');
        $sentence = $request->input('sentence');
        $result = $this->performSentimentAnalysis($sentence);
        if (empty($result)) {
            return response()->json(['error' => 'Sentiment analysis failed.'], 500);
        }
        $this->save_text_in_db($sentence,$result,$userId);
        return response()->json(['result' => $result]);
    }

    public function save_text_in_db($sentence, $result, $userId)
    {
        $history = new Analysis();
        $history->sentence = $sentence;
        $history->result = $result;
        $history->user_id = $userId;
        $history->save();
    }

    private function performSentimentAnalysis($sentence)
    {
        $pythonScriptPath = 'C:\Users\Lenovo\PycharmProjects\GP1\Text_load.py';
        $command = escapeshellcmd("python $pythonScriptPath \"$sentence\"");
        $output = shell_exec($command);
        return trim($output);
    }

    public function history(Request $request)
    {
        $userId = $request->input('userId');
        $history = Analysis::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        return response()->json(['history' => $history]);
    }

    public function analyze_URL(Request $request)
    {
        $userId = $request->input('userId');
        $url = $request->input('url');
        $category = $request->input('category');
        $result = $this->performSentimentAnalysisURL($url);

        // Check if the result contains the specific error message
        if (strpos($result, 'Unable to scrape the post. It may be private or inaccessible.') !== false) {
            return response()->json(['error' => 'Unable to scrape the post. It may be private or inaccessible.'], 200);
        }

        if (empty($result)) {
            return response()->json(['error' => 'Sentiment analysis failed.'], 500);
        }
        $result = substr($result,strpos($result , '{'));
        $result = json_decode($result , true);
        $historyURL = $this->save_url_in_db($userId, $url, $result['publisher_username'], $result['post_caption'], $result['Positive comments'], $result['Negative comments'], $result['None comments'], $result['array_positive_comments'], $result['array_negative_comments'], $category);
        return response()->json([
            'url' => $historyURL->url,
            'publisher_username' => $historyURL->publisher_username,
            'post_caption' => $historyURL->post_caption,
            'positive_comments_percentage' => $historyURL->positive_comments_percentage,
            'negative_comments_percentage' => $historyURL->negative_comments_percentage,
            'none_comments_percentage' => $historyURL->none_comments_percentage,
            'positive_comments' => json_decode($historyURL->positive_comments, true),
            'negative_comments' => json_decode($historyURL->negative_comments, true),
        ]);
    }

    public function save_url_in_db($userId, $url, $publisher_username, $post_caption, $positive_comments_percentage, $negative_comments_percentage, $none_comments_percentage, $positive_comments, $negative_comments, $category) {
        $historyURL = new AnalysisURL();
        $historyURL->user_id = $userId;
        $historyURL->url = $url;
        $historyURL->publisher_username = $publisher_username;
        $historyURL->post_caption = $post_caption;
        $historyURL->positive_comments_percentage = $positive_comments_percentage;
        $historyURL->negative_comments_percentage = $negative_comments_percentage;
        $historyURL->none_comments_percentage = $none_comments_percentage;
        $historyURL->positive_comments = json_encode($positive_comments);
        $historyURL->negative_comments = json_encode($negative_comments);
        $historyURL->category = $category;
        $historyURL->title = 'null';
        $historyURL->save();
        return $historyURL;
    }

    private function performSentimentAnalysisURL($url)
    {
        set_time_limit(0); // Increase max execution time
        $venvPythonPath = 'C:\Users\Lenovo\PycharmProjects\GP1\venv\Scripts\python.exe';
        $pythonScriptPath = 'C:\Users\Lenovo\PycharmProjects\GP1\URL_load.py';
        $command = escapeshellcmd("$venvPythonPath $pythonScriptPath \"$url\"");
        $output = shell_exec($command);
        return trim($output);
    }

    public function historyURL(Request $request)
    {
        $userId = $request->input('userId');
        $historyURL = AnalysisURL::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        $response = $historyURL->map(function ($item) {
            return [
                'url' => $item->url,
                'positive_comments_percentage' => $item->positive_comments_percentage,
                'negative_comments_percentage' => $item->negative_comments_percentage,
                'none_comments_percentage' => $item->none_comments_percentage,
                'positive_comments' => json_decode($item->positive_comments, true),
                'negative_comments' => json_decode($item->negative_comments, true),
            ];
        });
        return response()->json(['historyURLs' => $response]);
    }

    public function Top10(Request $request)
    {
        $category = $request->input('category');
        $top = $this->getTop10UrlsByCategory($category);

        $response = $top->map(function ($item) {
            return [
                'url' => $item->url,
                'positive_comments_percentage' => $item->positive_comments_percentage,
                'negative_comments_percentage' => $item->negative_comments_percentage,
                'none_comments_percentage' => $item->none_comments_percentage,
                'positive_comments' => json_decode($item->positive_comments, true),
                'negative_comments' => json_decode($item->negative_comments, true),
            ];
        });

        return response()->json(['top' => $response]);
    }

    public function getTop10UrlsByCategory($category)
    {
        $subQuery = AnalysisURL::selectRaw('MAX(id) as id')
            ->where('category', $category)
            ->groupBy('url')
            ->orderBy('positive_comments_percentage', 'desc');

        $top = AnalysisURL::whereIn('id', $subQuery)
            ->orderBy('positive_comments_percentage', 'desc')
            ->limit(10)
            ->get();

        return $top;
    }


    public function posts(Request $request)
    {
        $userId = $request->input('userId'); // Get the user ID from the request
        $title = $request->input('title');
        $analysis_Id = AnalysisURL::where('user_id', $userId)->orderBy('created_at', 'desc')->pluck('id')->first();
        AnalysisURL::where('id', $analysis_Id)->update(['title' => $title]);
    }

    public function getPosts(Request $request)
    {
        $analysisDetails = $this->getUserAnalysisDetails();

        return response()->json([
            'analysis_details' => $analysisDetails,
        ]);
    }

    public function getUserAnalysisDetails()
    {
        $analysis = AnalysisURL::where('title', '!=', 'null')
            ->select('user_id', 'url', 'positive_comments_percentage', 'negative_comments_percentage', 'none_comments_percentage', 'positive_comments', 'negative_comments', 'title')->orderBy('created_at', 'desc')
            ->get()->map(function ($item) {
                $userDetails = $this->getUserDetails($item->user_id);
                return [
                    'user_id' => $item->user_id,
                    'url' => $item->url,
                    'positive_comments_percentage' => $item->positive_comments_percentage,
                    'negative_comments_percentage' => $item->negative_comments_percentage,
                    'none_comments_percentage' => $item->none_comments_percentage,
                    'positive_comments' => json_decode($item->positive_comments, true),
                    'negative_comments' => json_decode($item->negative_comments, true),
                    'title' => $item->title,
                    'user_details' => $userDetails,
                ];
            });

        return $analysis;
    }

    public function getUserDetails($userId)
    {
        $user_first_name = User::where('id', $userId)->value('firstName');
        $user_last_name = User::where('id', $userId)->value('lastName');
        return [
            'first_name' => $user_first_name,
            'last_name' => $user_last_name,
        ];
    }


    public function search(Request $request)
    {
        $searchString = $request->input('search');
        $results = $this->searchAnalysisURLs($searchString);
        if (empty($results)) {
            return response()->json(['message' => 'The search results are empty.']);
        }
        return response()->json($results);
    }

    public function searchAnalysisURLs($searchString)
    {
        $results = AnalysisURL::select('publisher_username', 'post_caption', 'url', 'positive_comments_percentage',
            'negative_comments_percentage', 'none_comments_percentage', 'positive_comments', 'negative_comments', 'created_at')
            ->where('publisher_username', 'like', '%' . $searchString . '%')
            ->orWhere('post_caption', 'like', '%' . $searchString . '%')
            ->orderBy('url')->orderByDesc('positive_comments_percentage')->get();

        // Filter to get unique URLs with the highest positive_comments_percentage
        $uniqueResults = collect($results)->unique('url')->values()->all();

        return $uniqueResults;
    }

}
