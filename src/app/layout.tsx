import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ToasterProvider from "./components/ToasterProvider";
import ScrollToTopButton from "./components/ScrollToTopButton";

// 見出し用フォント
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// 日本語フォント
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// 数字・コード用フォント
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GameScope | ゲームは、消費ではなく「資産」だ！",
    template: "%s | GameScope",
  },
  description: "あなたのゲームライフを数値化する、ゲーマーのための資産管理ツール。プレイ時間と金額を記録して、ゲーミングROIを可視化しよう。",
  metadataBase: new URL("https://www.gamescope.jp"),
  openGraph: {
    title: "GameScope | ゲームは、消費ではなく「資産」だ！",
    description: "あなたのゲームライフを数値化する、ゲーマーのための資産管理ツール。プレイ時間と金額を記録して、ゲーミングROIを可視化しよう。",
    url: "https://www.gamescope.jp",
    siteName: "GameScope",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GameScope - ゲームは、消費ではなく「資産」だ！",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameScope | ゲームは、消費ではなく「資産」だ！",
    description: "あなたのゲーミングROIを可視化しよう。",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${notoSansJP.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <ToasterProvider />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
