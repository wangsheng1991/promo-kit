# NOTICE — promo-quality-gate

本技能是 [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel) 的方法论改写版（Apache-2.0）。
**不是上游代码的复制安装**：没有引入 OpenClaw 运行时、自动返工触发器或任何真实发布能力。

- 上游 commit：`fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`
- 上游文件：
  - `skills/openclaw/skill-quality-gate/SKILL.md`（合规关 + 质量关、综合判定矩阵、Top 3 修改建议）
  - `skills/openclaw/skill-quality-gate/references/{general-rules,review-dimensions,review-levels,rework-rules,platform-xiaohongshu,platform-douyin,platform-bilibili}.md`（原样副本，存于 `references/`）
  - 上游 `skill-check-compliance` 与 `skill-review-deliverable` 的能力（已在上游合并进本技能）
- 本地改动：
  1. 加入本机三道闸门的分工：`content verify`（证据）→ `content lint`（排版）→ 本门禁（合规 + 质量）；
  2. 产物路径改为 `data/promo/<slug>/quality/gate.json`，并记录 `checked_at` 与规则来源；
  3. 删除 OpenClaw 的自动返工触发；返工改为人工确认、最多一次；
  4. 平台规则标注「会变、需定期复核」，知乎与公众号规则明确标注「上游缺失、需本地核实」；
  5. 显式列出仍需人确认的五件事，并声明本技能不发布任何内容。
- `references/` 下七个文件为上游原文副本，正文未改动，仅加了一行来源注释。
- 许可全文见同目录 `LICENSE-Apache-2.0.txt`（Apache License 2.0，未修改）。
