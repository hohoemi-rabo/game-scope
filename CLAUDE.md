# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**詳細なルールは `.claude/rules/` に分割管理**（対象ファイル編集時のみ自動読み込み）

## プロジェクト概要

**GameScope（ゲームスコープ）** - 日本語で話題のゲームの評判と雰囲気が3秒でわかるゲーム情報サイト

### コンセプト
海外中心のゲーム評価データ(OpenCritic, Twitch等)を日本語でわかりやすく可視化し、一般ゲーマーに対して直感的かつ迅速に「どんなゲームか」を理解できる体験を提供する。

### 開発段階
- **現在**: Phase 1〜3 完了
- Claude Code でのペアプログラミングを前提とした開発

## 技術スタック

- **Next.js 15.5.7** (App Router, Turbopack) / **React 19** / **TypeScript** (strict mode)
- **Tailwind CSS 3.4.17** / **SWR** (クライアント側データフェッチング)
- **Supabase** (Database, Auth, Edge Functions, Scheduler) - MCP Server統合
- **Vercel** (デプロイ済み: https://www.gamescope.jp)
- **Phase 2追加**: Supabase Auth (Google OAuth), RLS, Server Actions, DeepL API, react-hot-toast
- **Phase 3追加**: Google Gemini API (gemini-2.5-flash), Supabase Edge Functions + Cron Jobs

## 重要な開発コマンド

```bash
npm run dev          # 開発サーバー起動 (Turbopack, http://localhost:3000)
npm run build        # プロダクションビルド
npm run lint && npm run build  # 型チェック＋ビルド（デプロイ前）
npm run supabase:types         # Supabase 型定義の再生成
npx tsx scripts/sync-hybrid-to-supabase.ts  # ハイブリッドデータ同期
./scripts/trigger-sync.sh                   # Edge Function手動トリガー
```

## アーキテクチャ概要

```
外部API (OpenCritic, RAWG) → Supabase Database (キャッシュ層) → Next.js Server Components → Browser
                              ↑ 日次自動更新 (3AM JST: ゲーム同期, 3:05 JST: ニュース同期)
```

**キャッシュ戦略**: Supabase=外部APIキャッシュ / Edge Functions=日次自動更新 / API Routes=短時間キャッシュ

**ハイブリッドデータ統合**: OpenCritic (主データ: スコア、レビュー) + RAWG (補完: 説明文、ジャンル)
- 同期スクリプト: `scripts/sync-hybrid-to-supabase.ts`
- APIレート制限: OpenCritic 3回/日、RAWG 120回/日

**TypeScript設定**: Path Alias `@/*` → `./src/*` / Strict Mode有効 / `scripts/` は型チェック対象外

## 開発時の注意事項

### コーディング規約
- **コメント**: 日本語で「なぜ」を説明
- **型定義**: TypeScript strict mode 対応
- **エラーハンドリング**: 外部API呼び出しは必ず try-catch で囲む

### パフォーマンス規約
- **並列データ取得**: 独立したクエリは `Promise.all()` で並列化（ウォーターフォール防止）
- **遅延読み込み**: 初期レンダリングに不要な Client Component は `next/dynamic` で分離
- **RLSポリシー**: `auth.uid()` / `auth.role()` は必ず `(select ...)` で包む（行ごとの再評価防止）

### セキュリティ・法的遵守
- **スクレイピング禁止**: すべてのデータは公式API/RSS経由
- **出典明示**: 外部データには必ず出典リンクを表示
- **環境変数管理**: APIキーは `.env.local` で管理（コミット禁止）
- **RLS必須**: `public` スキーマの全テーブルに RLS を有効化
- **DB関数**: `SET search_path = public` を必ず指定

### トラブルシューティング
- 問題解決時は `docs/troubleshooting/` に記録を残す
- 自動更新の問題: `docs/自動更新システム.md` 参照
- 機能別チケット: `docs/tickets/`（連番_機能名.md 形式）

## 環境変数 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=      # Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENCRITIC_API_KEY=            # OpenCritic API (RapidAPI経由)
RAWG_API_KEY=                  # RAWG API
TWITCH_CLIENT_ID=              # Twitch API
TWITCH_CLIENT_SECRET=
DEEPL_API_KEY=                 # DeepL API（日本語→英語翻訳）
```

## 開発ワークフロー

1. チケット確認 → 2. 実装 → 3. `npm run lint && npm run build` → 4. 動作確認 → 5. エラー記録

## 現在の開発状況

- Phase 1 (MVP): 完了（高評価ゲーム一覧、詳細ページ）
- Phase 1.5〜1.7: 完了（検索、ニュース、Twitch連携、運用自動化）
- Phase 2 (Gaming ROI): 完了（認証、ダッシュボード、ポートフォリオCRUD）
- Phase 3 (ニュースDB化 + AI要約): 完了（RSS→DB保存、Gemini AI要約）

## 本番環境

- URL: https://www.gamescope.jp
- OGP画像: `public/og-image.png`（1200x630px）
- SNS: Instagram (@gamescope.jp) / X (@gamescope_jp)

## 参考資料

- [REQUIREMENTS.md](./REQUIREMENTS.md) - Phase 1 要件定義書
- [docs/REQUIREMENTS_PHASE2.md](./docs/REQUIREMENTS_PHASE2.md) - Phase 2 要件定義書
- [docs/news-database-design.md](./docs/news-database-design.md) - Phase 3 設計書
- [docs/tickets/](./docs/tickets/) - 機能別開発チケット
- [docs/自動更新システム.md](./docs/自動更新システム.md) - 運用ドキュメント
