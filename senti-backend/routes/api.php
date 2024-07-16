<?php

use App\Http\Controllers\AnalysisController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::post('register', [AuthController::class, 'register']);
Route::post('signin', [AuthController::class, 'signin']);
Route::post('analysis', [AnalysisController::class, 'analyze']);
Route::post('analysis_URL', [AnalysisController::class, 'analyze_URL']);
Route::post('history', [AnalysisController::class, 'history']);
Route::post('history_url', [AnalysisController::class, 'historyURL']);
Route::post('top10', [AnalysisController::class, 'Top10']);
Route::post('posts', [AnalysisController::class, 'posts']);
Route::post('get_posts', [AnalysisController::class, 'getPosts']);
Route::post('search', [AnalysisController::class, 'search']);
