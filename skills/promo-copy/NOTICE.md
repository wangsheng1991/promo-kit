# NOTICE — promo-copy

本技能是 [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel) 的方法论改写版（Apache-2.0）。
**不是上游代码的复制安装**：没有引入 OpenClaw 运行时、Web 工作台、Python 媒体依赖或任何模型密钥要求。

- 上游 commit：`fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`
- 上游文件：
  - `skills/shared/references/copy-frameworks.md`、`skills/shared/references/hook-title-formulas.md`（原样副本，存于 `references/`）
  - `skills/openclaw/skill-hook-generator/references/hook-formulas.md`（原样副本）
  - `skills/openclaw/text-polisher/references/{zh-ai-markers,phrases-to-remove,structures-to-avoid,checklist}.md`（原样副本）
  - `skills/openclaw/skill-hook-generator/SKILL.md`
  - `skills/openclaw/text-polisher/SKILL.md`（七轮扫描、两道门与 45/50、35/50 阈值）
  - `skills/openclaw/{copywriting,post-formatter,social-content}/SKILL.md`（框架与平台语气）
- 本地改动：
  1. 把上游三个技能（钩子、成稿、润色）合成**一条**写作流程，因为它们在「写一条」的同一时刻被读；
  2. 两道门的阈值与顺序原样保留（先 AI 味 ≥45/50，再综合 ≥35/50），并写入 `text-scan.json`；
  3. 产出路径改为 `data/promo/<slug>/drafts/`，平台字段回填 `topics/<slug>/source.yaml` 的 `platforms.*`；
  4. 增加证据闸门：没有进 `evidence.json` 的数字不得写进文案；
  5. 增加 `node bin/content.mjs lint` 的中文排版步骤（上游没有这一环）；
  6. 小红书/知乎标注为人工发布，不做任何自动发布动作。
- `references/` 下四个/七个文件为上游原文副本，正文未改动，仅加了一行来源注释。
- 许可全文见同目录 `LICENSE-Apache-2.0.txt`（Apache License 2.0，未修改）。
