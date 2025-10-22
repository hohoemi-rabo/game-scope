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
    platform: 'Multi',
  },
  {
    name: 'Nintendo',
    url: 'https://www.nintendo.co.jp/news/whatsnew.xml',
    platform: 'Nintendo Switch',
  },
  {
    name: 'PlayStation Blog',
    url: 'https://blog.ja.playstation.com/feed/',
    platform: 'PlayStation',
  },
]

export interface ReleaseItem {
  title: string
  link: string
  pubDate: string
  source: string
  platform: string
  description?: string
}

/**
 * RSS フィードから発売予定情報を取得
 * 各ソースから情報を取得し、発売関連のキーワードでフィルタリング
 */
export async function fetchReleases(): Promise<ReleaseItem[]> {
  const allReleases: ReleaseItem[] = []

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)

      const releases = feed.items
        .filter((item) => {
          // 発売予定に関連するキーワードでフィルタリング
          const keywords = ['発売', '配信', 'リリース', '予定']
          const text = `${item.title} ${item.contentSnippet || ''}`
          return keywords.some((keyword) => text.includes(keyword))
        })
        .map((item) => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || item.isoDate || '',
          source: source.name,
          platform: source.platform,
          description: item.contentSnippet,
        }))

      allReleases.push(...releases)
    } catch (error) {
      console.error(`Failed to fetch RSS from ${source.name}:`, error)
      // エラーがあっても他のソースは継続
    }
  }

  // 日付順にソート（新しい順）
  return allReleases.sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })
}
