# NOTICE — promo-kit

本工具包**不是** [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel) 的安装，也不是它的代码副本。
它是把 Easel 的**方法论**（规则、阈值、评分维度、检查清单、骨架定义）改写成可独立运行的形式：
一个零依赖的渲染 + 自检 CLI，加一组普通 Markdown 技能。

- 上游项目：ZJU-REAL/Easel（浙江大学 REAL Lab × 北京大学 OpenDCAI），许可 Apache-2.0
- 上游 commit：`fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`（2026-10-07）
- 导入日期：2026-10-08

## 随包的内容从哪里来

| 本包路径 | 上游来源 | 处理方式 |
|---|---|---|
| `skills/promo-topic-score/` | `skills/shared/scoring-dimensions.md`、`skills/openclaw/skill-topic-evaluator/SKILL.md`、`skills/openclaw/skill-content-matrix/SKILL.md` | 改写：重写流程与输入输出，去掉 OpenClaw 运行时与 Profile 注入 |
| `skills/promo-copy/` | `skills/shared/references/{copy-frameworks,hook-title-formulas}.md`、`skills/openclaw/skill-hook-generator/`、`skills/openclaw/text-polisher/`、`skills/openclaw/{copywriting,post-formatter,social-content}/` | 合并 + 改写：三个上游技能合成一条写作流程，阈值原样保留 |
| `skills/promo-quality-gate/` | `skills/openclaw/skill-quality-gate/`（含 `references/` 七个文件） | 改写：加入本工具的三道闸门分工，平台规则标注「会变、需复核」 |
| 上述三个技能下的 `references/*.md` | 对应的上游 `references/*.md` | **原文副本**，正文未改动，仅在文件头加一行来源注释 |
| `templates/card/` | `skills/openclaw/card-design/references/{layout-laws,card-recipes,anti-ai-slop,typography}.md` 的规则 | 重新实现：把文字规则写成可量化的 HTML/CSS + 自检脚本 |
| `upstream/easel-skills/` | 上游全部 114 个 `SKILL.md` + 148 个 `references/*.md` | **原文副本**，供离线查阅与后续搬运；可以整个目录删掉，不影响工具运行 |

## 我们改了哪些（区分「照搬」与「本地标定」）

**照搬（上游定义的通用生产约束，可直接用）**：
卡片内容覆盖 ≥75% 画高、无理由空白带 >15%（216px）判失败、四带自检、金句卡三锚点；
文案两道门 ≥45/50 与 ≥35/50 及其顺序；选题七维 1-10 标尺、权重 25/20/15/15/10/8/7、
综合分 ≥70/50-69/<50 的决策线；钩子双行每行 ≤40 字符；绝对化用语与虚假宣传的判定原则。

**本地标定（上游不能用，或会变，必须自己核）**：
各平台当前的尺寸、字数、敏感词、广告与版权政策；字体在目标机器上的真实渲染；
`card_audit` 里「什么算实质内容」；我们自身账号的效果阈值。上游值一律记为来源默认值，
本地覆盖必须带 `verified_at` 与证据。

**删除（明确不要的部分）**：
OpenClaw 运行时、FastAPI Web 工作台、Python 媒体依赖（opencv / librosa / faster-whisper / rembg / biliup /
playwright 等）、浏览器 profile 与登录态、发布队列、所有平台真实发布器、AI 生图/生视频/配音/克隆/
自动剪辑等重执行技能。

## 许可

- 上游衍生部分（`skills/*/references/`、`upstream/easel-skills/`、以及据其改写的方法论文本）：
  适用 Apache License 2.0，全文见 `LICENSE-Apache-2.0.txt`。分发时请一并保留本文件与许可全文，
  并说明你做了什么改动。
- 本工具包自己写的文件（`bin/`、`templates/`、`install.sh`、`README.md`、配置文件模板）：
  由本仓库作者撰写，可随包自由使用与修改；其中引用的上游规则仍受上述许可约束。
- 上游仓库没有 NOTICE 文件，因此没有需要随附的上游 NOTICE。
