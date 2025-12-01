<?php

session_start();

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/lib/CommandRouter.php';

$service = new ReupService($pdo, $config);
$router = new CommandRouter($service, $config);

$autoLog = $service->autoScanIfNeeded();

if (!isset($_SESSION['history'])) {
    $_SESSION['history'] = [];
}

$flash = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $command = $_POST['command'] ?? '';
    $result = $router->handle($command);
    $entry = [
        'command' => $command,
        'result' => $result,
        'timestamp' => date('Y-m-d H:i:s'),
    ];

    $_SESSION['history'][] = $entry;
    $_SESSION['history'] = array_slice($_SESSION['history'], -20);
    $flash = $entry;
    header('Location: ' . $_SERVER['REQUEST_URI']);
    exit;
}

$history = array_reverse($_SESSION['history']);
$pages = $service->listPages();
$sources = $service->listSources();
$queue = $service->checkQueue();
$stats = $service->stats();

$totals = [
    'pages' => count($pages),
    'sources' => count($sources),
    'done' => array_sum(array_map(fn($row) => (int) ($row['done'] ?? 0), $stats)),
    'pending' => array_sum(array_map(fn($row) => (int) ($row['pending'] ?? 0), $stats)),
];

$commandPresets = [
    ['label' => 'List pages', 'command' => '/listpages'],
    ['label' => 'List sources', 'command' => '/listsources'],
    ['label' => 'Scan 5 videos', 'command' => '/scanpost 5'],
    ['label' => 'Check queue', 'command' => '/check'],
    ['label' => 'Stats overview', 'command' => '/stats'],
];

function renderMessage(array $entry): string
{
    $result = $entry['result'];
    $type = $result['type'] ?? 'info';
    $message = htmlspecialchars($result['message'] ?? '');
    $command = htmlspecialchars($entry['command']);

    $details = '';
    if (!empty($result['errors'])) {
        $details .= '<ul>';
        foreach ($result['errors'] as $err) {
            $details .= '<li>' . htmlspecialchars($err) . '</li>';
        }
        $details .= '</ul>';
    }

    if (($result['type'] ?? '') === 'list' && !empty($result['data'])) {
        $details .= '<pre>' . htmlspecialchars(json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';
    }

    return sprintf(
        '<div class="log-item %s"><div class="log-row"><code>%s</code><button type="button" class="copy-btn" data-copy="%s">Sao chép</button></div><span>%s</span>%s</div>',
        htmlspecialchars($type),
        $command,
        $command,
        $message,
        $details
    );
}

?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($config['app_name']); ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            font-family: "Inter", system-ui, sans-serif;
            color: #0f172a;
            background: #030712;
            --glass: rgba(15, 23, 42, 0.6);
            --glass-border: rgba(255, 255, 255, 0.08);
            --accent: #38bdf8;
            --accent-strong: #0ea5e9;
            --text-muted: #94a3b8;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            background: radial-gradient(circle at top, #0f172a, #020617);
            padding: 32px 18px 64px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            color: #e2e8f0;
        }

        h1 {
            margin-bottom: 4px;
            font-size: clamp(28px, 4vw, 42px);
        }

        p {
            color: var(--text-muted);
        }

        .hero {
            margin-bottom: 24px;
            padding: 32px;
            border-radius: 28px;
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(79, 70, 229, 0.15));
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
        }

        .hero::after {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.35), transparent 55%);
            pointer-events: none;
        }

        .hero > * {
            position: relative;
            z-index: 1;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin-top: 24px;
        }

        .stat-card {
            background: var(--glass);
            border-radius: 18px;
            padding: 18px;
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(16px);
        }

        .stat-label {
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 11px;
        }

        .stat-value {
            font-size: 30px;
            font-weight: 600;
            margin-top: 4px;
        }

        .card {
            background: var(--glass);
            border-radius: 26px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid var(--glass-border);
            box-shadow: 0 20px 60px rgba(2, 6, 23, 0.5);
            backdrop-filter: blur(18px);
        }

        form {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        input[type="text"] {
            flex: 1 1 280px;
            padding: 16px 18px;
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(15, 23, 42, 0.4);
            color: #e2e8f0;
            font-size: 17px;
        }

        input[type="text"]::placeholder {
            color: var(--text-muted);
        }

        button {
            padding: 16px 24px;
            border-radius: 16px;
            border: none;
            background: linear-gradient(135deg, #38bdf8, #6366f1);
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            flex: 0 0 auto;
        }

        button:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
        }

        .preset-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 18px;
        }

        .chip {
            padding: 8px 16px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(15, 23, 42, 0.3);
            color: #e2e8f0;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;
        }

        .chip:hover {
            background: rgba(56, 189, 248, 0.2);
            color: #fff;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 18px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
        }

        th,
        td {
            text-align: left;
            padding: 10px 6px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.25);
        }

        th {
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.08em;
            color: var(--text-muted);
        }

        .log-item {
            padding: 14px 16px;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.25);
            margin-bottom: 12px;
        }

        .log-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            flex-wrap: wrap;
        }

        .log-item.success {
            border-left: 4px solid #22c55e;
        }

        .log-item.error {
            border-left: 4px solid #ef4444;
        }

        .copy-btn {
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: transparent;
            color: #e2e8f0;
            border-radius: 10px;
            padding: 4px 10px;
            cursor: pointer;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .copy-btn:hover {
            border-color: var(--accent);
            color: var(--accent);
        }

        .log-item ul {
            margin: 10px 0 0 18px;
            padding: 0;
        }

        .log-item pre {
            margin-top: 8px;
            font-size: 13px;
            background: rgba(0, 0, 0, 0.2);
            padding: 10px;
            border-radius: 12px;
            overflow-x: auto;
        }

        code {
            background: rgba(15, 23, 42, 0.6);
            padding: 4px 8px;
            border-radius: 8px;
            border: 1px solid rgba(148, 163, 184, 0.25);
        }

        .badge {
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            letter-spacing: 0.05em;
            background: rgba(59, 130, 246, 0.15);
            color: #93c5fd;
            text-transform: uppercase;
        }

        .badge.wait {
            background: rgba(248, 113, 113, 0.15);
            color: #fecaca;
        }

        .badge.ok {
            background: rgba(34, 197, 94, 0.15);
            color: #86efac;
        }

        .table-scroll {
            overflow-x: auto;
            padding-bottom: 6px;
        }

        .table-scroll table {
            min-width: 520px;
        }

        .help-commands code {
            display: inline-block;
            margin: 4px 6px 0 0;
        }

        .toast {
            position: fixed;
            right: 24px;
            bottom: 24px;
            padding: 14px 18px;
            border-radius: 14px;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.3);
            color: #e2e8f0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
            z-index: 999;
        }

        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        @media (max-width: 640px) {
            button {
                width: 100%;
            }

            form {
                flex-direction: column;
            }

            .card {
                padding: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="hero">
            <h1><?php echo htmlspecialchars($config['app_name']); ?></h1>
            <p>Trung tâm điều khiển cho việc quét nguồn TikTok, quản lý fanpage Facebook và reup tự động với chế độ chờ thông minh.</p>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Page đang quản lý</div>
                    <div class="stat-value"><?php echo $totals['pages']; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Nguồn reup</div>
                    <div class="stat-value"><?php echo $totals['sources']; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Video đã đăng</div>
                    <div class="stat-value"><?php echo $totals['done']; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Video đang chờ</div>
                    <div class="stat-value"><?php echo $totals['pending']; ?></div>
                </div>
            </div>
        </div>

        <div class="card">
            <form method="POST">
                <input type="text" name="command" placeholder="Ví dụ: /addpage 123456 TOKEN" autofocus>
                <button type="submit">Gửi lệnh</button>
            </form>
            <div class="preset-chips" data-command-chips>
                <?php foreach ($commandPresets as $chip): ?>
                    <div class="chip" data-command="<?php echo htmlspecialchars($chip['command']); ?>">
                        <?php echo htmlspecialchars($chip['label']); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="help-commands" style="margin-top:18px;">
                <strong>Lệnh có sẵn:</strong><br>
                <code>/addpage &lt;fb_page_id&gt; &lt;page_token&gt;</code>
                <code>/listpages</code>
                <code>/removepage &lt;id&gt;</code>
                <code>/addurl &lt;page_id&gt; &lt;tiktok_url&gt;</code>
                <code>/adduser &lt;page_id&gt; &lt;username&gt;</code>
                <code>/addtag &lt;page_id&gt; &lt;tag&gt;</code>
                <code>/listsources</code>
                <code>/removesource &lt;id&gt;</code>
                <code>/post &lt;page_id&gt; &lt;tiktok_url&gt;</code>
                <code>/scanpost [limit]</code>
                <code>/check</code>
                <code>/stats</code>
            </div>
            <?php if ($autoLog): ?>
                <p style="margin-top:14px;color:#10b981;">
                    Auto mode đang bật: scan gần nhất đăng <?php echo htmlspecialchars((string) $autoLog['posted']); ?> /
                    <?php echo htmlspecialchars((string) $autoLog['attempted']); ?> video.
                </p>
            <?php else: ?>
                <p style="margin-top:14px;color:#fbbf24;">
                    Auto mode đang tắt (SCAN_INTERVAL = 0). Cập nhật <code>config.php</code> nếu muốn chạy định kỳ.
                </p>
            <?php endif; ?>
        </div>

        <div class="card">
            <h2>Lịch sử lệnh gần nhất</h2>
            <?php if (!$history): ?>
                <p>Chưa có lệnh nào.</p>
            <?php else: ?>
                <?php foreach ($history as $entry): ?>
                    <?php echo renderMessage($entry); ?>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <div class="card">
            <h2>Danh sách page</h2>
            <?php if (!$pages): ?>
                <p>Chưa có page.</p>
            <?php else: ?>
                <div class="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>FB Page ID</th>
                                <th>Trạng thái</th>
                                <th>Lỗi</th>
                                <th>Lần đăng gần nhất</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($pages as $page): ?>
                                <tr>
                                    <td><?php echo (int) $page['id']; ?></td>
                                    <td><?php echo htmlspecialchars($page['fb_page_id']); ?></td>
                                    <td>
                                        <span class="badge <?php echo $page['status'] === 'OK' ? 'ok' : 'wait'; ?>">
                                            <?php echo htmlspecialchars($page['status']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo (int) $page['error_count']; ?></td>
                                    <td><?php echo htmlspecialchars($page['last_posted_at'] ?? '-'); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>

        <div class="card">
            <h2>Nguồn reup</h2>
            <?php if (!$sources): ?>
                <p>Chưa có nguồn.</p>
            <?php else: ?>
                <div class="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Page</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($sources as $source): ?>
                                <tr>
                                    <td><?php echo (int) $source['id']; ?></td>
                                    <td><?php echo htmlspecialchars($source['fb_page_id']); ?></td>
                                    <td><?php echo htmlspecialchars($source['type']); ?></td>
                                    <td><?php echo htmlspecialchars($source['value']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Video chưa reup / bị lỗi</h3>
                <?php if (!$queue): ?>
                    <p>Không có video đang CHỜ.</p>
                <?php else: ?>
                    <div class="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>TikTok</th>
                                    <th>Trạng thái</th>
                                    <th>Lỗi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($queue as $item): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($item['fb_page_id']); ?></td>
                                        <td><a href="<?php echo htmlspecialchars($item['tiktok_url']); ?>" target="_blank"><?php echo htmlspecialchars($item['tiktok_id']); ?></a></td>
                                        <td>
                                            <span class="badge <?php echo $item['status'] === 'OK' ? 'ok' : 'wait'; ?>">
                                                <?php echo htmlspecialchars($item['status']); ?>
                                            </span>
                                        </td>
                                        <td><?php echo (int) $item['error_count']; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>

            <div class="card">
                <h3>Thống kê</h3>
                <?php if (!$stats): ?>
                    <p>Chưa có dữ liệu.</p>
                <?php else: ?>
                    <div class="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Đã đăng</th>
                                    <th>Đang chờ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($stats as $row): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($row['fb_page_id']); ?></td>
                                        <td><?php echo (int) $row['done']; ?></td>
                                        <td><?php echo (int) $row['pending']; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <div class="card">
            <h2>Ghi chú triển khai</h2>
            <ul>
                <li>Chạy trên XAMPP / PHP >= 8.1 (bật extension PDO SQLite & cURL).</li>
                <li>Cấu hình <code>SCAN_INTERVAL</code> trong <code>config.php</code> để bật auto mode.</li>
                <li>Token Facebook cần quyền <code>pages_read_engagement</code>, <code>pages_manage_posts</code>, <code>pages_show_list</code>.</li>
                <li>Server cần internet để tải video TikTok & upload lên Facebook.</li>
            </ul>
        </div>
    </div>
    <script>
        const chips = document.querySelectorAll('[data-command-chips] .chip');
        const input = document.querySelector('input[name="command"]');
        const toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
        let toastTimeout;

        function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
        }

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const cmd = chip.getAttribute('data-command');
                if (!input) return;
                input.value = cmd;
                input.focus();
                showToast('Đã điền lệnh nhanh');
            });
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const cmd = btn.getAttribute('data-copy') || '';
                try {
                    await navigator.clipboard.writeText(cmd);
                    showToast('Đã sao chép lệnh');
                } catch (err) {
                    showToast('Không thể sao chép');
                }
            });
        });
    </script>
</body>

</html>

