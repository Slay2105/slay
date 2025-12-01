<?php

class FacebookClient
{
    private string $graphBase;

    public function __construct(string $graphBase)
    {
        $this->graphBase = rtrim($graphBase, '/') . '/';
    }

    public function uploadVideo(string $pageId, string $pageToken, string $videoPath, string $description = ''): array
    {
        if (!file_exists($videoPath)) {
            throw new InvalidArgumentException('Không tìm thấy file video để đăng');
        }

        $url = $this->graphBase . $pageId . '/videos';

        $ch = curl_init($url);
        $postFields = [
            'access_token' => $pageToken,
            'description' => $description,
            'source' => new CURLFile($videoPath, 'video/mp4', basename($videoPath)),
        ];

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
        ]);

        $response = curl_exec($ch);
        if ($response === false) {
            throw new RuntimeException('Không kết nối được Facebook: ' . curl_error($ch));
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status >= 400) {
            throw new RuntimeException('Facebook trả về lỗi HTTP ' . $status . ': ' . $response);
        }

        $decoded = json_decode($response, true);
        if (!isset($decoded['id'])) {
            throw new RuntimeException('Không nhận được ID video từ Facebook: ' . $response);
        }

        return $decoded;
    }
}

