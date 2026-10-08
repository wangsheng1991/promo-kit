#!/usr/bin/env sh
# hf — 找到本机的 HyperFrames CLI，带上它需要的环境变量，然后原样转发参数。
#
# 为什么要这个壳：本机 npm 不稳，`npx hyperframes` 会去要最新版（0.8.140）然后直接失败，
# 而 npx 缓存里其实躺着一份能用的 0.8.100。这里按顺序找：
#   1) PATH 上的 hyperframes
#   2) ~/.npm/_npx/*/node_modules/hyperframes/bin/hyperframes.mjs 里最新的那份
# 顺带把 HyperFrames 要的两个变量设好（没设才设，不覆盖你的）：
#   DO_NOT_TRACK=1               关掉匿名遥测
#   HYPERFRAMES_BROWSER_PATH     渲染用的 Chrome
#
# 用法： ./bin/hf.sh doctor
#        ./bin/hf.sh render <项目目录> --format gif -o out.gif
set -eu

if command -v hyperframes >/dev/null 2>&1; then
  CMD=hyperframes
else
  CMD=$(ls -t "$HOME"/.npm/_npx/*/node_modules/hyperframes/bin/hyperframes.mjs 2>/dev/null | head -1 || true)
fi
if [ -z "${CMD:-}" ]; then
  echo "没找到 hyperframes。装一个（npm i -g hyperframes），或让它出现在 ~/.npm/_npx 缓存里。" >&2
  exit 1
fi

: "${DO_NOT_TRACK:=1}"
export DO_NOT_TRACK

if [ -z "${HYPERFRAMES_BROWSER_PATH:-}" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Applications/Chromium.app/Contents/MacOS/Chromium" \
           "/usr/bin/google-chrome" "/usr/bin/chromium"; do
    if [ -x "$c" ]; then HYPERFRAMES_BROWSER_PATH="$c"; break; fi
  done
  export HYPERFRAMES_BROWSER_PATH
fi

case "$CMD" in
  *.mjs) exec node "$CMD" "$@" ;;
  *)     exec "$CMD" "$@" ;;
esac
