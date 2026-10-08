# NOTICE — promo-topic-score

本技能是 [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel) 的方法论改写版（Apache-2.0）。
**不是上游代码的复制安装**：上游的 OpenClaw 运行时、Web 工作台、Python 依赖与浏览器登录态一律没有引入。

- 上游 commit：`fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`
- 上游文件：
  - `skills/shared/scoring-dimensions.md`（七维、标尺、权重、综合分阈值、敏感赛道）→ 原样副本存于 `references/`
  - `skills/openclaw/skill-topic-evaluator/SKILL.md`（单条深评流程、报告结构）
  - `skills/openclaw/skill-content-matrix/SKILL.md`（批量池与同一口径的约定）
- 本地改动（改写，非逐字复制）：
  1. 删掉 OpenClaw 的 Profile 注入协议与 `outputs/` 目录约定；
  2. 取证步骤换成本机真实工具（`research/tool-radar/radar.py`、Brave 真实 SERP、`docs/GROWTH_PLAN.md`、`docs/TOOL_RADAR.md`）；
  3. 落地路径改为 `topics/<slug>/promo/score.json`，与 content-engine 的 `topics/<slug>/` 契约并存；
  4. 增加自有产品红线（DLSS 不承诺提升帧数、修图能力边界；渲见不承诺造价与工期）；
  5. 报告与规则改为中文，并明确「没有证据的维度要写未取证」。
- `references/scoring-dimensions.md` 为上游原文副本（正文未改动，仅加了一行来源注释）。
- 许可全文见同目录 `LICENSE-Apache-2.0.txt`（Apache License 2.0，未修改）。
