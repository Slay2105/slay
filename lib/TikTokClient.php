<?php

class TikTokClient
{
    private const BASE = 'https://www.tikwm.com/api/';

    public function fetchByUrl(string $url): array
    {
        $response = $this->request(self::BASE . '?url=' . urlencode($url));
        $data = $response['data'] ?? null;

        if (!$data || empty($data['play'])) {
            throw new RuntimeException('Không lấy được dữ liệu từ TikTok');
        }

        return [
            'tiktok_id' => $data['aweme_id'] ?? extract_tiktok_id($url) ?? uniqid('tt_', true),
            'caption' => $data['title'] ?? '',
            'download_url' => $data['play'],
            'cover' => $data['cover'] ?? null,
        ];
    }

    public function fetchUserFeed(string $username, int $count = 5, int $cursor = 0): array
    {
        $username = ltrim($username, '@');
        $response = $this->request(sprintf(
            '%suser/posts?unique_id=%s&count=%d&cursor=%d',
            self::BASE,
            urlencode($username),
            $count,
            $cursor
        ));

        return $this->mapFeedData($response);
    }

    public function fetchTagFeed(string $tag, int $count = 5, int $cursor = 0): array
    {
        $tag = ltrim($tag, '#');
        $response = $this->request(sprintf(
            '%stag/posts?tag=%s&count=%d&cursor=%d',
            self::BASE,
            urlencode($tag),
            $count,
            $cursor
        ));

        return $this->mapFeedData($response);
    }

    public function downloadTo(string $downloadUrl, string $destination): string
    {
        $fh = fopen($destination, 'w+');

        $ch = curl_init($downloadUrl);
        curl_setopt_array($ch, [
            CURLOPT_FILE => $fh,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ReupBot/1.0)',
        ]);

        if (!curl_exec($ch)) {
            fclose($fh);
            throw new RuntimeException('Không tải được video: ' . curl_error($ch));
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fh);

        if ($status >= 400) {
            throw new RuntimeException('TikTok trả về lỗi HTTP ' . $status);
        }

        return $destination;
    }

    private function request(string $url): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ReupBot/1.0)',
        ]);

        $result = curl_exec($ch);
        if ($result === false) {
            throw new RuntimeException('Lỗi kết nối TikTok: ' . curl_error($ch));
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status >= 400) {
            throw new RuntimeException('TikTok HTTP ' . $status);
        }

        $decoded = json_decode($result, true);
        if (!is_array($decoded) || ($decoded['code'] ?? 1) !== 0) {
            throw new RuntimeException('API TikTok trả dữ liệu không hợp lệ');
        }

        return $decoded;
    }

    private function mapFeedData(array $response): array
    {
        $feed = $response['data']['videos'] ?? [];
        $mapped = [];

        foreach ($feed as $item) {
            $mapped[] = [
                'tiktok_id' => $item['aweme_id'] ?? $item['video_id'] ?? uniqid('feed_', true),
                'caption' => $item['title'] ?? '',
                'download_url' => $item['play'] ?? $item['wmplay'] ?? null,
                'cover' => $item['cover'] ?? null,
                'url' => $item['url'] ?? $item['share_url'] ?? null,
            ];
        }

        return $mapped;
    }
}

