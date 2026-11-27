<?php
/**
 * MorphBook Studio — publish a book and read it back.
 * Upload to: public_html/api/morphbook_api.php
 *
 *   POST ?action=publish   body: {"book": {...}, "id": "optional", "key": "optional"}
 *        -> {"ok":true,"id":"k3j9x0p2qa","key":"…","url":"https://site/apps/morphbook/?b=k3j9x0p2qa"}
 *        Sending the id + key of an earlier publish updates the same link.
 *   GET  ?action=get&id=k3j9x0p2qa  -> {"ok":true,"book":{...}}
 *
 * Books are stored as JSON one level ABOVE public_html (never reachable directly):
 *   <home>/morphbook_books/<id>.json
 * The Studio cleans every book again before showing it (no scripts, no outside links).
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');

const MAX_BYTES = 8 * 1024 * 1024;    // a book with a few pictures is 0.2–3 MB
const MAX_PAGES = 200;
const PER_HOUR  = 30;                 // publishes per visitor per hour

function out(array $a, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(int $code, string $msg): void { out(['ok' => false, 'error' => $msg], $code); }

$store = getenv('MORPHBOOK_STORE') ?: dirname((string)($_SERVER['DOCUMENT_ROOT'] ?? __DIR__ . '/..')) . '/morphbook_books';
if (!is_dir($store) && !@mkdir($store, 0750, true)) fail(500, 'storage');

$action = (string)($_GET['action'] ?? '');

if ($action === 'get') {
    $id = (string)($_GET['id'] ?? '');
    if (!preg_match('/^[a-z0-9]{10}$/', $id)) fail(400, 'bad id');
    $file = "$store/$id.json";
    if (!is_file($file)) fail(404, 'not found');
    $rec = json_decode((string)file_get_contents($file), true);
    if (!is_array($rec) || !isset($rec['book'])) fail(500, 'damaged');
    out(['ok' => true, 'book' => $rec['book'], 'updated' => $rec['updated'] ?? null]);
}

if ($action === 'publish') {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail(405, 'POST only');
    $len = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($len > MAX_BYTES) fail(413, 'too big');
    $raw = (string)file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
    if (strlen($raw) > MAX_BYTES) fail(413, 'too big');
    $in = json_decode($raw, true);
    $book = is_array($in) ? ($in['book'] ?? null) : null;
    if (!is_array($book) || !isset($book['pages']) || !is_array($book['pages'])) fail(400, 'not a book');
    $n = count($book['pages']);
    if ($n < 2 || $n > MAX_PAGES) fail(400, 'not a book');

    // a light limit per visitor (no personal data kept: only a hash of the address)
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '0');
    $rateDir = "$store/.rate";
    if (!is_dir($rateDir)) @mkdir($rateDir, 0750, true);
    $rateFile = $rateDir . '/' . hash('sha256', $ip . '|morphbook') . '.json';
    $now = time();
    $hits = is_file($rateFile) ? (json_decode((string)file_get_contents($rateFile), true) ?: []) : [];
    $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - 3600));
    if (count($hits) >= PER_HOUR) fail(429, 'too many');
    $hits[] = $now;
    @file_put_contents($rateFile, json_encode($hits), LOCK_EX);

    $id  = (string)($in['id'] ?? '');
    $key = (string)($in['key'] ?? '');
    $created = $now;
    if ($id !== '' && preg_match('/^[a-z0-9]{10}$/', $id) && is_file("$store/$id.json")) {
        $old = json_decode((string)file_get_contents("$store/$id.json"), true) ?: [];
        if (!hash_equals((string)($old['keyHash'] ?? ''), hash('sha256', $key))) fail(403, 'wrong key');
        $created = (int)($old['created'] ?? $now);
    } else {
        $alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        do {
            $id = '';
            foreach (str_split(random_bytes(10)) as $c) $id .= $alphabet[ord($c) % 36];
        } while (is_file("$store/$id.json"));
        $key = bin2hex(random_bytes(16));
    }

    $rec = ['book' => $book, 'keyHash' => hash('sha256', $key), 'created' => $created, 'updated' => $now];
    $tmp = "$store/$id.json.tmp" . bin2hex(random_bytes(3));
    if (file_put_contents($tmp, json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) === false || !rename($tmp, "$store/$id.json")) {
        @unlink($tmp);
        fail(500, 'could not save');
    }
    $host = preg_replace('/[^a-z0-9.\-:]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'ai4edutech.com'));
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https' ? 'https' : 'http';
    out(['ok' => true, 'id' => $id, 'key' => $key, 'url' => "$scheme://$host/apps/morphbook/?b=$id"]);
}

fail(400, 'unknown action');
