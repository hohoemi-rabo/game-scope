下記の提案いかがでしょうか？何か疑問があればヒアリングしてください。
news のデータ保存方法を変更します。
AI の API は後で実装します。

1. プロジェクトの概要
   ゲームのニュースアグリゲーションページにおいて、毎日深夜に RSS を取得し、Google Gemini 1.5 Flash API を使用して「サイト/カテゴリごとのトレンド要約（3 行まとめ）」を生成・保存する機能を実装します。

2. 技術スタック
   ・Framework: Next.js (App Router)
   ・Database: Supabase (PostgreSQL)
   ・Backend: Supabase Edge Functions (TypeScript)
   ・AI: Google Gemini API (Model: gemini-1.5-flash)

Step 1: データベース設計 (Supabase SQL)
既存の news テーブルに加え、日次の要約を保存する daily_digests テーブルを作成する必要があります。 以下の SQL を実行するマイグレーション、または SQL エディタでの実行を前提としたコードを書いてください。

SQL

-- 既存の news テーブル（URL の重複を防ぐため UNIQUE 制約を確認/追加）
-- (既存のカラム: id, title, url, site_name, published_at, created_at 等)

-- 新規作成: 日次要約テーブル
CREATE TABLE daily_digests (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
target_date DATE NOT NULL, -- 対象日 (例: 2025-12-26)
category TEXT NOT NULL, -- ニュースサイト名 または キーワード
content TEXT NOT NULL, -- AI 生成された 3 行まとめ
created_at TIMESTAMPTZ DEFAULT now(),
UNIQUE(target_date, category) -- 1 日 1 カテゴリにつき 1 レコードのみ
);

Step 2: Edge Function 実装 (fetch-and-summarize-news)
Supabase Edge Function を作成し、以下のロジックを実装してください。

処理フロー:

1.RSS 取得: 登録されているニュースサイト（約 10 サイト+キーワード）から最新の RSS を取得する。

2.ニュース保存 (Upsert): news テーブルに記事を保存する。
・重要: delete -> insert ではなく、url をキーにした Upsert を使用すること（既存記事は無視、新規記事のみ追加）。

3.データ整形: 取得した全記事（約 600 件想定）を、Gemini へのプロンプト用に整形する。
・形式: 【ソース名 A】\n- 記事タイトル 1\n- 記事タイトル 2... の文字列連結。

4.AI 要約生成 (Bulk Request):
・Gemini 1.5 Flash を使用。
・API リクエストは**「1 回のみ」**行うこと（全データを 1 つのプロンプトに含める）。
・プロンプト指示: 「各ソースごとに記事の傾向を分析し、『今日の重要ニュース 3 選』を日本語の箇条書きでまとめてください。出力は必ずソース名をキーとした JSON 形式にしてください。」

5.要約保存: 生成された JSON をパースし、daily_digests テーブルに保存する（target_date は今日の日付）。

●Gemini API 呼び出しのコード例 (ヒント):

TypeScript

const prompt = `
あなたはゲームメディアの編集長です。以下のニュースタイトルリストをもとに、
各ソースごとの「今日のトレンド 3 行まとめ」を作成し、JSON で返してください。
JSON のキーはソース名と一致させてください。

【ニュースデータ】
${formattedNewsData}
`;
// model.generateContent(prompt) ...

Edge Function の最後に「掃除処理」を追加する
TypeScript
// ... (AI 要約と保存の処理が終わった後) ...

// 🧹 クリーンアップ処理: 7 日以上前の古いニュースを削除
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const { error: deleteError } = await supabase
.from('news')
.delete()
.lt('published_at', sevenDaysAgo.toISOString());

if (deleteError) {
console.error('クリーンアップ失敗:', deleteError);
} else {
console.log('古いニュースの掃除が完了しました');
}

Step 3: フロントエンド実装 (app/news/page.tsx)
ニュース一覧ページの上部に、生成した要約を表示するセクションを追加してください。

1.コンポーネント: DailyDigestSection を作成。

2.データ取得: daily_digests テーブルから、今日の日付 のデータを取得する。

3.表示:
・アコーディオン、またはカード形式で「ソース名」と「3 行まとめ」を表示する。
・デザインは既存の GameScope のダークテーマ（黒背景・Emerald グリーンのアクセント）に合わせる。
・要約がない場合（取得前など）は何も表示しない、または「集計中」と表示する。

● 制約事項
・Gemini API は無料枠を使用するため、リクエスト回数は最小限（1 回） に抑える設計を厳守してください。
・エラーハンドリング（RSS 取得失敗や JSON パースエラー）を適切に行ってください。
・環境変数 (GOOGLE_API_KEY, SUPABASE_URL 等) を使用してください。

以上、実装をお願いします。
