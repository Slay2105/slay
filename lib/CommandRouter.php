<?php

require_once __DIR__ . '/ReupService.php';

class CommandRouter
{
    private ReupService $service;
    private array $config;

    public function __construct(ReupService $service, array $config)
    {
        $this->service = $service;
        $this->config = $config;
    }

    public function handle(string $rawCommand): array
    {
        $command = sanitize_command($rawCommand);
        if ($command === '') {
            return respond(['type' => 'error', 'message' => 'Vui lòng nhập lệnh']);
        }

        $parts = $this->tokenize($command);
        $action = strtolower($parts[0] ?? '');

        try {
            return match ($action) {
                '/addpage' => $this->handleAddPage($parts),
                '/listpages' => ['type' => 'list', 'message' => 'Danh sách page', 'data' => $this->service->listPages()],
                '/removepage' => $this->handleRemovePage($parts),
                '/addurl' => $this->handleAddSource($parts, 'url'),
                '/adduser' => $this->handleAddSource($parts, 'user'),
                '/addtag' => $this->handleAddSource($parts, 'tag'),
                '/listsources' => ['type' => 'list', 'message' => 'Danh sách nguồn', 'data' => $this->service->listSources()],
                '/removesource' => $this->handleRemoveSource($parts),
                '/post' => $this->handlePost($parts),
                '/scanpost' => $this->handleScan($parts),
                '/check' => ['type' => 'list', 'message' => 'Video chưa đăng', 'data' => $this->service->checkQueue()],
                '/stats' => ['type' => 'list', 'message' => 'Thống kê tổng quan', 'data' => $this->service->stats()],
                default => respond(['type' => 'error', 'message' => 'Lệnh không hỗ trợ: ' . $action]),
            };
        } catch (Throwable $e) {
            return respond(['type' => 'error', 'message' => $e->getMessage()]);
        }
    }

    private function handleAddPage(array $parts): array
    {
        if (count($parts) < 3) {
            throw new InvalidArgumentException('Cú pháp: /addpage <fb_page_id> <page_token>');
        }

        return $this->service->addPage($parts[1], $parts[2]);
    }

    private function handleRemovePage(array $parts): array
    {
        if (count($parts) < 2) {
            throw new InvalidArgumentException('Cú pháp: /removepage <page_id>');
        }

        return $this->service->removePage((int) $parts[1]);
    }

    private function handleAddSource(array $parts, string $type): array
    {
        if (count($parts) < 3) {
            throw new InvalidArgumentException(sprintf('Cú pháp: /add%s <page_id> <value>', $type === 'url' ? 'url' : $type));
        }

        return $this->service->addSource((int) $parts[1], $type, $parts[2]);
    }

    private function handleRemoveSource(array $parts): array
    {
        if (count($parts) < 2) {
            throw new InvalidArgumentException('Cú pháp: /removesource <id>');
        }

        return $this->service->removeSource((int) $parts[1]);
    }

    private function handlePost(array $parts): array
    {
        if (count($parts) < 3) {
            throw new InvalidArgumentException('Cú pháp: /post <page_id> <tiktok_url>');
        }

        return $this->service->postNow((int) $parts[1], $parts[2]);
    }

    private function handleScan(array $parts): array
    {
        $limit = (int) ($parts[1] ?? $this->config['max_auto_posts']);
        $result = $this->service->scanSources($limit, false);

        return respond([
            'type' => 'success',
            'message' => sprintf('Đã quét %d video, đăng thành công %d.', $result['attempted'], $result['posted']),
            'errors' => $result['errors'],
        ]);
    }

    private function tokenize(string $command): array
    {
        preg_match_all('/"([^"]*)"|\'([^\']*)\'|(\S+)/', $command, $matches);
        $parts = [];

        foreach ($matches[0] as $index => $value) {
            $part = $matches[1][$index] ?? $matches[2][$index] ?? $matches[3][$index] ?? '';
            if ($part !== '') {
                $parts[] = $part;
            }
        }

        return $parts;
    }
}

