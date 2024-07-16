<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sentence',
        'result',
    ];

    protected $casts = [
        'result' => 'array',
    ];

    protected $table = 'analysis';

    /**
     * Get the user that owns the sentiment analysis.
     */

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
