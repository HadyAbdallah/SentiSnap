<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analysis_url', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('publisher_username');
            $table->text('post_caption');
            $table->string('url');
            $table->string('category');
            $table->decimal('positive_comments_percentage', 5, 2);
            $table->decimal('negative_comments_percentage', 5, 2);
            $table->decimal('none_comments_percentage', 5, 2);
            $table->json('positive_comments');
            $table->json('negative_comments');
            $table->string('title');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_url');
    }
};
