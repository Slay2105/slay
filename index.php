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

function renderMessage(array $entry): string
{
    $result = $entry['result'];
    $type = $result['type'] ?? 'info';
    $message = htmlspecialchars($result['message'] ?? '');

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
        '<div class="log-item %s"><div><code>%s</code> <span>%s</span></div>%s</div>',
        htmlspecialchars($type),
        htmlspecialchars($entry['command']),
        $message,
        $details
    );
}

?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($config['app_name']); ?></title>
    <style>
        :root {
            font-family: "Inter", system-ui, sans-serif;
            color: #0f172a;
            background: #f8fafc;
        }

        body {
            margin: 0;
            padding: 32px;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
        }

        h1 {
            margin-bottom: 8px;
        }

        .card {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
        }

        form {
            display: flex;
            gap: 12px;
        }

        input[type="text"] {
            flex: 1;
            padding: 14px;
            border-radius: 10px;
            border: 1px solid #cbd5f5;
            font-size: 16px;
        }

        button {
            padding: 14px 18px;
            border-radius: 10px;
            border: none;
            background: #2563eb;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
        }

        th,
        td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }

        th {
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.08em;
            color: #64748b;
        }

        .log-item {
            padding: 10px 12px;
            border-radius: 10px;
            background: #f1f5f9;
            margin-bottom: 10px;
        }

        .log-item.success {
            border-left: 4px solid #22c55e;
        }

        .log-item.error {
            border-left: 4px solid #ef4444;
        }

        .log-item ul {
            margin: 6px 0 0 16px;
            padding: 0;
        }

        code {
            background: #e2e8f0;
            padding: 2px 6px;
            border-radius: 6px;
        }

        .help-commands code {
            display: inline-block;
            margin: 4px 6px 0 0;
        }

        .badge {
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 12px;
            background: #e0e7ff;
            color: #3730a3;
            text-transform: uppercase;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1><?php echo htmlspecialchars($config['app_name']); ?></h1>
        <p>Nhập lệnh theo format mô tả bên dưới để quản lý page & reup video TikTok lên Facebook.</p>

        <div class="card">
            <form method="POST">
                <input type="text" name="command" placeholder="Ví dụ: /addpage 123456 TOKEN" autofocus>
                <button type="submit">Gửi lệnh</button>
            </form>
            <div class="help-commands" style="margin-top:12px;">
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
                <p style="margin-top:12px;color:#0f766e;">
                    Auto mode: đã chạy scan gần nhất, đăng <?php echo htmlspecialchars((string) $autoLog['posted']); ?>/
                    <?php echo htmlspecialchars((string) $autoLog['attempted']); ?> video.
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
                                <td><span class="badge"><?php echo htmlspecialchars($page['status']); ?></span></td>
                                <td><?php echo (int) $page['error_count']; ?></td>
                                <td><?php echo htmlspecialchars($page['last_posted_at'] ?? '-'); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>

        <div class="card">
            <h2>Nguồn reup</h2>
            <?php if (!$sources): ?>
                <p>Chưa có nguồn.</p>
            <?php else: ?>
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
            <?php endif; ?>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Video chưa reup / bị lỗi</h3>
                <?php if (!$queue): ?>
                    <p>Không có video đang CHỜ.</p>
                <?php else: ?>
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
                                    <td><span class="badge"><?php echo htmlspecialchars($item['status']); ?></span></td>
                                    <td><?php echo (int) $item['error_count']; ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>

            <div class="card">
                <h3>Thống kê</h3>
                <?php if (!$stats): ?>
                    <p>Chưa có dữ liệu.</p>
                <?php else: ?>
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
                <?php endif; ?>
            </div>
        </div>

        <div class="card">
            <h2>Ghi chú triển khai</h2>
            <ul>
                <li>Chạy trên XAMPP / PHP >= 8.1 (cần bật extension PDO SQLite & cURL).</li>
                <li>Cấu hình SCAN_INTERVAL trong <code>config.php</code> để bật auto mode (giá trị giây).</li>
                <li>Token Facebook cần quyền <code>pages_read_engagement</code>, <code>pages_manage_posts</code>, <code>pages_show_list</code>.</li>
                <li>Server cần internet để tải video TikTok & upload lên Facebook.</li>
            </ul>
        </div>
    </div>
</body>

</html>

