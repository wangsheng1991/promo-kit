# promo-kit — 可复制的素材内容制作工具

把一套**内容制作规则**做成能整包拷走的工具：选题评分、文案框架与去 AI 味门槛、卡片渲染与满画幅自检。
零 npm 依赖、不联网、不需要密钥、不发布任何内容。拷到另一台电脑，`./install.sh doctor` 通过就能出图。

> 起点是浙大 REAL Lab / 北大 OpenDCAI 的开源项目 [Easel](https://github.com/ZJU-REAL/Easel)（Apache-2.0）。
> 这里**没有**安装 Easel，也没有它的运行时、Web 工作台、Python 媒体依赖或浏览器登录态；
> 只搬了它的方法论（评分维度与阈值、文案框架、去 AI 味规则、卡片骨架与硬门禁、合规判定原则）。
> 哪些是上游的、哪些是我们改的，见 `NOTICE.md` 与 `THIRD-PARTY.md`。

## 30 秒上手

```sh
./install.sh doctor                      # 这台机器能不能跑
./install.sh demo                        # 渲染示例卡片，产物在 demo/out/
```

`demo/out/` 里会得到：`card-01.png … card-05.png`（1080×1440）、`cards.audit.json`（每张的量化自检）、
`contact-sheet.html`（用浏览器打开，一张总览抽检）。

渲染自己的卡片：

```sh
cp config.example.json promo.config.json   # 可选，改 Chrome 路径 / 输出目录 / 品牌
node bin/promo.mjs cards my-cards.json --out out --strict
```

## 它做什么、不做什么

| 做 | 不做 |
|---|---|
| 把一份 JSON 规格渲染成小红书竖版卡（封面 / 账本行 / 管线 / 矩阵 / 数据 / 金句） | 不发布任何内容，不碰登录态，不做排期执行 |
| 渲染后逐张量化自检：内容跨度、内部空白带、四带、溢出 | 不替你判断「这条内容值不值得做」 |
| 方法论技能：选题评分、文案框架与两道门、合规与质量门禁，外加总入口 `promo-ops` | 不生成图片素材、不做视频、不调模型（除非调用方自己有 key） |
| `doctor` 检查 node / Chrome / 中文字体 / 输出目录 / 模板，并扫一遍包里有没有本机绝对路径或密钥 | 不需要数据库、队列、后台服务或 Web 工作台 |

## 目录

```
promo-kit/
├── install.sh                 安装与自检入口（doctor / skills / demo）
├── config.example.json        配置模板（全部可选，缺项降级）
├── bin/promo.mjs              CLI：doctor · cards（零依赖，只用本机 Chrome）
├── templates/card/            卡片模板：card.html + card.css + render.js（渲染 + 自检一体）
├── demo/cards.json            示例规格；demo/out/ 是渲染结果
├── skills/                    方法论技能（普通 SKILL.md，任何能读技能的智能体都能用）
│   ├── promo-topic-score/     选题七维评分与阈值
│   ├── promo-copy/            文案框架 + 钩子公式 + 去 AI 味两道门
│   └── promo-quality-gate/    发布前合规关 + 质量关（固定判定矩阵）
├── upstream/easel-skills/     上游方法论语料（269 个 md，Apache-2.0，可整目录删掉）
├── NOTICE.md                  来源与改动声明
├── THIRD-PARTY.md             第三方组件与其许可
└── LICENSE-Apache-2.0.txt     Apache-2.0 全文（适用上游衍生部分）
```

## 卡片规格（`cards.json`）

```json
{
  "brand": "你的品牌",
  "source": "来源：你的出处行",
  "cards": [
    { "kicker": "选题", "title": "先评分，再动手", "size": "sm", "lede": "一句副标",
      "rows": [ { "main": "主行", "sub": "副行 26px", "tag": "25%", "bold": "要强调的词" } ],
      "note": "一句收尾", "page": "1/5" },
    { "kicker": "流程", "title": "五步", "steps": [ { "title": "定框架", "desc": "说明" } ] },
    { "kicker": "骨架", "title": "六种骨架", "cells": [ { "num": "01", "title": "封面", "text": "说明", "accent": false } ] },
    { "kicker": "数据", "title": "一个数字", "stats": [ { "num": "≥45/50", "unit": "AI 味门", "label": "一句解读" } ] },
    { "kicker": "原则", "title": "金句", "quote": "一句话", "by": "出处", "breathing": true }
  ]
}
```

字段：`size` = `sm` / 默认 / `lg`；`rows` 4-6 行；`steps` ≥4；`cells` 3×2 六格（最多一格 `accent`）；
`stats` 巨型数字；`breathing: true` 让金句卡免填充率检查（仍要求三锚点）。`brand` / `source` / `page`
可以在卡片级覆盖。未知字段被忽略，不会报错。

## 渲染后的自检（这是这个工具的核心）

每张卡渲染完会立刻量一遍，写进 `cards.audit.json`：

| 检查 | 阈值 | 依据 |
|---|---|---|
| 内容跨度 | ≥ 75% 画高 | `layout-laws.md`：内容必须覆盖 ≥75% 画高（1440px 画布 → ≥1080px） |
| 最大内部空白带 | ≤ 216px（15% 画高） | 同上：无理由的纯空白带 >15% 判失败 |
| 四带自检 | 底部带必须有内容；相邻两带不能同时为空 | 纵切 0-25 / 25-50 / 50-75 / 75-100 四带 |
| 溢出 | 横纵溢出 ≤ 4px | 文字或元素超出画幅即失败 |
| 呼吸型（金句卡） | 免填充率，但必须有顶 kicker + 底出处行 + 发丝线三锚点 | 金句/单句陈述允许较空，空白无锚点读作「缺内容」 |

`--strict` 时任何一张失败就以退出码 1 结束——可以直接挂进 CI 或预提交钩子。
失败不要用装饰块去填，按上游的欠填修正阶梯来：**先补内容 → 再换高容量骨架 → 最后才换 1:1 画幅**。

## skills/ 怎么用

`skills/*/SKILL.md` 是普通 Markdown（YAML frontmatter + 正文），不绑定任何一家运行时：

```sh
./install.sh skills ~/.claude/skills                       # Claude Code
./install.sh skills .agents/skills                         # Codex / 通用 agents 目录
./install.sh skills "$APP_DATA/agents/$AGENT/agent_state/skills"   # PenguinHarness
```

它们给智能体的能力是**判断**：选题该不该做（七维评分 + 阈值）、这条文案能不能过（框架选择 +
七轮扫描 + AI 味 ≥45/50 与综合 ≥35/50 两道门）、发布前会不会踩合规（绝对化用语、虚假宣传、版权、
小红书导流与软广、抖音诱导互动、B站引战）。技能里的 `references/` 是上游原文副本，带来源注释。

另外两个不用装到别处也能用：

- `promo-ops` —— **总入口**。听到「做宣传 / 出素材 / 做物料 / 做卡片 / 做动图或短视频 / 写推广文案」
  时该走的路：先要一张任务单（`skills/promo-ops/references/task-order.md`），再按物料种类派给
  `promo-kit`、HyperFrames、`ruic-motion-reel` 或 content-engine，最后过四道门禁打包。它只出物料，
  **不发布**。
- `bin/hf.sh` —— 找到本机的 HyperFrames CLI 并设好它要的环境变量再转发参数。本机 `npx hyperframes`
  会去要最新版然后失败，用这个壳就能跑：`./bin/hf.sh doctor`、`./bin/hf.sh render <项目> --format gif -o out.gif`。

## 跨机器

- **必须有**：Node 20+、一个 Chrome / Chromium、一份中文字体（macOS 自带 PingFang / Hiragino；
  Linux 装 `fonts-noto-cjk`）。`doctor` 会逐项告诉你缺什么。
- **不必须有**：npm、Python、模型 API key、任何平台账号。
- **路径**：模板与 CLI 都用相对路径，没有写死本机目录；Chrome 路径用 `--chrome`、`PROMO_CHROME`
  或 `promo.config.json` 的 `chrome` 指定。
- **接入已有内容流水线**（可选）：`promo.config.json` 的 `content_engine.repo` 指向本机的
  content-engine 时，卡片可以作为 `topics/<slug>/` 那套契约的物料层；不填就完全独立运行。

## 明确不做

不发布、不排期执行、不抓平台数据、不装依赖、不要密钥、不建后台服务；
不做 AI 生图/生视频/配音/克隆；不把上游平台规则当成本地已验证的事实（平台政策会变，用前自己核一遍）。
