---
paths:
  - "src/app/dashboard/**"
  - "src/app/components/dashboard/**"
  - "src/app/components/portfolio/**"
  - "src/app/components/auth/**"
  - "src/app/actions/portfolio.ts"
  - "src/lib/utils/cph.ts"
  - "src/lib/utils/profit.ts"
  - "src/lib/utils/status-notification.tsx"
  - "src/constants/platforms.ts"
---

# Phase 2: Gaming ROI / コスパ管理機能

ユーザーが購入したゲームの「金額」と「プレイ時間」を記録し、**CPH（Cost Per Hour: 時間あたりコスト）**を算出・可視化する機能。

**コンセプト**: ゲームを「消費」ではなく「投資」として捉え直し、ユーザーの自己肯定感を高める。

## 主要ルート・コンポーネント

- `/dashboard` - マイダッシュボード（サマリー + ゲームリスト）
- `/auth/callback` - OAuth コールバック
- `src/app/components/auth/` - 認証UI（LoginButton, UserMenu）
- `src/app/components/dashboard/` - DashboardSummary, MarketInsight, GameList, GameListItem, AddGameButton
- `src/app/components/portfolio/` - AddGameModal, SearchGamesStep, ManualEntryStep, EditGameModal, DeleteConfirmDialog

## Server Actions (`src/app/actions/portfolio.ts`)

- `createPortfolioEntry` / `updatePortfolioEntry` / `deletePortfolioEntry` / `updatePortfolioMemo`

## API Routes

- `/api/games/search` - RAWGゲーム検索（DeepL翻訳対応）
- `/api/games/register` - ゲーム登録（DB upsert、手動登録対応）

## CPH計算 (`src/lib/utils/cph.ts`)

- `calculateCPH()`, `calculateAverageCPH()`, `getDisplayRank()`, `getRankProgress()`
- `getNextRankInfo()`, `getCPHMetaphor()`, `getStockColor()`, `formatPlayTime()`

## CPHランク定義

| ランク | CPH範囲 | メタファー | アイコン |
|--------|---------|-----------|---------|
| God Tier | 0〜50円 | 実質無料 | 🏆 |
| Gold Tier | 51〜200円 | 缶コーヒー級 | 📉 |
| Silver Tier | 201〜500円 | ランチ級 | 📉 |
| Bronze Tier | 501〜1500円 | 映画館級 | 📉 |
| Luxury | 1501円〜 | 元が取れていません | 📉 |
| Premium | Luxury + Completed | 極上の体験 | ✨ |
| Loss Cut | Luxury + Dropped | 損切り | 📉 |
| Free | サブスク/無料 | 完全無料 | 🎁 |
| Unplayed | 未プレイ | 未開封 | 📦 |

## CPH Density Rule（濃密ゲーム救済ルール）

- 高単価（Luxury）でも「クリア済み」なら**Premium（紫色）**に昇格
- 高単価で「やめた」なら**Loss Cut（暗い赤）**で損切り扱い
- 両ケースでプログレスバー非表示（これ以上遊ぶ必要がない）

## もしも換算（Market Insight）(`src/lib/utils/profit.ts`)

一般的な娯楽（映画、カラオケ、飲み会）の平均コスト ¥1,000/時間 と比較。

**計算式**:
```
仮想コスト = 総プレイ時間 × ¥1,000/h
含み益 = 仮想コスト - 総支出
```

**表示状態**:
| 状態 | 条件 | テーマカラー |
|------|------|------------|
| 勝ち (profit) | 支出 < 仮想コスト | エメラルド |
| 先行投資中 (investing) | 支出 > 仮想コスト | ブルー |

**換算アイテム（日替わりランダム）**: ラーメン ¥900, スタバ ¥700, 10連ガチャ ¥3,000, 生ビール ¥500, 映画鑑賞 ¥1,900, うまい棒 ¥12, コンビニコーヒー ¥150, Netflix 1ヶ月 ¥990

**UI構造（VS天秤スタイル）**: 左=一般娯楽（否定）、中央=VSバッジ、右=GameScope（肯定）

## プラットフォーム選択 (`src/constants/platforms.ts`)

`PLATFORM_MASTER` 固定リスト方式（8種類）: pc, ps5, ps4, switch, xbox-series, xbox-one, smartphone, retro

## 投資戦略メモ

| ステータス | メモの役割 | プレースホルダー |
|-----------|-----------|-----------------|
| プレイ中 | 次の目標設定 | 「次の目標を入力...」 |
| クリア済み | 投資評価・感想 | 「感想を入力...」 |
| やめた | 損切り理由の記録 | 「損切り理由を入力...」 |
| 積みゲー | プレイ開始計画 | 「プレイ計画を入力...」 |

## ステータス変更通知 (`src/lib/utils/status-notification.tsx`)

`react-hot-toast`でターミナル風トースト表示（5秒間、クリックでメモ欄にフォーカス）

| トリガー | 通知タイトル |
|---------|-------------|
| Playing → Completed | MISSION COMPLETE |
| Playing → Dropped | LOSS CUT DETECTED |
| Backlog → Playing | PROJECT LAUNCHED |

## ダッシュボードUI

- キャッチコピー: 「遊べば遊ぶほど安くなる。目指せ『実質無料』！」
- CPHカラーコーディング（緑=良い、赤=悪い）
- RPG経験値バー風プログレスバー

## 無料プラン制限

- ゲーム登録上限: **3タイトル**まで（`AddGameButton.tsx` の `FREE_TIER_LIMIT`）
- 上限到達時: 「無料プランの上限に達しました」モーダル表示
