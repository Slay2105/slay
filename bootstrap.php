<?php

$config = require __DIR__ . '/config.php';

date_default_timezone_set('UTC');

if (!is_dir(dirname($config['db_path']))) {
    mkdir(dirname($config['db_path']), 0775, true);
}

if (!is_dir($config['download_dir'])) {
    mkdir($config['download_dir'], 0775, true);
}

$pdo = new PDO('sqlite:' . $config['db_path']);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA journal_mode = wal;');

migrate($pdo);

function migrate(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fb_page_id TEXT NOT NULL,
            page_token TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'OK',
            error_count INTEGER NOT NULL DEFAULT 0,
            last_posted_at TEXT DEFAULT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            value TEXT NOT NULL,
            last_cursor TEXT DEFAULT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_id INTEGER NOT NULL,
            source_id INTEGER DEFAULT NULL,
            tiktok_id TEXT NOT NULL,
            tiktok_url TEXT NOT NULL,
            caption TEXT DEFAULT NULL,
            facebook_post_id TEXT DEFAULT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            error_count INTEGER NOT NULL DEFAULT 0,
            last_attempt_at TEXT DEFAULT NULL,
            posted_at TEXT DEFAULT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(page_id, tiktok_id),
            FOREIGN KEY(page_id) REFERENCES pages(id),
            FOREIGN KEY(source_id) REFERENCES sources(id)
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ");
}

