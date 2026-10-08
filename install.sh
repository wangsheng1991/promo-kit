#!/usr/bin/env sh
# promo-kit 安装 / 自检 —— 零网络、零 npm、零 sudo。
#
#   ./install.sh doctor              检查这台机器能不能跑（node / Chrome / 中文字体 / 输出目录 / 模板 / 无本机路径与密钥）
#   ./install.sh skills [目标目录]    把 skills/ 里的方法论技能复制到目标目录
#   ./install.sh demo                渲染 demo，产物落在 demo/out/
#
# skills 目标目录的常见约定（不给参数时只打印提示，不猜）：
#   PenguinHarness   <app_data_dir>/agents/<agent_id>/agent_state/skills
#   Claude Code      ~/.claude/skills  或项目里的 .claude/skills
#   Codex / 通用      ~/.agents/skills 或项目里的 .agents/skills
# 复制是幂等的：同名目录会被覆盖（已有改动先自己备份）。

set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
NODE=$(command -v node || true)

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
}

cmd=${1:-help}

case "$cmd" in
  doctor)
    [ -n "$NODE" ] || { echo "没找到 node。装 Node 20+ 再来（不需要 npm install）。"; exit 1; }
    exec node "$HERE/bin/promo.mjs" doctor
    ;;

  demo)
    [ -n "$NODE" ] || { echo "没找到 node。装 Node 20+ 再来。"; exit 1; }
    exec node "$HERE/bin/promo.mjs" cards "$HERE/demo/cards.json" --out "$HERE/demo/out" --strict
    ;;

  skills)
    target=${2:-}
    if [ -z "$target" ]; then
      echo "没有给目标目录。样例："
      echo "  ./install.sh skills ~/.claude/skills"
      echo "  ./install.sh skills \"\$HOME/.penguin/data/<project>/agents/<agent>/agent_state/skills\""
      exit 1
    fi
    mkdir -p "$target"
    for d in "$HERE"/skills/*/; do
      [ -d "$d" ] || continue
      name=$(basename "$d")
      rm -rf "$target/$name"
      cp -R "$d" "$target/$name"
      echo "已装 $name → $target/$name"
    done
    echo
    echo "skills 是普通 Markdown（SKILL.md + frontmatter），任何能读技能的智能体都能用；"
    echo "本工具自己的渲染能力不依赖技能目录：node bin/promo.mjs cards <spec.json> 就能出图。"
    ;;

  help|-h|--help|"")
    usage
    ;;

  *)
    echo "未知命令：$cmd"; echo; usage; exit 1
    ;;
esac
