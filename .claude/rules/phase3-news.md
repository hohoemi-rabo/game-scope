---
paths:
  - "src/app/news/**"
  - "src/app/components/news/**"
  - "src/app/api/news/**"
  - "src/lib/utils/platform-colors.ts"
---

# Phase 3: ニュースDB化 + AI要約

ニュースをRSSから毎回取得する方式から**データベース保存方式**に変更。AI（Gemini 2.5 Flash）による日次要約機能。

## アーキテクチャ

```
RSS Feeds (10サイト)
  ↓ (毎日3:05 JST - sync-news Edge Function)
Supabase news テーブル (Upsert)
  ↓
Gemini 2.5 Flash API (AI要約生成)
  ↓
Supabase daily_digests テーブル
  ↓
API Routes (/api/news, /api/news/digests)
  ↓
Client (SWR) - 2軸フィルタリング（サイト名 + キーワード）
```

## sync-news Edge Function

- 実行: 毎日3:05 JST（Supabase Cron Job）
- 処理フロー:
  1. 10サイトのRSSを並列取得
  2. newsテーブルにUpsert（urlをキーに重複防止）
  3. 7日以上前のニュースを自動削除
  4. Gemini 2.5 Flash APIで要約生成（1リクエスト）
  5. daily_digestsテーブルに保存
  6. operation_logsに実行結果を記録

## RSSソース（10サイト）

- 4Gamer（PC、PlayStation、Switch、スマホ）
- Nintendo、PlayStation Blog
- Game*Spark、GAME Watch、GAMER

## AI要約（DailyDigestSection）

- 表示: ニュースページ上部にカード形式（常に展開）
- 内容: 各サイトごとの「今日のトレンド3行まとめ」
- 生成: Gemini 2.5 Flash（maxOutputTokens: 8192）
- キャッシュ: API Route で30分キャッシュ
- UI機能:
  - サイト別カラー背景 + ホバー時に枠線カラー変化
  - クリックでフィルター済み一覧へ遷移（`/news?site={category}#news-filter`）
  - 空の場合「本日の更新なし」表示
  - カラードット: タイトル横にサイトカラーのインジケーター表示

## ニュースサイト別カラーシステム

**重要**: 動的カラークラスを使用するため、`tailwind.config.ts` の `safelist` に登録が必須

- 実装: `src/lib/utils/platform-colors.ts`
- 関数: `getPlatformButtonColor()`, `getPlatformBadgeColor()`, `getPlatformBorderColor()`
- 10サイト別の固有カラー（4Gamer 5種、Nintendo、PlayStation Blog、Game*Spark、GAME Watch、GAMER）

## 環境変数（Supabase Edge Functions）

- `GEMINI_API_KEY` - Google AI Studio で取得
