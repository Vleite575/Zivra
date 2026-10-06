<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/** Moves post photos/videos uploaded before media became private from the public disk to the private one. */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('posts')->whereNotNull('media_path')->pluck('media_path')->each(function (string $path) {
            if (Storage::disk('public')->exists($path) && ! Storage::disk('local')->exists($path)) {
                Storage::disk('local')->writeStream($path, Storage::disk('public')->readStream($path));
                Storage::disk('public')->delete($path);
            }
        });
    }

    public function down(): void
    {
        //
    }
};
