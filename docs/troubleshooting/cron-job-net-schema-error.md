# Cron Job "schema net does not exist" エラーの解決

**発生日時**: 2025-11-05
**影響範囲**: 自動更新システムが実行されない
**重要度**: 高

## 問題の症状

- 自動更新が毎日午前3時（JST）に実行されない
- `operation_logs` テーブルに新しいログが記録されない
- Cron Jobは設定されているが、実行履歴を見ると失敗している

```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

**エラーメッセージ**:
```
ERROR: schema "net" does not exist
LINE 3: net.http_post(
        ^
```

## 原因

Cron Jobが `net.http_post()` 関数を呼び出そうとしているが、以下のいずれかの問題があった：

1. **pg_net拡張機能がインストールされていない**
   - Supabaseで `pg_net` 拡張機能が有効化されていない場合
   - `net` スキーマが存在しない

2. **Cron Jobの構文が不完全**
   - `net.http_post()` 関数に必要なパラメータが不足している
   - 古いバージョンのSupabaseでは関数シグネチャが異なる可能性

## 解決手順

### 1. pg_net拡張機能の確認

まず、`pg_net` 拡張機能がインストールされているか確認：

```sql
SELECT extname, extversion, nspname
FROM pg_extension
JOIN pg_namespace ON pg_extension.extnamespace = pg_namespace.oid
WHERE extname = 'pg_net';
```

**期待される結果**:
```
extname: pg_net
extversion: 0.19.5
nspname: extensions
```

インストールされていない場合：

```sql
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
```

### 2. netスキーマの存在確認

`net` スキーマが存在するか確認：

```sql
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'net';
```

存在しない場合は、`pg_net` 拡張機能のインストールが正しく完了していない可能性があります。

### 3. net.http_post()関数の正しいシグネチャを確認

```sql
SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'net' AND p.proname = 'http_post';
```

**期待される結果**:
```
function_name: http_post
arguments: url text, body jsonb DEFAULT '{}'::jsonb, params jsonb DEFAULT '{}'::jsonb,
           headers jsonb DEFAULT '{"Content-Type": "application/json"}'::jsonb,
           timeout_milliseconds integer DEFAULT 5000
```

### 4. 古いCron Jobの削除

```sql
SELECT cron.unschedule('sync-games-daily');
```

### 5. 正しい構文で新しいCron Jobを作成

```sql
SELECT cron.schedule(
  'sync-games-daily',
  '0 18 * * *',  -- UTC 18:00 = JST 03:00
  $$
  SELECT net.http_post(
    url := 'https://vhuhazlgqmuihejpiuyy.supabase.co/functions/v1/sync-games',
    body := '{}'::jsonb,
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    timeout_milliseconds := 90000
  ) as request_id;
  $$
);
```

**重要なポイント**:
- すべてのパラメータ（`url`, `body`, `params`, `headers`, `timeout_milliseconds`）を明示的に指定
- `body` と `params` は空でも `'{}'::jsonb` として指定
- `timeout_milliseconds` は Edge Function の実行時間に応じて調整（90秒推奨）
- `YOUR_ANON_KEY` は `.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY` を使用

### 6. 手動テストで動作確認

```sql
SELECT net.http_post(
  url := 'https://vhuhazlgqmuihejpiuyy.supabase.co/functions/v1/sync-games',
  body := '{}'::jsonb,
  params := '{}'::jsonb,
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_ANON_KEY'
  ),
  timeout_milliseconds := 90000
) as request_id;
```

**期待される結果**: `request_id: 1` などの数値が返る

### 7. operation_logsテーブルで実行を確認

数分後に `operation_logs` テーブルをチェック：

```sql
SELECT id, operation_type, status, message, created_at
FROM operation_logs
ORDER BY created_at DESC
LIMIT 5;
```

**期待される結果**:
```
status: success
message: 60件のゲームを同期しました
```

### 8. 次回の自動実行を待つ

次の実行時刻（翌日午前3時JST）後に、以下を確認：

```sql
-- Cron Job実行履歴
SELECT runid, jobid, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-games-daily')
ORDER BY start_time DESC
LIMIT 5;

-- 同期結果
SELECT * FROM operation_logs
ORDER BY created_at DESC
LIMIT 5;
```

## 予防策

1. **Cron Job作成時のチェックリスト**
   - [ ] `pg_net` 拡張機能がインストールされている
   - [ ] `net` スキーマが存在する
   - [ ] `net.http_post()` 関数のすべてのパラメータを指定
   - [ ] 手動テストで動作確認
   - [ ] `operation_logs` に正常なログが記録される

2. **定期的な監視**
   - 毎日午前3時以降に `operation_logs` テーブルを確認
   - `cron.job_run_details` で実行履歴を確認
   - ヘッダーの同期ステータス表示を確認

3. **ドキュメント参照**
   - [自動更新システム.md](../自動更新システム.md) - Cron Job管理の詳細

## 関連リンク

- [Supabase pg_net Documentation](https://supabase.com/docs/guides/database/extensions/pg_net)
- [PostgreSQL pg_cron Extension](https://github.com/citusdata/pg_cron)

## 解決確認

- [x] pg_net拡張機能がインストールされている
- [x] netスキーマが存在する
- [x] 正しい構文でCron Jobを作成
- [x] 手動テストで動作確認（request_id: 1）
- [x] operation_logsに新しいログが記録された（status: success）
- [ ] 次回の自動実行（翌日午前3時JST）で成功確認（待機中）
