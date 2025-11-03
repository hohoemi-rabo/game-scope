#!/bin/bash
# Edge Function「sync-games」を手動実行するスクリプト
#
# 使用方法:
#   chmod +x scripts/trigger-sync.sh
#   ./scripts/trigger-sync.sh

set -e

echo "🚀 ゲームデータ同期を手動実行中..."
echo ""

# .env.localから環境変数を読み込む
if [ -f .env.local ]; then
  export $(cat .env.local | grep NEXT_PUBLIC_SUPABASE_ANON_KEY | xargs)
fi

# Supabase Edge Functionを実行
curl -X POST \
  'https://vhuhazlgqmuihejpiuyy.supabase.co/functions/v1/sync-games' \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -w "\n\n⏱️  Response time: %{time_total}s\n" \
  -s

echo ""
echo "✅ 完了"
