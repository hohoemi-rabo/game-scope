# 機能仕様書: プラットフォーム選択機能 (Fixed List Strategy)

## 1. 背景と方針

- **課題:** RAWG API のプラットフォーム情報は更新が遅く、最新の移植情報（Switch 版など）が欠落している場合が多い。
- **方針:** API のデータに依存せず、アプリ側で定義した「固定リスト（Master Data）」を使用する。ユーザーはそこから自分がプレイした機種を手動で選択する。

## 2. 定数定義 (Constants)

`constants/platforms.ts` を作成し、選択肢を管理する。

```typescript
export const PLATFORM_MASTER = [
  { id: 'pc', name: 'PC (Steam/Epic)', icon: '💻' },
  { id: 'ps5', name: 'PlayStation 5', icon: '🎮' },
  { id: 'ps4', name: 'PlayStation 4', icon: '🎮' },
  { id: 'switch', name: 'Nintendo Switch', icon: '🔴' },
  { id: 'xbox-series', name: 'Xbox Series X/S', icon: '💚' },
  { id: 'xbox-one', name: 'Xbox One', icon: '💚' },
  { id: 'smartphone', name: 'Smartphone (iOS/Android)', icon: '📱' },
  { id: 'retro', name: 'Retro / Others', icon: '🕹️' },
] as const;


3. データベース変更
user_portfolios テーブルにカラムを追加する。

SQL
-- 機種名をそのままテキストで保存する
ALTER TABLE user_portfolios ADD COLUMN platform TEXT;

4. UI/UX 仕様 (Add Game Modal)
ゲーム登録モーダルの入力フォームに「プラットフォーム選択」を追加する。

・コンポーネント: <select> (プルダウン)
・表示内容: PLATFORM_MASTER の icon + name を表示。
・初期値: * 基本は「未選択」。

→(Optional) RAWG APIの parent_platforms 情報と PLATFORM_MASTER を比較し、一致するものがあればそれを初期選択にする（あくまで補助機能）。

・バリデーション: 必須項目とする（CPH分析のため）。


5. ダッシュボード表示
登録済みゲームリストのタイトル横、または下部に、選択したプラットフォームのアイコンまたは名前を表示する。
例: 🎮 PlayStation 5

---

### 次のアクション

このテキストを保存し、実装に入ってください。
手順としては以下の通りです。

1.  **Supabase:** SQLを実行して `platform` カラムを追加。
2.  **Next.js:** `constants/platforms.ts` ファイルを作成。
3.  **UI:** 登録モーダルにプルダウンを追加し、保存処理（Server Action）で `platform` の値をDBに渡すように修正。

これで「Switch版がない！」というクレームも回避でき、将来的に「ハードごとの投資額分析」もできる最強の基盤が整います！
```
