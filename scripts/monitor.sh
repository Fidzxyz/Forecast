#!/usr/bin/env bash
# Monitor Forecast launch metrics in real time.
# Usage: bash scripts/monitor.sh
URL="${URL:-https://forecast-puce-nine.vercel.app}"

clear
while true; do
  printf "\033[H"  # cursor home
  TS=$(date "+%H:%M:%S")
  echo "  📊 Forecast monitor — $TS — $URL"
  echo "  ────────────────────────────────────────────────"
  MARKETS=$(curl -s "$URL/api/markets")
  LB=$(curl -s "$URL/api/leaderboard")
  echo "$MARKETS" | python3 -c "
import json, sys
d = json.load(sys.stdin)
ms = d['markets']
print(f'  Markets             : {len(ms):3d}  (open: {len([m for m in ms if m[\"status\"]==\"open\"])}, resolved: {len([m for m in ms if m[\"status\"]==\"resolved\"])})')
"
  echo "$LB" | python3 -c "
import json, sys
d = json.load(sys.stdin)
lb = d['leaderboard']
total_f = sum(u['totalForecasts'] for u in lb)
print(f'  Forecasters         : {len(lb):3d}')
print(f'  Total forecasts     : {total_f:3d}')
print()
print('  Top 5:')
for i, u in enumerate(lb[:5]):
    name = u.get('username') or f'fid:{u[\"fid\"]}'
    print(f'    #{i+1} {name:20s} score={u[\"score\"]:3d}  fc={u[\"totalForecasts\"]}')
" 2>/dev/null
  echo ""
  echo "  refresh every 15s — Ctrl+C to stop"
  printf "\033[J"
  sleep 15
done
