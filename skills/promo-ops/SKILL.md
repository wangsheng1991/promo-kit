---
name: promo-ops
description: Entry point for making any promotional or operations material for Wangsheng's products — 宣传资料、推广素材、物料、运营材料: card sets, notes, GIFs, short videos, product demos, before/after animations, publish packs. Use whenever the request is to 做宣传、出素材、做物料、做一套卡片、做动图或短视频、写推广文案、排推广计划、给某个产品做推广, or to turn a product page / repo / feature into material for 小红书 / 知乎 / 公众号 / B站 / Dev.to / Bluesky. It takes or interviews for a task order, routes each deliverable to the right engine (promo-kit, HyperFrames, ruic-motion-reel, content-engine, the three promo-* skills), runs the fixed gate order, and packages material for a human to publish. It never publishes.
short_description: Entry point for promo and operations material, from order to pack.
short_description_zh: 宣传素材总入口：填单 → 卡片/动图/视频 → 四道门禁 → 交付包。
version: 1
updated: 2026-10-08T07:20:00Z
---

# 宣传与运营素材（总入口）

一句话：**先把「做什么」写成一张单，再按种类派给对的引擎，最后过门禁打包交给人发。**
这个技能是入口，不是执行器——具体的阈值和判定规则在 `promo-topic-score` / `promo-copy` /
`promo-quality-gate` 三个技能里，别在这里重复实现。

设计依据：`promo-playbook.md`（§9 工具包、§10 分工与门禁）、`promo-integration-plan.md`（引擎与目录设计）。

## 0. 边界（先记死）

- **不发布**。站点/GitHub/HF/RSS 这类 Tier A 交给 `content-ops`；小红书/知乎/公众号/B站**一律人工**，本技能只出物料与草稿，不碰登录态、不上传、不排期执行。
- **不编事实**。数字、效果、对比都要追到来源；没有出处的效果声明直接删，不「润色成能发的」。
- **不替用户决定诉求**。CTA、受众、不做什么，缺就问一轮，不猜。

## 1. 第一步永远是拿任务单

模板：`references/task-order.md`（同目录）。

用户只给三行就够开工：

```text
主题：<一句话说清推什么> + 链接
物料：<竖版卡 / 长图文 / GIF / 竖版视频 / 产品演示 / 前后对比 / 15 秒片头，各几件>
平台：<发到哪>
```

缺证据、受众、CTA、「不做什么」这四项，**先问一轮**，问完再动手。用户已经给了完整单子（或
`promo-orders/<slug>.md`）就直接进第 2 步。

默认组合（没说就是它）：5 张竖版卡 + 1 篇笔记草稿 + 1 段 GIF + 1 支 15 秒竖版视频。

## 2. 按物料派活

| 要的东西 | 谁做 | 怎么调 |
|---|---|---|
| 竖版卡 1080×1440（六骨架 + 逐张审计） | `promo-kit` | `node $KIT/bin/promo.mjs cards <spec.json> --out <dir> --strict` |
| 动图 GIF | HyperFrames | `$KIT/bin/hf.sh render <项目> --format gif --gif-loop 0 -o out.gif` |
| 竖版短视频 / 产品演示 / 前后对比 | HyperFrames | `$KIT/bin/hf.sh render <项目> --format mp4 -o out.mp4` |
| 15 秒动效片头 | `ruic-motion-reel` | 按该技能跑，用 `shared_env/ruic-motion-reel/venv` 里的 python |
| 长图文 / 笔记 / 知乎 / 公众号 | `promo-copy` + `promo-quality-gate` | 写稿 → 两道分数门 |
| 标题、钩子、选题做不做 | `promo-topic-score`、`promo-copy` | 七维评分、钩子公式 |
| 站点 / Dev.to / Bluesky 成稿与草稿 | `content-engine` + `content-ops` | `content new / lint / verify / build / publish` |

`$KIT` = `$HOME/.penguin/data/default_project/agents/default_agent/shared_env/promo-kit`
（活的工作副本；同目录还有一个可整包拷走的快照）。**先跑 `$KIT/install.sh doctor`**，7 项全 OK 再动手。

## 3. 固定顺序（八步，四道门）

1. **选题评分** —— `promo-topic-score`。≥70 做 / 50–69 改角度 / <50 停，把结论落成 `score.json`。
2. **取证** —— 来源、数字、自家实测写成有 id 的事实清单。事实只在 `topics/<slug>/` 存一份。
3. **文案与分镜** —— `promo-copy` 出稿 + 分镜；事实性文字都挂 `source_refs`。
4. **规格签字** —— 合成 `creative.json`（`schema_version: "promo-creative/v1"`，含 `cards[]` 与可选 `scenes[]`）。**这是唯一必须人签的点。**
5. **静态渲染** —— `promo-kit cards` 出 PNG + `cards.audit.json`；人看 contact sheet 抽检。
6. **动效/视频** —— HyperFrames（或 ruic）；项目目录放 `data/promo/<slug>/hyperframes/<run-id>/`，不进 `topics/`。
7. **门禁** —— 顺序固定，前面能拦后面，后面的门**不能覆盖**前面的失败：
   `content lint` → `content verify --online --strict` → `promo-quality-gate`（合规关 → 质量关）→ HyperFrames `lint/check/validate`（只有视频产物时跑）。
   卡片另跑 `cards.audit.json`：跨度 ≥75% 画高、无理由空白带 ≤216px、四带自检、溢出 ≤4px。
8. **打包** —— 合成一份机器可读的 `gate.json`（各项 `status` + `blocking` + 人工签字 + 产物 hash），把可发布的目录交出去。**不做任何平台发布动作。**

机器 `pass` ≠ 已授权发布；最终状态要「所有启用项通过 + 有人签字」才算可交付。

## 4. 产物放哪（别各建一套）

| 内容 | 唯一位置 |
|---|---|
| 事实、引用、brief、终审文案 | `~/code/content-engine/topics/<slug>/` |
| 评分、草稿、分镜、门禁结果、渲染中间物 | `~/code/content-engine/data/promo/<slug>/`（git-ignored） |
| 可复制模板、无状态脚本、schema | `$KIT/` |
| 成品 PNG／MP4／GIF、交付包 | `$KIT/outputs/<slug>/<run-id>/`；**批准后**才复制进 `topics/<slug>/assets/` |

`topics/<slug>/assets/` 是站点 CI 必须拿到的源文件（CI 在 ubuntu 上没有 Chrome 和中文字体），所以只有签过字的成品才进去；`dist/` 永不手改。

**交付（把素材送出去）**：图片 / GIF / 小视频走 **GitHub**——提交进内容源仓库的 `topics/<slug>/assets/`，或推到专用仓库，然后给对方两个可用的地址：

- 可浏览：`https://<owner>.github.io/<repo>/<path>`（Pages）
- 给机器读：`https://raw.githubusercontent.com/<owner>/<repo>/main/<path>`

**超过 100 MB 的视频不上 GitHub**（单文件上限 100 MB），走阿里云盘 `DLSS5-Studio/<批次>/`。推送是对外动作：**动手前拿到一句明确许可**，别自己发起。

两个已知的坑：首次 push 会被代理打成 `RPC failed; HTTP 400`，改用
`git -c http.postBuffer=104857600 -c http.version=HTTP/1.1 push` 就过；新开的 Pages 第一次构建会
`Page build failed.`，补一个空 `.nojekyll` 再推，约 1–2 分钟上线（没有 `index.html` 时站点根目录是 404，所以链接要指到具体文件）。

## 5. 硬红线

- 素材版权：**「能解析」不等于「可商用」**。HeyGen / media-use 目录里的通用 BGM、图库不直接上小红书、抖音和商业站点。配乐优先序：平台官方商业音乐库 → 自购并留存凭证 → 自制无采样 → 无音乐版；每个音频记 `license_ref`（用途、地区、期限、证据路径）。落地失败就降级，不重试到发布、不下载来历不明的文件。
- 合规：绝对化用语、无来源的效果承诺、医疗功效、未授权商标与肖像，一律在门禁处拦下。
- 不把 AI 生成内容、声音克隆、热点改写直接当最终广告。

## 6. 本机环境卡点（踩过）

- `npx hyperframes` 会去要最新版然后失败（本机 npm 不稳）；**用 `$KIT/bin/hf.sh`**，它会找到 npx 缓存里的可用版本并设好 `DO_NOT_TRACK` 与 `HYPERFRAMES_BROWSER_PATH`。
- HyperFrames 直接支持 `--format mp4|webm|mov|gif|png-sequence|hls`；GIF 加 `--gif-loop 0`，它自己的说明是「gif 在 15fps 最好」。输出参数是 `-o/--output`，项目目录是位置参数。
- 本地 whisper-cpp / Kokoro TTS / MusicGen **没装**（转写、配音、配乐要用云端或自备）；Docker 没开（只有云渲染需要）。
- Intel Mac、无 NVIDIA；出口只有 127.0.0.1:1082。

## 7. 每次交付要报三个数

**合格物料数 / 人工审阅分钟数 / 渲染耗时**。第一周只用它们取基线，不看曝光量下结论。

## 8. 还没接的线（照实说，别假装有）

`creative.json → 卡片` 的适配、`render-handoff.json`、四道门禁合成 `gate.json`、打包命令，
目前是设计稿（`promo-integration-plan.md`），**没有实现**。第一单做这些胶水是任务的一部分；
做完就固化成命令，之后照第 2 节直接调。别对外声称已经有 `promo package` 这类命令。
