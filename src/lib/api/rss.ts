import Parser from 'rss-parser'

const parser = new Parser()

interface RSSFeedSource {
  name: string
  url: string
  platform: string
}

/**
 * RSS フィードソース定義
 */
const RSS_SOURCES: RSSFeedSource[] = [
  {
    name: '4Gamer',
    url: 'https://www.4gamer.net/rss/index.xml',
    platform: '4Gamer',
  },
  {
    name: '4Gamer',
    url: 'https://www.4gamer.net/rss/pc/pc_news.xml',
    platform: '4Gamer (PC)',
  },
  {
    name: '4Gamer',
    url: 'https://www.4gamer.net/rss/ps3/ps3_news.xml',
    platform: '4Gamer (PlayStation)',
  },
  {
    name: '4Gamer',
    url: 'https://www.4gamer.net/rss/nintendo_switch/nintendo_switch_news.xml',
    platform: '4Gamer (Switch)',
  },
  {
    name: '4Gamer',
    url: 'https://www.4gamer.net/rss/smartphone/smartphone_index.xml',
    platform: '4Gamer (スマホ)',
  },
  {
    name: 'Nintendo',
    url: 'https://www.nintendo.co.jp/news/whatsnew.xml',
    platform: 'Nintendo',
  },
  {
    name: 'PlayStation Blog',
    url: 'https://blog.ja.playstation.com/feed/',
    platform: 'PlayStation Blog',
  },
  {
    name: 'Game*Spark',
    url: 'https://www.gamespark.jp/rss/index.rdf',
    platform: 'Game*Spark',
  },
  {
    name: 'GAME Watch',
    url: 'https://game.watch.impress.co.jp/data/rss/1.0/gmw/feed.rdf',
    platform: 'GAME Watch',
  },
  {
    name: 'GAMER',
    url: 'https://www.gamer.ne.jp/feed/news.rdf',
    platform: 'GAMER',
  },
]

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
  platform: string
  description?: string
}

/**
 * RSS フィードからゲームニュースを取得
 * 各ソースから全記事を取得（フィルタリングはクライアント側で実施）
 */
export async function fetchNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = []

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)

      const news = feed.items.map((item) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || '',
        source: source.name,
        platform: source.platform,
        description: item.contentSnippet,
      }))

      allNews.push(...news)
    } catch (error) {
      console.error(`Failed to fetch RSS from ${source.name}:`, error)
      // エラーがあっても他のソースは継続
    }
  }

  // 日付順にソート（新しい順）
  return allNews.sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })
}
