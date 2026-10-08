---
name: promo-topic-score
description: Score one promotion topic before a word is written, on the seven-dimension rubric (流量潜力/账号匹配/竞争差异化/时效价值/变现潜力/制作成本/合规风险) with fixed weights, the ≥70 / 50-69 / <50 verdict, and the sensitive-vertical warning list. Use when deciding whether a candidate topic or angle deserves a topics/<slug>/ directory in the content-engine pipeline, or when comparing several candidate topics for dlss5nvidia.com or houseplusplus.com. This scores an unmade topic; it does not score a published post.
short_description: Seven-dimension topic scoring with the do/reshape/drop thresholds.
short_description_zh: 选题七维加权评分与「做 / 改方向 / 不做」阈值。
version: 1
updated: 2026-10-08T03:05:00Z
---

# 选题评分（七维）

判断一个**还没做**的选题值不值得做。维度、标尺、权重是固定的，来自上游 Easel 策划层的唯一口径
（本仓库 `references/scoring-dimensions.md`，与批量选题池共用同一把尺子）。

**边界**：本技能只回答「做 / 改方向 / 不做」，不写文案、不排版、不发布。写完的内容用 `promo-quality-gate`。
已有发布数据的内容复盘属于另一件事，不要用本技能替代。

## 何时用

- 一句话想法、热点、竞品拆解、或 `research/` 跑出来的关键词，要决定是否立项。
- 一次有 3 个以上候选题，需要排序，先做哪个。
- 一个选题被否掉，要留下理由和替代方向（否则下周会有人再提一遍）。

## 输入

| 参数 | 必填 | 说明 |
|---|---|---|
| 选题 | 是 | 一句话描述，或关键词 + 角度 |
| 目标平台 | 否 | 小红书 / 知乎 / 公众号 / B站 / Dev.to / Bluesky；有账号画像时从画像取 |
| 目标站点 | 否 | dlss5nvidia.com / houseplusplus.com，决定「变现潜力」按哪个口径算 |
| 候选池 | 否 | 多个选题时逐个评分，再用同一把尺子排序 |

## 输出

写到 `topics/<slug>/promo/score.json`（决策留档，随主题进版本库），并在对话里给出 Markdown 报告：

```json
{
  "topic": "<一句话选题>",
  "platform": "<平台或 generic>",
  "site": "<站点 slug>",
  "scored_at": "2026-10-08T03:05:00Z",
  "dimensions": [
    { "id": "traffic",   "score": 7, "evidence": "<具体依据，禁止空泛>" },
    { "id": "fit",       "score": 9, "evidence": "..." },
    { "id": "diff",      "score": 6, "evidence": "..." },
    { "id": "evergreen", "score": 5, "evidence": "..." },
    { "id": "money",     "score": 8, "evidence": "..." },
    { "id": "cost",      "score": 9, "evidence": "..." },
    { "id": "risk",      "score": 8, "evidence": "..." }
  ],
  "weighted_total": 74.5,
  "verdict": "做 | 改方向 | 不做",
  "sensitive_vertical": false,
  "optimizations": ["..."],
  "alternatives": ["..."]
}
```

Markdown 报告用同样的维度表 + 综合分 + 结论 + 逐维分析 + 优化建议/替代选题。

## 七个维度与标尺

每维 1-10 分。**制作成本、合规风险是反向维度**：分数越高＝成本越低／风险越低，这样七维可以加权相加，分越高越值得做。

| 维度 | 1-3 分 | 4-6 分 | 7-8 分 | 9-10 分 |
|---|---|---|---|---|
| 流量潜力 | 小众冷门，痛感弱，月搜索 <1000 | 有一定热度，同类内容有稳定流量 | 热门话题，搜索量高或踩中时效热点 | 全民级热点，或精准戳中大体量人群刚需 |
| 账号匹配 | 完全偏离账号定位 | 有关联但需跨领域延伸 | 与核心定位相关，有内容承接 | 正中账号最强领域，强化人设 |
| 竞争差异化 | 同类 >100 条，高度饱和，无新角度 | 有竞争但角度可差异化 | 竞争适中，有明显空白角度 | 蓝海领域，几乎无同类优质内容 |
| 时效价值 | 已过时或即将过时 | 时效一般，1 周内有效 | 常青 + 时效双重价值 | 常青话题，长期有搜索价值 |
| 变现潜力 | 纯娱乐，无商业价值 | 可做品牌背书但难直接变现 | 可自然接商单或带货 | 高客单／高转化品类，变现路径顺 |
| 制作成本（反向） | 需专业设备／外景／多人协作 | 需准备素材但个人可完成 | 只需文字或简单拍摄 | 纯文字／口播／已有素材可直接用 |
| 合规风险（反向） | 高危赛道，易违规限流 | 有敏感点，需谨慎措辞 | 轻微风险，规避即可 | 无合规风险 |

（完整标尺见 `references/scoring-dimensions.md`。）

## 加权与阈值

| 维度 | 权重 |
|---|---|
| 流量潜力 | 25% |
| 账号匹配 | 20% |
| 竞争差异化 | 15% |
| 变现潜力 | 15% |
| 时效价值 | 10% |
| 制作成本 | 8% |
| 合规风险 | 7% |

综合分 = Σ(维度得分 ÷ 10 × 权重 × 100)，满分 100。**维度、标尺、权重不改**；只允许按阶段目标微调权重
（例如变现期上调「变现潜力」），且必须在报告里写明用了哪一版权重。

| 综合分 | 结论 |
|---|---|
| ≥ 70 | 做 — 立刻排期 |
| 50-69 | 改方向 — 调整角度／形式／时机后再评，附至少 2 条优化建议 |
| < 50 | 不做 — 附至少 2 个替代选题 |

## 敏感赛道

以下赛道在「合规风险」维度必须扣分，并标 ⚠️ 与合规建议：
医美／轻医美、财商理财、母婴育儿、K12 教育、健康养生、护肤功效、职场收入、婚恋情感。

我们自己的红线（不是上游的，来自 `docs/GROWTH_PLAN.md` 与产品事实）同样适用，例如：不得承诺
「提升帧数」「修复画质」这类产品做不到的效果；渲见不得承诺具体装修造价或工期。命中就写进
`evidence` 并降分，不要只写在结论里。

## 执行步骤

1. **解析意图** — 提取选题的核心关键词与类型（知识干货／情绪共鸣／热点追踪／人设展示／带货种草／争议讨论）。
   没给平台就按类型推断最合适的平台，或直接问。
2. **取证** — 每个维度的分数必须能指到证据，而不是感觉：
   - 流量潜力：`research/tool-radar/radar.py` 的联想词、真实 SERP（Brave 走真 Chrome，Google 对本机常返回 `google.com/sorry`）。
   - 竞争差异化：搜同类内容，数一下有多少条、头部是否占位；**说明用的是哪个引擎、什么时候查的**。
   - 账号匹配：读 `docs/GROWTH_PLAN.md`、`docs/TOOL_RADAR.md`，以及 topic 已有的 `source.yaml`（避免和自己重复）。
   - 制作成本：按本机能力估（Node/无头 Chrome/ruic-motion-reel/HyperFrames 能做，NVIDIA 类做不了）。
   取不到证据的维度**降分并在 `evidence` 里写「未取证」**，不要假装查过。
3. **逐维打分** — 每维带具体依据；分数与依据一起给，别只给分。
4. **算综合分并判结论** — 按上表阈值给「做／改方向／不做」。
5. **落档** — 写 `topics/<slug>/promo/score.json`；多候选题时同样写多份，再排序。
6. **交出结论** — 对话里给报告；「改方向」附 ≥2 条优化建议，「不做」附 ≥2 个替代选题。

## 规则

1. 评分必须基于证据，禁止凭感觉打分；**没有证据的维度要写出「未取证」**。
2. 每维说明不可空泛：说清是哪个平台、哪个关键词、哪条竞品。
3. 「改方向」必须附 ≥2 条优化建议；「不做」必须附 ≥2 个替代选题。
4. 不推荐超出本机能力的选题（没有 NVIDIA、没有真人出镜、没有付费数据接口）。
5. 敏感赛道与自有红线命中必须在维度里扣分并标注，不能只在结论里提一句。

## 自检

- [ ] 七维都有依据，或明确写了「未取证」
- [ ] 综合分用的权重版本已写明
- [ ] 结论落在 ≥70 / 50-69 / <50 三档，没有自造档位
- [ ] 敏感赛道与产品红线检查过
- [ ] 写了 `topics/<slug>/promo/score.json`

## Source

- Upstream project: [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel)
- License: Apache-2.0
- Upstream commit: `fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`
- Original paths: `skills/shared/scoring-dimensions.md`（七维、标尺、权重、阈值、敏感赛道）,
  `skills/openclaw/skill-topic-evaluator/SKILL.md`（单条深评流程、报告结构、Profile 感知）,
  `skills/openclaw/skill-content-matrix/SKILL.md`（批量池评分与同一口径的约定）
- Local changes: 去掉 OpenClaw 运行时的 Profile 注入与 `outputs/` 约定；取证步骤改成本机真实工具
  （`research/tool-radar/`、真实 SERP、`docs/GROWTH_PLAN.md`）；落地路径改成 `topics/<slug>/promo/score.json`；
  加入自有产品红线；报告语言改为中文。
