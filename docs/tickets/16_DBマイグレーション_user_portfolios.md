# チケット #16: DBマイグレーション（user_portfolios）

## ステータス: [未着手]

## 概要

Gaming ROI機能のためのデータベーステーブル `user_portfolios` を作成し、RLS（Row Level Security）を設定する。

## 背景

- ユーザーがゲームの購入金額・プレイ時間を記録するためのテーブルが必要
- 各ユーザーは自分のデータのみアクセス可能にする（RLS必須）
- 既存の `games` テーブルと外部キーで連携

## 作業内容

### 1. user_portfoliosテーブル作成

- [ ] Supabase MCP または SQL Editorでマイグレーション実行
- [ ] インデックス作成
- [ ] RLSポリシー設定

### 2. gamesテーブル拡張（任意）

- [ ] `is_top_rated` フラグ追加を検討（Top60とユーザー追加ゲームの区別用）

### 3. TypeScript型定義更新

- [ ] `npm run supabase:types` で型定義を再生成
- [ ] 型定義ファイルの確認

## 技術仕様

### マイグレーションSQL

```sql
-- user_portfoliosテーブル作成
create table user_portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  game_id uuid references games(id) not null,

  -- 投資データ
  purchase_price integer default 0,          -- 購入金額（円）
  play_time_minutes integer default 0,       -- プレイ時間（分）
  is_subscription boolean default false,     -- サブスク/無料フラグ

  -- ステータス管理
  status text check (status in ('playing', 'completed', 'dropped', 'backlog')) default 'backlog',

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, game_id)
);

-- インデックス作成
create index idx_user_portfolios_user on user_portfolios(user_id);
create index idx_user_portfolios_game on user_portfolios(game_id);
create index idx_user_portfolios_status on user_portfolios(status);

-- updated_at自動更新トリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_user_portfolios_updated_at
  before update on user_portfolios
  for each row
  execute function update_updated_at_column();
```

### RLS（Row Level Security）設定

```sql
-- RLSを有効化
alter table user_portfolios enable row level security;

-- SELECT: 自分のデータのみ閲覧可能
create policy "Users can view own portfolios"
  on user_portfolios for select
  using (auth.uid() = user_id);

-- INSERT: 自分のデータのみ作成可能
create policy "Users can insert own portfolios"
  on user_portfolios for insert
  with check (auth.uid() = user_id);

-- UPDATE: 自分のデータのみ更新可能
create policy "Users can update own portfolios"
  on user_portfolios for update
  using (auth.uid() = user_id);

-- DELETE: 自分のデータのみ削除可能
create policy "Users can delete own portfolios"
  on user_portfolios for delete
  using (auth.uid() = user_id);
```

### gamesテーブル拡張（オプション）

```sql
-- Top60とユーザー追加ゲームを区別するフラグ
alter table games add column if not exists is_top_rated boolean default false;

-- 既存のTop60ゲームにフラグを設定
update games set is_top_rated = true where metascore is not null;
```

### テーブル構造

| カラム名           | 型                       | 説明                                      |
| ------------------ | ------------------------ | ----------------------------------------- |
| id                 | uuid                     | 主キー                                    |
| user_id            | uuid                     | ユーザーID（auth.usersへの外部キー）      |
| game_id            | uuid                     | ゲームID（gamesへの外部キー）             |
| purchase_price     | integer                  | 購入金額（円）                            |
| play_time_minutes  | integer                  | プレイ時間（分）                          |
| is_subscription    | boolean                  | サブスク/無料フラグ                       |
| status             | text                     | ステータス（playing/completed/dropped/backlog） |
| created_at         | timestamp with time zone | 作成日時                                  |
| updated_at         | timestamp with time zone | 更新日時                                  |

### ステータス定義

| ステータス  | 意味         | 用途                     |
| ----------- | ------------ | ------------------------ |
| `playing`   | 現在プレイ中 | アクティブなゲーム       |
| `completed` | クリア済み   | 達成感の可視化           |
| `dropped`   | 途中でやめた | 合わなかったゲームの記録 |
| `backlog`   | 積みゲー     | 未着手ゲームの管理       |

## 依存関係

- #15 Google認証セットアップ（auth.usersテーブルへの参照）

## 受け入れ条件

- [ ] user_portfoliosテーブルが作成されている
- [ ] RLSポリシーが正しく設定されている
- [ ] インデックスが作成されている
- [ ] TypeScript型定義が更新されている
- [ ] ログインユーザーが自分のデータのみ操作できることを確認

## テスト項目

1. 認証済みユーザーがポートフォリオを作成できる
2. 認証済みユーザーが自分のポートフォリオのみ閲覧できる
3. 他ユーザーのポートフォリオにアクセスできない（RLS動作確認）
4. user_id + game_idのユニーク制約が機能する

## 関連チケット

- #15 Google認証セットアップ
- #19 ポートフォリオ登録機能
