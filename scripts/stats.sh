#!/usr/bin/env bash
URL="${URL:-https://forecast-puce-nine.vercel.app}"
echo ""
echo "  📊 Forecast launch stats — $URL"
echo "  ──────────────────────────────────────"
MARKETS=$(curl -s "$URL/api/markets")
LB=$(curl -s "$URL/api/leaderboard")
echo "$MARKETS" | python3 -c "
import json, sys
d = json.load(sys.stdin)
ms = d['markets']
print(f'  Markets total       : {len(ms)}')
print(f'    open              : {len([m for m in ms if m[\"status\"]==\"open\"])}')
print(f'    resolved          : {len([m for m in ms if m[\"status\"]==\"resolved\"])}')
"
echo "$LB" | python3 -c "
import json, sys
d = json.load(sys.stdin)
lb = d['leaderboard']
print(f'  Forecasters total   : {len(lb)}')
print(f'  Total forecasts     : {sum(u[\"totalForecasts\"] for u in lb)}')
"
echo ""
echo "  Top 5 forecasters:"
echo "$LB" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for i, u in enumerate(d['leaderboard'][:5]):
    name = u.get('username') or f'fid:{u[\"fid\"]}'
    print(f'    #{i+1} {name:20s} score={u[\"score\"]:3d}  forecasts={u[\"totalForecasts\"]:3d}')
"
