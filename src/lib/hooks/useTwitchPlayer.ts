'use client'

import { useEffect, useRef } from 'react'

// Twitch Embed Player の型定義
declare global {
  interface Window {
    Twitch?: {
      Player: new (elementId: string, options: TwitchPlayerOptions) => TwitchPlayer
    }
  }
}

interface TwitchPlayerOptions {
  width?: string | number
  height?: string | number
  channel?: string
  video?: string
  collection?: string
  autoplay?: boolean
  muted?: boolean
  time?: string
  parent?: string[]
}

interface TwitchPlayer {
  play(): void
  pause(): void
  setChannel(channel: string): void
  setVideo(videoId: string): void
  getMuted(): boolean
  setMuted(muted: boolean): void
  getVolume(): number
  setVolume(volume: number): void
  getPlaybackStats(): unknown
  addEventListener(event: string, callback: () => void): void
  removeEventListener(event: string, callback: () => void): void
}

/**
 * Twitch Player を初期化するカスタムフック
 */
export function useTwitchPlayer(
  channel: string | null,
  options: Partial<TwitchPlayerOptions> = {}
) {
  const playerRef = useRef<TwitchPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!channel || !containerRef.current) return

    // Twitch SDK スクリプトの動的読み込み
    const script = document.createElement('script')
    script.src = 'https://player.twitch.tv/js/embed/v1.js'
    script.async = true

    script.onload = () => {
      if (!window.Twitch || !containerRef.current) return

      // プレイヤー初期化
      playerRef.current = new window.Twitch.Player('twitch-player', {
        width: '100%',
        height: '100%',
        channel,
        autoplay: false,
        muted: false,
        parent: ['localhost', 'game-scope.vercel.app'], // 本番ドメイン追加必須
        ...options,
      })
    }

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [channel, options])

  return { playerRef, containerRef }
}
