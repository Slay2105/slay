<?php

function now(): string
{
    return (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM);
}

function respond(array $payload): array
{
    return $payload;
}

function sanitize_command(string $input): string
{
    return trim(preg_replace('/\s+/', ' ', $input));
}

function extract_tiktok_id(string $url): ?string
{
    $patterns = [
        '/video\/(\d+)/',
        '/v\/(\d+)/',
        '/\b(\d{18,})\b/'
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
    }

    return null;
}

