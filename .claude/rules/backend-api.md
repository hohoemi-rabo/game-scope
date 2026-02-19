---
paths:
  - "src/app/api/**"
  - "src/lib/api/**"
  - "src/middleware.ts"
---

# バックエンド & API ルール

## データフェッチング戦略

| ユースケース | 戦略 | コード例 |
|------------|------|---------|
| 静的コンテンツ | force-cache | `{ cache: 'force-cache' }` |
| リアルタイム情報 | no-store | `{ cache: 'no-store' }` |
| 定期更新 | revalidate | `{ next: { revalidate: 3600 } }` |

## キャッシュ設定

- ニュース API (`/api/news`): `s-maxage=1800, stale-while-revalidate=3600`
- AI要約 API (`/api/news/digests`): 30分キャッシュ
- Twitch配信 (`/api/twitch/streams`): 5分キャッシュ
- Twitchクリップ (`/api/twitch/clips`): 1時間キャッシュ
- SWR自動更新: 60秒ごと

## セキュリティベストプラクティス

```typescript
// 環境変数の扱い
const apiKey = process.env.OPENCRITIC_API_KEY // サーバーのみ
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL // Client可

// 必要なデータのみをClient Componentに渡す
export async function GamePage({ params }) {
  const { id } = await params
  const game = await getGame(id)
  return <GameDetails title={game.title_ja} score={game.metascore} />
}
```

## Twitch連携

**実装場所**:
- `src/lib/api/twitch.ts` - Twitch API クライアント
- `src/lib/api/game-twitch.ts` - Game ID キャッシュ機構

**キャッシュ戦略**:
- Twitch Game ID: データベースキャッシュ 1週間
- **フォールバック検索**: タイトル表記ゆれ対応（数字前スペース削除、ローマ数字変換、"Remastered"削除）

## 検索機能

**実装場所**: `src/lib/supabase/search.ts`
- タイトル検索（日本語/英語、debounce 500ms）
- プラットフォームフィルター（overlaps演算子使用）
- スコア範囲フィルター（80+、60-79、60未満）
- URL同期（検索状態をURLパラメータに保存）
