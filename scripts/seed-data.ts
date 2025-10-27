import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase/types'

// .env.local から環境変数を読み込む
config({ path: '.env.local' })

// Supabase クライアントの作成（サービスロールキー使用）
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 初期ゲームデータ
 * OpenCritic の高評価ゲームから抽出
 * サムネイル画像は Phase 2 で OpenCritic API から取得予定
 * 注: opencritic_numeric_id は後で update-opencritic-ids.ts で更新される
 */
const seedGames: Database['public']['Tables']['games']['Insert'][] = [
  {
    title_ja: 'エルデンリング',
    title_en: 'Elden Ring',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
    metascore: 96,
    review_count: 102,
    release_date: '2022-02-25',
    thumbnail_url: null,
    opencritic_id: 'elden-ring',
  },
  {
    title_ja: 'ゼルダの伝説 ティアーズ オブ ザ キングダム',
    title_en: 'The Legend of Zelda: Tears of the Kingdom',
    platforms: ['Nintendo Switch'],
    metascore: 96,
    review_count: 145,
    release_date: '2023-05-12',
    thumbnail_url: null,
    opencritic_id: 'zelda-totk',
  },
  {
    title_ja: 'バルダーズゲート3',
    title_en: "Baldur's Gate 3",
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
    metascore: 96,
    review_count: 89,
    release_date: '2023-08-03',
    thumbnail_url: null,
    opencritic_id: 'baldurs-gate-3',
  },
  {
    title_ja: 'レッド・デッド・リデンプション2',
    title_en: 'Red Dead Redemption 2',
    platforms: ['PC', 'PlayStation 4', 'Xbox One'],
    metascore: 95,
    review_count: 98,
    release_date: '2018-10-26',
    thumbnail_url: null,
    opencritic_id: 'red-dead-redemption-2',
  },
  {
    title_ja: 'ウィッチャー3 ワイルドハント',
    title_en: 'The Witcher 3: Wild Hunt',
    platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
    metascore: 95,
    review_count: 87,
    release_date: '2015-05-19',
    thumbnail_url: null,
    opencritic_id: 'witcher-3',
  },
  {
    title_ja: 'ゴッド・オブ・ウォー',
    title_en: 'God of War (2018)',
    platforms: ['PlayStation 4', 'PC'],
    metascore: 94,
    review_count: 92,
    release_date: '2018-04-20',
    thumbnail_url: null,
    opencritic_id: 'god-of-war-2018',
  },
  {
    title_ja: 'ハデス',
    title_en: 'Hades',
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    metascore: 93,
    review_count: 78,
    release_date: '2020-09-17',
    thumbnail_url: null,
    opencritic_id: 'hades',
  },
  {
    title_ja: 'ディスコ エリジウム',
    title_en: 'Disco Elysium',
    platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
    metascore: 93,
    review_count: 65,
    release_date: '2019-10-15',
    thumbnail_url: null,
    opencritic_id: 'disco-elysium',
  },
  {
    title_ja: 'バイオハザード4 リメイク',
    title_en: 'Resident Evil 4 Remake',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
    metascore: 93,
    review_count: 89,
    release_date: '2023-03-24',
    thumbnail_url: null,
    opencritic_id: 'resident-evil-4-remake',
  },
  {
    title_ja: 'サイバーパンク2077 仮初めの自由',
    title_en: 'Cyberpunk 2077: Phantom Liberty',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
    metascore: 92,
    review_count: 71,
    release_date: '2023-09-26',
    thumbnail_url: null,
    opencritic_id: 'cyberpunk-phantom-liberty',
  },
  {
    title_ja: 'ペルソナ5 ザ・ロイヤル',
    title_en: 'Persona 5 Royal',
    platforms: ['PC', 'PlayStation 4', 'Nintendo Switch', 'Xbox One'],
    metascore: 92,
    review_count: 83,
    release_date: '2019-10-31',
    thumbnail_url: null,
    opencritic_id: 'persona-5-royal',
  },
  {
    title_ja: 'セキロ: シャドウズ ダイ トゥワイス',
    title_en: 'Sekiro: Shadows Die Twice',
    platforms: ['PC', 'PlayStation 4', 'Xbox One'],
    metascore: 91,
    review_count: 94,
    release_date: '2019-03-22',
    thumbnail_url: null,
    opencritic_id: 'sekiro',
  },
  {
    title_ja: 'Celeste',
    title_en: 'Celeste',
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    metascore: 91,
    review_count: 56,
    release_date: '2018-01-25',
    thumbnail_url: null,
    opencritic_id: 'celeste',
  },
  {
    title_ja: 'ホロウナイト',
    title_en: 'Hollow Knight',
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    metascore: 90,
    review_count: 62,
    release_date: '2017-02-24',
    thumbnail_url: null,
    opencritic_id: 'hollow-knight',
  },
  {
    title_ja: 'Marvel\'s Spider-Man 2',
    title_en: 'Marvel\'s Spider-Man 2',
    platforms: ['PlayStation 5'],
    metascore: 90,
    review_count: 95,
    release_date: '2023-10-20',
    thumbnail_url: null,
    opencritic_id: 'spider-man-2',
  },
  {
    title_ja: 'Dead Cells',
    title_en: 'Dead Cells',
    platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
    metascore: 89,
    review_count: 58,
    release_date: '2018-08-07',
    thumbnail_url: null,
    opencritic_id: 'dead-cells',
  },
  {
    title_ja: 'Alan Wake 2',
    title_en: 'Alan Wake 2',
    platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
    metascore: 89,
    review_count: 87,
    release_date: '2023-10-27',
    thumbnail_url: null,
    opencritic_id: 'alan-wake-2',
  },
  {
    title_ja: 'ゴースト・オブ・ツシマ',
    title_en: 'Ghost of Tsushima',
    platforms: ['PlayStation 4', 'PlayStation 5', 'PC'],
    metascore: 88,
    review_count: 102,
    release_date: '2020-07-17',
    thumbnail_url: null,
    opencritic_id: 'ghost-of-tsushima',
  },
  {
    title_ja: 'ファイナルファンタジーXVI',
    title_en: 'Final Fantasy XVI',
    platforms: ['PlayStation 5', 'PC'],
    metascore: 87,
    review_count: 94,
    release_date: '2023-06-22',
    thumbnail_url: null,
    opencritic_id: 'final-fantasy-16',
  },
  {
    title_ja: 'Stray',
    title_en: 'Stray',
    platforms: ['PC', 'PlayStation 4', 'PlayStation 5'],
    metascore: 85,
    review_count: 72,
    release_date: '2022-07-19',
    thumbnail_url: null,
    opencritic_id: 'stray',
  },
]

/**
 * データベースにシードデータを投入
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // 既存のデータをクリア（開発環境のみ）
    if (process.env.NODE_ENV !== 'production') {
      console.log('🗑️  Clearing existing data...')
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // 全削除

      if (deleteError) {
        console.warn('Warning: Could not clear existing data:', deleteError)
      }
    }

    // ゲームデータの投入
    console.log(`📥 Inserting ${seedGames.length} games...`)
    const { data, error } = await supabase
      .from('games')
      .insert(seedGames)
      .select()

    if (error) {
      throw error
    }

    console.log(`✅ Successfully inserted ${data.length} games`)

    // 投入されたゲームの確認
    const { data: games, error: fetchError } = await supabase
      .from('games')
      .select('title_ja, title_en, metascore')
      .order('metascore', { ascending: false })
      .limit(10)

    if (fetchError) {
      throw fetchError
    }

    console.log('\n📊 Top 10 games:')
    games.forEach((game, index) => {
      console.log(`  ${index + 1}. ${game.title_ja || game.title_en} (${game.metascore})`)
    })

    console.log('\n🎉 Database seeding completed!')
    console.log('👉 Run "npm run dev" to see the games on your application')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// スクリプトの実行
seedDatabase()
