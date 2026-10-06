<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TransformsRequest;

/**
 * Removes HTML tags from every text input. Zivra stores plain text only;
 * React escapes on output too, this keeps markup out of the database for any other client.
 */
class StripTags extends TransformsRequest
{
    protected function transform($key, $value)
    {
        if (! is_string($value) || str_contains($key, 'password') || $key === 'token') {
            return $value;
        }

        return strip_tags($value);
    }
}
