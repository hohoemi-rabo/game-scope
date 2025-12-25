'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  calculateCPH,
  getDisplayRank,
  getStockColor,
  getCPHMetaphor,
  getNextRankInfo,
  getRankProgress,
  formatPrice,
  formatPlayTime,
} from '@/lib/utils/cph'
import { STATUS_INFO, type GameStatus, type PortfolioWithGame } from '@/types/portfolio'
import { getPlatformIcon, getPlatformName } from '@/constants/platforms'
import { updatePortfolioMemo } from '@/app/actions/portfolio'

/**
 * ステータス別メモ設定
 * - 英語ラベルを削除し、日本語でダイレクトに「何を書くべきか」を伝える
 */
const MEMO_CONFIG: Record<GameStatus, { icon: string; cta: string; placeholder: string; bgColor: string }> = {
  playing: {
    icon: '🎯',
    cta: '次の目標を設定する（例：レベル50まで上げる）',
    placeholder: '次の目標を入力...',
    bgColor: 'bg-emerald-500/10',
  },
  completed: {
    icon: '📝',
    cta: '投資評価・感想を残す（例：神ゲーだった！）',
    placeholder: '感想を入力...',
    bgColor: 'bg-purple-500/10',
  },
  dropped: {
    icon: '📉',
    cta: '損切りした理由を記録する（次回の教訓）',
    placeholder: '損切り理由を入力...',
    bgColor: 'bg-rose-500/10',
  },
  backlog: {
    icon: '🗓️',
    cta: 'プレイ開始計画を立てる（いつ崩す？）',
    placeholder: 'プレイ計画を入力...',
    bgColor: 'bg-amber-500/10',
  },
}

const MAX_MEMO_LENGTH = 200

interface GameListItemProps {
  portfolio: PortfolioWithGame
  onEdit: () => void
  onDelete: () => void
  shouldFocusMemo?: boolean
}

/**
 * ゲームリストの1行アイテム（ネット証券風UI）
 */
export default function GameListItem({
  portfolio,
  onEdit,
  onDelete,
  shouldFocusMemo = false,
}: GameListItemProps) {
  const game = portfolio.games
  const purchasePrice = portfolio.purchase_price ?? 0
  const playTimeMinutes = portfolio.play_time_minutes ?? 0
  const isSubscription = portfolio.is_subscription ?? false
  const platform = portfolio.platform
  const initialMemo = portfolio.memo ?? ''

  const status = portfolio.status as GameStatus | null
  const { cph, rank } = calculateCPH(purchasePrice, playTimeMinutes, isSubscription)

  // メモ編集状態
  const [isEditingMemo, setIsEditingMemo] = useState(false)
  const [memoValue, setMemoValue] = useState(initialMemo)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // メモ設定（ステータスに応じて変化）
  const memoConfig = MEMO_CONFIG[status || 'backlog']

  // メモ保存（debounce）
  const saveMemo = useCallback(async (value: string) => {
    setIsSaving(true)
    setSaveError(null)

    const result = await updatePortfolioMemo({
      portfolioId: portfolio.id,
      memo: value.trim() || null,
    })

    setIsSaving(false)
    if (!result.success) {
      setSaveError(result.error)
    }
  }, [portfolio.id])

  // メモ変更ハンドラ（500ms debounce）
  const handleMemoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_MEMO_LENGTH) {
      setMemoValue(value)
      setSaveError(null)

      // debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        saveMemo(value)
      }, 500)
    }
  }, [saveMemo])

  // 編集モード開始
  const startEditing = useCallback(() => {
    setIsEditingMemo(true)
    // 次のレンダリング後にフォーカス
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [])

  // 編集モード終了
  const finishEditing = useCallback(() => {
    setIsEditingMemo(false)
    // 最終保存
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    saveMemo(memoValue)
  }, [memoValue, saveMemo])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // 外部からのメモ欄フォーカス要求
  useEffect(() => {
    if (shouldFocusMemo) {
      startEditing()
    }
  }, [shouldFocusMemo, startEditing])

  // ステータスに応じた表示ランク（Luxury + Completed → Premium, Luxury + Dropped → LossCut）
  const displayRank = getDisplayRank(rank, status)
  const stockColor = getStockColor(displayRank)
  const metaphor = getCPHMetaphor(displayRank)
  const nextRank = getNextRankInfo(rank, purchasePrice, playTimeMinutes)
  const statusInfo = STATUS_INFO[status || 'backlog']

  // RPG経験値バー風の進捗（現在のランク内での進捗）
  const progressPercent = getRankProgress(rank, purchasePrice, playTimeMinutes)

  // プログレスバー非表示条件：Premium または LossCut（これ以上遊ぶ必要がない）
  const hideProgressBar = displayRank === 'premium' || displayRank === 'lossCut'

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl
                    hover:border-gray-700 transition-colors">
      {/* ヘッダー: タイトル + ステータス + アクション */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* サムネイル */}
          {game.thumbnail_url ? (
            <img
              src={game.thumbnail_url}
              alt={game.title_ja || game.title_en}
              className="w-16 h-10 object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-10 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
              <span className="text-text-secondary text-xs">No Img</span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-text-primary truncate text-sm sm:text-base">
              {game.title_ja || game.title_en}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5 flex-wrap">
              {platform && (
                <>
                  <span>{getPlatformIcon(platform)} {getPlatformName(platform)}</span>
                  <span className="text-gray-600">|</span>
                </>
              )}
              <span>{statusInfo.emoji} {statusInfo.label}</span>
              <span className="text-gray-600">|</span>
              <span>取得額: {isSubscription ? 'Free' : formatPrice(purchasePrice)}</span>
              <span className="text-gray-600">|</span>
              <span>運用: {formatPlayTime(playTimeMinutes)}</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-text-secondary hover:text-text-primary
                       hover:bg-gray-800 rounded-lg transition-colors"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-text-secondary hover:text-danger
                       hover:bg-danger/10 rounded-lg transition-colors"
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* メイン: CPH（大きく目立たせる + メタファーを横に） */}
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className={`text-2xl sm:text-3xl font-bold font-mono ${stockColor.textColor}`}>
          {cph !== null ? `¥${cph.toLocaleString()}` : '--'}
        </span>
        <span className={`text-lg font-medium ${stockColor.textColor}`}>/h</span>
        <span className="text-sm">{stockColor.icon}</span>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${stockColor.bgColor} ${stockColor.borderColor} ${stockColor.textColor}`}>
          {metaphor.emoji} {metaphor.label}
        </span>
      </div>

      {/* プログレスバー + ランクアップ情報（有料ゲームのみ） */}
      {!isSubscription && purchasePrice > 0 && (
        <div>
          {/* プログレスバー（Premium/LossCutの場合は非表示） */}
          {!hideProgressBar && (
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${stockColor.barColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
          <div className="text-xs">
            {/* Premium: クリア済み高単価ゲーム */}
            {displayRank === 'premium' ? (
              <span className="text-purple-400">
                🎉 完走おめでとうございます！最高に濃密な {formatPlayTime(playTimeMinutes)} でした。
              </span>
            ) : displayRank === 'lossCut' ? (
              /* LossCut: ドロップした高単価ゲーム */
              <span className="text-rose-300">
                相性が悪かったようです。次の投資へ切り替えましょう。
              </span>
            ) : rank === 'god' ? (
              <span className="text-emerald-400 font-medium">
                🏆 最高ランク達成！このまま遊び尽くそう
              </span>
            ) : nextRank ? (
              <span className={stockColor.textColor}>
                次のランク「{nextRank.nextEmoji} {nextRank.nextLabel}」まで、
                <span className="font-medium">あと {formatPlayTime(nextRank.minutesNeeded)} プレイ！</span>
              </span>
            ) : (
              <span className={stockColor.textColor}>
                さらにプレイしてランクアップを目指そう
              </span>
            )}
          </div>
        </div>
      )}

      {/* サブスク/無料の場合 */}
      {(isSubscription || purchasePrice === 0) && (
        <div className="text-xs text-cyan-400 bg-cyan-900/30 border border-cyan-500/30 px-3 py-1.5 rounded-lg inline-block">
          🎁 無料で {formatPlayTime(playTimeMinutes)} 楽しんでいます！最高のコスパ！
        </div>
      )}

      {/* 投資戦略メモ（シンプル1行デザイン） */}
      <div className="mt-4">
        {isEditingMemo ? (
          // 編集モード
          <div className="bg-gray-950/70 rounded-lg p-3 border border-dashed border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded ${memoConfig.bgColor}`}>
                <span className="text-base">{memoConfig.icon}</span>
              </div>
              {isSaving && (
                <span className="text-xs text-blue-400 animate-pulse">保存中...</span>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={memoValue}
              onChange={handleMemoChange}
              onBlur={finishEditing}
              placeholder={memoConfig.placeholder}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2
                         text-sm text-text-primary placeholder-gray-600
                         focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
                         resize-none transition-colors"
              rows={2}
              maxLength={MAX_MEMO_LENGTH}
            />
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-gray-600">
                {memoValue.length} / {MAX_MEMO_LENGTH}
              </span>
              {saveError && (
                <span className="text-red-400">{saveError}</span>
              )}
            </div>
          </div>
        ) : memoValue ? (
          // 表示モード（メモあり）
          <button
            onClick={startEditing}
            className="w-full text-left bg-gray-950/50 rounded-lg p-3 border border-dashed border-gray-800
                       hover:bg-gray-900/70 hover:border-gray-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${memoConfig.bgColor} flex-shrink-0`}>
                <span className="text-base">{memoConfig.icon}</span>
              </div>
              <p className="text-sm text-gray-300 group-hover:text-text-primary transition-colors flex-1">
                {memoValue}
              </p>
              <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                ✎ 編集
              </span>
            </div>
          </button>
        ) : (
          // 追加ボタン（メモなし）- シンプル1行
          <button
            onClick={startEditing}
            className="w-full text-left bg-gray-950/50 rounded-lg p-3 border border-dashed border-gray-800
                       hover:bg-gray-900/70 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${memoConfig.bgColor} group-hover:scale-110 transition-transform flex-shrink-0`}>
                <span className="text-base">{memoConfig.icon}</span>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                ＋ {memoConfig.cta}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
