import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // ニュースサイト用カラークラス
    'bg-[#5865f2]', 'text-[#5865f2]', 'bg-[#5865f2]/20', 'bg-[#5865f2]/30', 'border-l-[#5865f2]',
    'bg-[#9b59b6]', 'text-[#9b59b6]', 'bg-[#9b59b6]/20', 'bg-[#9b59b6]/30', 'border-l-[#9b59b6]',
    'bg-[#e91e63]', 'text-[#e91e63]', 'bg-[#e91e63]/20', 'bg-[#e91e63]/30', 'border-l-[#e91e63]',
    'bg-[#3498db]', 'text-[#3498db]', 'bg-[#3498db]/20', 'bg-[#3498db]/30', 'border-l-[#3498db]',
    'bg-[#e74c3c]', 'text-[#e74c3c]', 'bg-[#e74c3c]/20', 'bg-[#e74c3c]/30', 'border-l-[#e74c3c]',
    'bg-[#667eea]', 'text-[#667eea]', 'bg-[#667eea]/20', 'bg-[#667eea]/30', 'border-l-[#667eea]',
    'bg-[#f59e0b]', 'text-[#f59e0b]', 'bg-[#f59e0b]/20', 'bg-[#f59e0b]/30', 'border-l-[#f59e0b]',
    'bg-[#00c896]', 'text-[#00c896]', 'bg-[#00c896]/20', 'bg-[#00c896]/30', 'border-l-[#00c896]',
    'bg-[#06b6d4]', 'text-[#06b6d4]', 'bg-[#06b6d4]/20', 'bg-[#06b6d4]/30', 'border-l-[#06b6d4]',
    'bg-[#fbbf24]', 'text-[#fbbf24]', 'bg-[#fbbf24]/20', 'bg-[#fbbf24]/30', 'border-l-[#fbbf24]',
    'border-l-accent', 'border-l-success', 'border-l-gray-700',
    // ヘッダーグラデーション用
    'from-[#5865f2]', 'via-[#9b59b6]', 'to-[#e91e63]',
    'from-[#e91e63]', 'to-[#5865f2]',
    'from-[#00c896]', 'to-[#06b6d4]',
    'from-[#06b6d4]', 'to-[#00c896]',
    'hover:border-[#06b6d4]/20', 'hover:border-[#f59e0b]/20',
    // CPHランク用カラークラス（プログレスバー）
    'bg-emerald-500', 'bg-emerald-900/30', 'border-emerald-500/30', 'text-emerald-400',
    'bg-yellow-500', 'bg-yellow-900/30', 'border-yellow-500/30', 'text-yellow-400',
    'bg-orange-500', 'bg-orange-900/30', 'border-orange-500/30', 'text-orange-400',
    'bg-rose-500', 'bg-rose-900/30', 'border-rose-500/30', 'text-rose-500',
    'bg-cyan-500', 'bg-cyan-900/30', 'border-cyan-500/30', 'text-cyan-400',
    'bg-gray-600', 'bg-gray-800/50', 'border-gray-600/30', 'text-gray-500',
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
