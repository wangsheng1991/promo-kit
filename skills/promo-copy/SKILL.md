---
name: promo-copy
description: Write one promotion post that does not read as AI — pick the copy framework (PAS/AIDA/BAB/FAB/4U/STAR/SLAY), build the opening from the hook and title formula library, run the seven focused sweeps, then pass two separate score gates (Chinese AI-tell ≤ 45/50 fails, general polish ≥ 35/50 to ship). Use for小红书笔记、知乎回答、公众号导语、Dev.to/Bluesky 文案，or whenever a draft must be de-slopped and every number traced back to evidence. Hand the finished draft to promo-quality-gate.
short_description: Framework, hooks and the two de-AI score gates for one post.
short_description_zh: 一条推广文案：框架 → 钩子 → 七轮扫描 → 去 AI 味两道门。
version: 1
updated: 2026-10-08T03:05:00Z
---

# 推广文案（框架 + 钩子 + 去 AI 味）

写**一条**推广文案的方法：先定信息怎么排布，再定开头抓不抓得住，最后两道分数门把手。
素材来自上游 Easel 的 `copywriting` / `post-formatter` / `social-content` / `skill-hook-generator` /
`text-polisher`，值钱的部分是框架选择规则、钩子公式和**两道门的阈值**，不是句式库本身。

**边界**：本技能出文案。事实够不够、能不能发，交给 `promo-quality-gate`；选题值不值得做交给
`promo-topic-score`；卡片和海报排版交给卡片工具。

## 输入

| 参数 | 必填 | 说明 |
|---|---|---|
| 主题与角度 | 是 | 通常来自 `topics/<slug>/`，角度已由 `promo-topic-score` 定过 |
| 目标平台 | 是 | 决定字数、语气、钩子类型和小红书特化是否启用 |
| 语言 | 是 | 中文／英文；中英混排的排版由 `content lint` 兜底 |
| 可用证据 | 是 | `topics/<slug>/evidence.json` 的 `claims[]`；**没进 evidence 的数字不许写进文案** |
| 账号语气 | 否 | 有画像时按其语气；没有就退回通用专业／对话体 |

## 输出

1. `data/promo/<slug>/drafts/<platform>.md` — 成稿（含标题、正文、CTA、标签/话题）。
2. `data/promo/<slug>/drafts/text-scan.json` — 评分与逐轮问题，格式：

```json
{
  "platform": "xiaohongshu",
  "ai_gate": { "直接性": 9, "节奏": 9, "信任度": 10, "活人感": 9, "精炼度": 9, "total": 46, "verdict": "pass" },
  "quality_gate": { "清晰度": 8, "节奏感": 8, "真实感": 8, "价值密度": 7, "语气匹配": 8, "total": 39, "verdict": "pass" },
  "sweeps": [{ "round": "证据", "issue": "<具体问题>", "fix": "<改法>" }],
  "claims_used": ["<evidence.json 里的 claim id>"]
}
```

## 第一步：选框架（选定后只用一个，不混用）

框架决定**信息怎么排布**，不决定字怎么写。选自 `references/copy-frameworks.md`：

| 框架 | 结构 | 什么时候用 |
|---|---|---|
| PAS | 痛点 → 放大 → 方案 | 读者有明确痛点、要转化（种草、卖服务、详情页） |
| AIDA | 注意 → 兴趣 → 欲望 → 行动 | 从围观引到心动、做推广、新品／活动预热 |
| BAB | 现状 → 改变后 → 桥梁 | 前后对比强烈的转变 |
| FAB | 特性 → 优势 → 利益 | 逐条提炼卖点；写法「因为{特性}，所以{优势}，这意味着你能{利益}」 |
| 4U | 有用／紧迫／独特／具体 | 标题与信息流首行的**自检**，四条尽量多占 |
| STAR | 情境 → 任务 → 行动 → 结果 | 案例复盘、怎么做到的 |
| SLAY | 故事 → 道理 → 建议 → 你 | 讲故事、输出观点、求共鸣与评论 |

判断依据是**内容目的，不是平台**。一条内容只挂一条主线。

## 第二步：开头（钩子与标题）

首行／首图／前 3 秒决定 90% 的表现。**每次只用一个公式**，不要混。

- 短视频/卡片钩子公式库（`references/hook-formulas.md`）：数字领衔、逆向认知、个人蜕变、权威借势、
  自我坦白、未来冲击。每种输出两行——第 1 行开场、第 2 行反转，**每行 ≤40 字符**，不用问句，
  开场是具体/意外的事实，反转要构成矛盾或颠覆。
- 标题与首行公式族（`references/hook-title-formulas.md`）：利益型、痛点型、人群/身份型、反差悬念型、
  数字证据型、清单干货型、提问发现型；外加互动引导（提问／二选一／填空／观点邀请／收藏引导）。
- 四个自检：**具体优于空泛**（「3 个月涨 5 万粉」优于「涨粉很快」）、匹配平台、匹配账号调性、只用一个公式。

## 第三步：七轮聚焦扫描

每轮只关注一个维度，不要一轮里什么都改：

| 轮次 | 维度 | 检查什么 |
|---|---|---|
| 1 | 清晰度 | 主旨 5 秒内能抓到吗？有没有模糊句？ |
| 2 | 语气 | 匹配受众与账号调性吗？ |
| 3 | 价值感 | 每段是否给具体价值？能加数字／案例吗？ |
| 4 | 证据 | 论点有支撑吗？数字准确吗？**每个数字回到 `evidence.json`** |
| 5 | 具体性 | 「节省时间」→「把每周的报告从 4 小时压到 15 分钟」 |
| 6 | 情感 | 有没有和读者建立连接？ |
| 7 | 风险 | 歧义、冒犯、法律风险（绝对化用语在这一轮就要拦，详见 `promo-quality-gate`） |

## 第四步：两道门（顺序固定，都过才交付）

1. **AI 味专项门（前置）** — 中文五维：直接性／节奏／信任度／活人感／精炼度，各 10 分，满分 50。
   **≥45/50 才算过**；不过先改，别急着评综合。评分表见 `references/zh-ai-markers.md`。
2. **通用润色门（综合）** — 清晰度／节奏感／真实感／价值密度／语气匹配，各 10 分，满分 50。
   **≥35/50 才交付**；不过继续改。

两个分数**量纲相同、把关维度不同，不要求平均、不许合并成一个分**。

去 AI 味的 8 条硬规则（`references/phrases-to-remove.md`、`references/structures-to-avoid.md`、`references/checklist.md`）：

1. 砍填充短语 — 「首先／值得注意的是／毫无疑问／在当今……」全删。
2. 打破公式结构 — 不用「不是 X，而是 Y」二元对比，不用修辞设置。
3. 主动语态 — 每句有人在做事的动作；不让无生命物执行人的动作（「数据告诉我们」→「我看了数据」）。
4. 具体化 — 不说「原因是结构性的」，说出那个原因。
5. 让读者身临其境 — 「你」胜过「人们」，具体胜过抽象。
6. 变化节奏 — 长短句交替；**两项胜过三项**；不用破折号。
7. 信任读者 — 跳过铺垫和辩护，直接陈述。
8. 砍金句 — 听起来像能被引用的句子，重写。

中文特化（见 `references/zh-ai-markers.md`）：删「说白了／综上所述／不仅……更……」这类词与结构；
不用破折号 `——` 与「标题：内容」式内联冒号；禁「标志着／彰显了／赋能／一站式」这类宣传腔；
模糊归因（「专家认为」「研究表明」）必须给具体来源，给不出就删整句。
加活人感靠第一手细节与体感（「我当时就愣住了」），不靠感叹号。

**小红书额外要求**：闺蜜语气、素人感、允许口语碎句；emoji 是断句节拍不是装饰（每行 0-2 个）。
**英文草稿**不做中文特化，但一样跑两道门的维度（`content lint` 只管排版，不管 AI 味）。

## 第五步：本地落盘与衔接

- 成稿写 `data/promo/<slug>/drafts/<platform>.md`；能给 content-engine 用的字段
  （平台标题、hook、tags）回填 `topics/<slug>/source.yaml` 的 `platforms.<platform>`，这样
  `node bin/content.mjs build` 才会把它编译进 `dist/drafts/<slug>/<platform>/post.md`。
- 跑 `node bin/content.mjs lint` 过中文排版（中西文空格、全角标点、重复标点、直角引号）；
  它**不检查 AI 味**，别拿它当本技能的替代。
- **小红书与知乎的发布是人工作业**（见 `content-ops`）：本技能只出稿，不进任何自动发布队列。

## 规则

1. 没有进 `evidence.json` 的数字、排名、用户评价，不许写进文案；宁可写少。
2. 两个门都要在 `text-scan.json` 里留分与 verdict；不达标不许交稿。
3. 一次只用一个框架、一个钩子公式。
4. 平台事实（字数上限、标签规则、尺寸）不在这里写死，属于 `promo-quality-gate` 与 `docs/OPS_STACK.md`。
5. 中文文案交付前必须过 `content lint`。

## 自检

- [ ] 只用了 1 个框架、1 个钩子公式
- [ ] `text-scan.json` 里两道门都 pass（AI 味 ≥45/50，综合 ≥35/50）
- [ ] 每个数字都能指到 `evidence.json` 的 claim id
- [ ] 没有破折号、没有「首先/值得注意的是」、没有绝对化用语
- [ ] 中文稿过了 `content lint`
- [ ] 小红书/知乎稿明确标注为人工发布

## Source

- Upstream project: [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel)
- License: Apache-2.0
- Upstream commit: `fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`
- Original paths: `skills/shared/references/copy-frameworks.md`, `skills/shared/references/hook-title-formulas.md`,
  `skills/openclaw/skill-hook-generator/{SKILL.md,references/hook-formulas.md}`,
  `skills/openclaw/text-polisher/{SKILL.md,references/{zh-ai-markers,phrases-to-remove,structures-to-avoid,checklist}.md}`,
  `skills/openclaw/{copywriting,post-formatter,social-content}/SKILL.md`
- Local changes: 三个上游 SKILL（`skill-hook-generator`、`copywriting`/`post-formatter`、`text-polisher`）合并成一条
  写作流程（同一时刻读，拆开只增加切换成本）；产出路径改为 `data/promo/<slug>/drafts/` 与 `source.yaml` 回填；
  加入证据闸门（数字必须回到 `evidence.json`）与 `content lint` 步骤；删除 OpenClaw 运行时、Profile 注入
  与 `outputs/` 约定；平台发布规则改由 `promo-quality-gate` 与 `content-ops` 负责。
