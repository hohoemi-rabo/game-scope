import toast from 'react-hot-toast'
import type { GameStatus } from '@/types/portfolio'

/**
 * ステータス変更時のシステム通知定義
 */
interface StatusChangeNotification {
  title: string
  message: string
  borderColor: string
  titleColor: string
  underlineColor: string
}

/**
 * ステータス変更パターン別の通知設定
 */
const STATUS_CHANGE_NOTIFICATIONS: Record<string, StatusChangeNotification> = {
  // Playing → Completed: ミッション完了
  'playing_completed': {
    title: '✅ MISSION COMPLETE',
    message: '投資完了を確認しました。データ分析のために、今の「評価・感想」を記録しておきましょう。',
    borderColor: '#a855f7', // purple-500
    titleColor: 'text-purple-400',
    underlineColor: 'decoration-purple-500/50',
  },
  // Playing → Dropped: 損切り検出
  'playing_dropped': {
    title: '📉 LOSS CUT DETECTED',
    message: '損切り処理を確認しました。今後のために「やめた理由」をメモに残しませんか？',
    borderColor: '#ef4444', // red-500
    titleColor: 'text-red-400',
    underlineColor: 'decoration-red-500/50',
  },
  // Backlog → Playing: プロジェクト開始
  'backlog_playing': {
    title: '🚀 PROJECT LAUNCHED',
    message: 'プロジェクト始動。まずは「直近の目標」を設定して、攻略を始めましょう。',
    borderColor: '#10b981', // emerald-500
    titleColor: 'text-emerald-400',
    underlineColor: 'decoration-emerald-500/50',
  },
}

/**
 * ステータス変更時のシステム通知を表示
 * @param oldStatus 変更前のステータス
 * @param newStatus 変更後のステータス
 * @param onClickCallback クリック時のコールバック（メモ欄フォーカス用）
 */
export function triggerStatusChangeNotification(
  oldStatus: GameStatus | null,
  newStatus: GameStatus,
  onClickCallback?: () => void
): void {
  // 同じステータスなら何もしない
  if (oldStatus === newStatus) return

  // 通知パターンを検索
  const key = `${oldStatus}_${newStatus}`
  const notification = STATUS_CHANGE_NOTIFICATIONS[key]

  // 該当パターンがなければ何もしない
  if (!notification) return

  // ターミナル風トースト表示
  toast(
    (t) => (
      <div
        onClick={() => {
          toast.dismiss(t.id)
          onClickCallback?.()
        }}
        className="cursor-pointer"
      >
        <div className={`text-xs font-bold mb-1 ${notification.titleColor}`}>
          {notification.title}
        </div>
        <div className="text-xs text-gray-300 leading-relaxed">
          {notification.message.split('「')[0]}
          {notification.message.includes('「') && (
            <>
              <span className={`underline ${notification.underlineColor}`}>
                「{notification.message.split('「')[1].split('」')[0]}」
              </span>
              {notification.message.split('」')[1]}
            </>
          )}
        </div>
        <div className="text-[10px] text-gray-600 mt-2">
          ▶ クリックしてメモを編集
        </div>
      </div>
    ),
    {
      duration: 10000,
      style: {
        background: 'rgba(10, 10, 10, 0.95)',
        border: `1px solid ${notification.borderColor}`,
        backdropFilter: 'blur(8px)',
      },
    }
  )
}
