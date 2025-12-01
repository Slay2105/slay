<?php

require_once __DIR__ . '/Helpers.php';
require_once __DIR__ . '/TikTokClient.php';
require_once __DIR__ . '/FacebookClient.php';

class ReupService
{
    private const PAGE_WAIT_STATUS = 'CHO';
    private const PAGE_OK_STATUS = 'OK';
    private const VIDEO_OK_STATUS = 'OK';
    private const VIDEO_PENDING_STATUS = 'PENDING';
    private const VIDEO_WAIT_STATUS = 'CHO';
    private const VIDEO_FAIL_STATUS = 'FAILED';
    private const MAX_ERRORS = 3;

    private PDO $pdo;
    private array $config;
    private TikTokClient $tikTok;
    private FacebookClient $facebook;

    public function __construct(PDO $pdo, array $config)
    {
        $this->pdo = $pdo;
        $this->config = $config;
        $this->tikTok = new TikTokClient();
        $this->facebook = new FacebookClient($config['fb_graph_api']);
    }

    public function addPage(string $fbPageId, string $token): array
    {
        $now = now();
        $stmt = $this->pdo->prepare('INSERT INTO pages (fb_page_id, page_token, created_at, updated_at) VALUES (:fb_page_id, :page_token, :created_at, :updated_at)');
        $stmt->execute([
            ':fb_page_id' => $fbPageId,
            ':page_token' => $token,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);

        return respond(['type' => 'success', 'message' => 'Đã thêm page mới #' . $this->pdo->lastInsertId()]);
    }

    public function listPages(): array
    {
        $stmt = $this->pdo->query('SELECT id, fb_page_id, status, error_count, last_posted_at, created_at FROM pages ORDER BY id ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function removePage(int $id): array
    {
        $stmt = $this->pdo->prepare('DELETE FROM pages WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return respond(['type' => 'success', 'message' => 'Đã xoá page #' . $id]);
    }

    public function addSource(int $pageId, string $type, string $value): array
    {
        $page = $this->getPage($pageId);
        if (!$page) {
            throw new InvalidArgumentException('Page không tồn tại');
        }

        $now = now();
        $stmt = $this->pdo->prepare('INSERT INTO sources (page_id, type, value, created_at, updated_at) VALUES (:page_id, :type, :value, :created_at, :updated_at)');
        $stmt->execute([
            ':page_id' => $pageId,
            ':type' => $type,
            ':value' => $value,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);

        return respond(['type' => 'success', 'message' => 'Đã thêm nguồn #' . $this->pdo->lastInsertId()]);
    }

    public function listSources(): array
    {
        $stmt = $this->pdo->query('
            SELECT s.id, s.type, s.value, s.page_id, p.fb_page_id
            FROM sources s
            JOIN pages p ON s.page_id = p.id
            ORDER BY s.id ASC
        ');

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function removeSource(int $id): array
    {
        $stmt = $this->pdo->prepare('DELETE FROM sources WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return respond(['type' => 'success', 'message' => 'Đã xoá nguồn #' . $id]);
    }

    public function postNow(int $pageId, string $tiktokUrl): array
    {
        $page = $this->getPage($pageId);
        if (!$page) {
            throw new InvalidArgumentException('Page không hợp lệ');
        }

        if ($page['status'] === self::PAGE_WAIT_STATUS) {
            throw new RuntimeException('Page đang ở trạng thái CHỜ, kiểm tra lại token hoặc lỗi trước đó');
        }

        $metadata = $this->tikTok->fetchByUrl($tiktokUrl);
        $metadata['url'] = $tiktokUrl;

        $result = $this->publish($page, $metadata, null, false);

        return respond(['type' => 'success', 'message' => $result]);
    }

    public function scanSources(int $maxVideos, bool $auto = false): array
    {
        $sources = $this->pdo->query('
            SELECT s.*, p.fb_page_id, p.page_token, p.status
            FROM sources s
            JOIN pages p ON s.page_id = p.id
            ORDER BY s.id ASC
        ')->fetchAll(PDO::FETCH_ASSOC);

        if (!$sources) {
            return [
                'attempted' => 0,
                'posted' => 0,
                'errors' => ['Chưa có nguồn nào'],
            ];
        }

        $posted = 0;
        $attempted = 0;
        $errors = [];

        foreach ($sources as $source) {
            if ($posted >= $maxVideos) {
                break;
            }

            if ($source['status'] === self::PAGE_WAIT_STATUS) {
                continue;
            }

            try {
                $videos = $this->resolveSourceVideos($source);
            } catch (Throwable $e) {
                $errors[] = sprintf('Nguồn #%d lỗi: %s', $source['id'], $e->getMessage());
                continue;
            }

            foreach ($videos as $video) {
                if ($posted >= $maxVideos) {
                    break;
                }

                $attempted++;

                try {
                    $page = $this->getPage((int) $source['page_id']);
                    if (!$page) {
                        continue;
                    }

                    $message = $this->publish($page, $video, (int) $source['id'], $auto);
                    $posted++;
                } catch (Throwable $e) {
                    $errors[] = sprintf('Page #%d nguồn #%d: %s', $source['page_id'], $source['id'], $e->getMessage());
                }
            }
        }

        return [
            'attempted' => $attempted,
            'posted' => $posted,
            'errors' => $errors,
        ];
    }

    public function checkQueue(): array
    {
        $stmt = $this->pdo->prepare('
            SELECT v.id, v.tiktok_id, v.tiktok_url, v.status, v.error_count, v.updated_at, p.fb_page_id
            FROM videos v
            JOIN pages p ON v.page_id = p.id
            WHERE v.status != :status
            ORDER BY v.updated_at DESC
        ');
        $stmt->execute([':status' => self::VIDEO_OK_STATUS]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function stats(): array
    {
        $stmt = $this->pdo->query('
            SELECT
                p.fb_page_id,
                SUM(CASE WHEN v.status = "OK" THEN 1 ELSE 0 END) AS done,
                SUM(CASE WHEN v.status != "OK" THEN 1 ELSE 0 END) AS pending
            FROM pages p
            LEFT JOIN videos v ON v.page_id = p.id
            GROUP BY p.id
        ');

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function autoScanIfNeeded(): ?array
    {
        $interval = (int) ($this->config['scan_interval'] ?? 0);
        if ($interval <= 0) {
            return null;
        }

        $lastRun = $this->getSetting('last_auto_scan');
        $nowTs = time();

        if ($lastRun && ($nowTs - (int) $lastRun) < $interval) {
            return null;
        }

        $result = $this->scanSources((int) $this->config['max_auto_posts'], true);
        $this->setSetting('last_auto_scan', (string) $nowTs);

        return $result;
    }

    private function publish(array $page, array $metadata, ?int $sourceId, bool $auto): string
    {
        if (empty($metadata['download_url'])) {
            throw new RuntimeException('Video không có link tải hợp lệ');
        }

        $tiktokId = $metadata['tiktok_id'] ?? extract_tiktok_id($metadata['url'] ?? '') ?? uniqid('tt_', true);
        $tiktokUrl = $metadata['url'] ?? 'https://www.tiktok.com/@unknown/video/' . $tiktokId;

        $video = $this->getVideo($page['id'], $tiktokId);
        if ($video && $video['status'] === self::VIDEO_OK_STATUS) {
            return 'Video đã đăng trước đó (ID ' . $tiktokId . ')';
        }

        if ($video && (int) $video['error_count'] >= self::MAX_ERRORS && $video['status'] === self::VIDEO_WAIT_STATUS) {
            return 'Video đang ở trạng thái CHỜ do lỗi trước đó (ID ' . $tiktokId . ')';
        }

        $fileName = sprintf('%s/%s-%s.mp4', $this->config['download_dir'], $tiktokId, uniqid());

        try {
            $this->tikTok->downloadTo($metadata['download_url'], $fileName);

            try {
                $fbResponse = $this->facebook->uploadVideo(
                    $page['fb_page_id'],
                    $page['page_token'],
                    $fileName,
                    $metadata['caption'] ?? ''
                );
            } finally {
                if (file_exists($fileName)) {
                    @unlink($fileName);
                }
            }
        } catch (Throwable $e) {
            $this->upsertVideoRecord(
                $page['id'],
                $sourceId,
                $tiktokId,
                $tiktokUrl,
                $metadata['caption'] ?? '',
                null,
                false
            );
            $this->markPageError($page['id']);
            throw $e;
        }

        $this->upsertVideoRecord($page['id'], $sourceId, $tiktokId, $tiktokUrl, $metadata['caption'] ?? '', $fbResponse['id'] ?? null, true);
        $this->resetPageErrors($page['id']);

        return sprintf('Đăng thành công video %s lên page %s', $tiktokId, $page['fb_page_id']);
    }

    private function upsertVideoRecord(
        int $pageId,
        ?int $sourceId,
        string $tiktokId,
        string $tiktokUrl,
        string $caption,
        ?string $facebookPostId,
        bool $success
    ): void {
        $existing = $this->getVideo($pageId, $tiktokId);
        $now = now();

        if ($existing) {
            $stmt = $this->pdo->prepare('
                UPDATE videos
                SET source_id = :source_id,
                    caption = :caption,
                    facebook_post_id = COALESCE(:facebook_post_id, facebook_post_id),
                    status = :status,
                    error_count = CASE WHEN :success = 1 THEN 0 ELSE error_count + 1 END,
                    last_attempt_at = :last_attempt_at,
                    posted_at = CASE WHEN :success = 1 THEN :posted_at ELSE posted_at END,
                    updated_at = :updated_at
                WHERE id = :id
            ');
            $stmt->execute([
                ':source_id' => $sourceId,
                ':caption' => $caption,
                ':facebook_post_id' => $facebookPostId,
                ':status' => $success ? self::VIDEO_OK_STATUS : $this->resolveVideoStatus($existing),
                ':success' => $success ? 1 : 0,
                ':last_attempt_at' => $now,
                ':posted_at' => $success ? $now : null,
                ':updated_at' => $now,
                ':id' => $existing['id'],
            ]);
        } else {
            $stmt = $this->pdo->prepare('
                INSERT INTO videos
                (page_id, source_id, tiktok_id, tiktok_url, caption, facebook_post_id, status, error_count, last_attempt_at, posted_at, created_at, updated_at)
                VALUES
                (:page_id, :source_id, :tiktok_id, :tiktok_url, :caption, :facebook_post_id, :status, :error_count, :last_attempt_at, :posted_at, :created_at, :updated_at)
            ');
            $stmt->execute([
                ':page_id' => $pageId,
                ':source_id' => $sourceId,
                ':tiktok_id' => $tiktokId,
                ':tiktok_url' => $tiktokUrl,
                ':caption' => $caption,
                ':facebook_post_id' => $facebookPostId,
                ':status' => $success ? self::VIDEO_OK_STATUS : self::VIDEO_FAIL_STATUS,
                ':error_count' => $success ? 0 : 1,
                ':last_attempt_at' => $now,
                ':posted_at' => $success ? $now : null,
                ':created_at' => $now,
                ':updated_at' => $now,
            ]);
        }
    }

    private function resolveSourceVideos(array $source): array
    {
        return match ($source['type']) {
            'url' => [
                array_merge($this->tikTok->fetchByUrl($source['value']), ['url' => $source['value']])
            ],
            'user' => $this->prependUrl($this->tikTok->fetchUserFeed($source['value']), 'user', $source['value']),
            'tag' => $this->prependUrl($this->tikTok->fetchTagFeed($source['value']), 'tag', $source['value']),
            default => throw new InvalidArgumentException('Loại nguồn không hỗ trợ: ' . $source['type']),
        };
    }

    private function prependUrl(array $videos, string $type, string $value): array
    {
        $result = [];
        foreach ($videos as $video) {
            $video['url'] = $video['url'] ?? $this->buildTikTokUrl($type, $value, $video['tiktok_id']);
            $result[] = $video;
        }

        return $result;
    }

    private function buildTikTokUrl(string $type, string $value, string $tiktokId): string
    {
        return match ($type) {
            'user' => sprintf('https://www.tiktok.com/@%s/video/%s', ltrim($value, '@'), $tiktokId),
            'tag' => sprintf('https://www.tiktok.com/tag/%s/video/%s', ltrim($value, '#'), $tiktokId),
            default => 'https://www.tiktok.com/video/' . $tiktokId,
        };
    }

    private function resolveVideoStatus(array $video): string
    {
        $errors = (int) $video['error_count'] + 1;
        if ($errors >= self::MAX_ERRORS) {
            return self::VIDEO_WAIT_STATUS;
        }

        return self::VIDEO_FAIL_STATUS;
    }

    private function resetPageErrors(int $pageId): void
    {
        $stmt = $this->pdo->prepare('UPDATE pages SET error_count = 0, status = :status, updated_at = :updated_at, last_posted_at = :last_posted_at WHERE id = :id');
        $stmt->execute([
            ':status' => self::PAGE_OK_STATUS,
            ':updated_at' => now(),
            ':last_posted_at' => now(),
            ':id' => $pageId,
        ]);
    }

    private function markPageError(int $pageId): void
    {
        $page = $this->getPage($pageId);
        if (!$page) {
            return;
        }

        $errors = (int) $page['error_count'] + 1;
        $status = $errors >= self::MAX_ERRORS ? self::PAGE_WAIT_STATUS : $page['status'];

        $stmt = $this->pdo->prepare('UPDATE pages SET error_count = :error_count, status = :status, updated_at = :updated_at WHERE id = :id');
        $stmt->execute([
            ':error_count' => $errors,
            ':status' => $status,
            ':updated_at' => now(),
            ':id' => $pageId,
        ]);
    }

    private function getPage(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM pages WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $page = $stmt->fetch(PDO::FETCH_ASSOC);

        return $page ?: null;
    }

    private function getVideo(int $pageId, string $tiktokId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM videos WHERE page_id = :page_id AND tiktok_id = :tiktok_id');
        $stmt->execute([
            ':page_id' => $pageId,
            ':tiktok_id' => $tiktokId,
        ]);

        $video = $stmt->fetch(PDO::FETCH_ASSOC);
        return $video ?: null;
    }

    private function getSetting(string $key): ?string
    {
        $stmt = $this->pdo->prepare('SELECT value FROM settings WHERE key = :key');
        $stmt->execute([':key' => $key]);
        $value = $stmt->fetchColumn();

        return $value !== false ? $value : null;
    }

    private function setSetting(string $key, string $value): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO settings (key, value) VALUES (:key, :value)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value');
        $stmt->execute([':key' => $key, ':value' => $value]);
    }
}

