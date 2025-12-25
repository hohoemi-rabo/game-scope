'use client'

import { Toaster } from 'react-hot-toast'

/**
 * react-hot-toast のプロバイダー
 * ターミナル風のスタイリングをデフォルトで適用
 */
export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        // デフォルトスタイル（ターミナル風）
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid #333',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '12px',
          padding: '12px 16px',
          borderRadius: '6px',
        },
        duration: 5000,
      }}
    />
  )
}
