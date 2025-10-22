import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GameScope カスタムカラー
        'bg-primary': '#0e0e10',      // ブラックグレー
        'accent': '#5865f2',           // ブルーバイオレット
        'success': '#00c896',          // エメラルドグリーン (スコア80+)
        'warning': '#ffb300',          // アンバー (スコア60-79)
        'danger': '#ff5252',           // コーラルレッド (スコア59以下)
        'text-primary': '#f2f2f2',     // ホワイト
        'text-secondary': '#9e9e9e',   // グレー
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      screens: {
        'mobile': '767px', // モバイル/タブレット境界
      },
    },
  },
  plugins: [],
};

export default config;
