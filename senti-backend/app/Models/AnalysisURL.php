<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalysisURL extends Model
{
    use HasFactory;
    protected $table = 'analysis_url';

    protected $fillable = [
        'user_id',
        'publisher_username',
        'post_caption',
        'url',
        'category',
        'positive_comments_percentage',
        'negative_comments_percentage',
        'none_comments_percentage',
        'positive_comments',
        'negative_comments',
        'title'
    ];

    protected $casts = [
        'positive_comments' => 'array',
        'negative_comments' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
