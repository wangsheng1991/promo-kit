---
name: promo-quality-gate
description: The pre-publish gate for a promotion asset — compliance first (absolute claims, unsupported efficacy, medical language, banned content, copyright, plus per-platform rules for 小红书/抖音/B站) then quality (completeness, task match, format, readability, platform fit), combined into ✅ / ⚠️ / ❌ by a fixed matrix, never by averaging. Use before any draft or card is handed to a human for publishing, and to block a claim that no source supports. Runs alongside content verify (evidence gate) and content lint (typography), not instead of them.
short_description: Compliance plus quality gate with a fixed verdict matrix.
short_description_zh: 发布前两道关：合规 + 质量，固定判定矩阵。
version: 1
updated: 2026-10-08T03:05:00Z
---

# 推广物料门禁（合规 + 质量）

一道指令跑两关：**合规风险**与**产物质量**。结论不是平均分，是矩阵。

**三道闸门的分工**（不要互相顶替）：

| 闸门 | 管什么 | 怎么跑 |
|---|---|---|
| 证据闸门 | 每个论断是否有可核对的出处 | `node bin/content.mjs verify --online` |
| 排版闸门 | 中西文空格、全角标点、重复标点、直角引号 | `node bin/content.mjs lint` |
| **本门禁** | 合规风险 + 产物质量 | 本技能，产物写 `data/promo/<slug>/quality/gate.json` |

## 输入

待检查内容：文本、图片路径、视频路径，或混合。可选目标平台（不填则只跑通用规则）。
文字之外的产物（卡片、视频）要人工看过缩略图/首帧后才算通过。

## 输出

```json
{
  "overall_verdict": "✅ 可发布 | ⚠️ 需修改 | ❌ 不达标",
  "platform": "xiaohongshu | douyin | bilibili | zhihu | wechat | devto | bluesky | generic",
  "compliance": {
    "risk_level": "low | medium | high",
    "issues": [{ "type": "", "severity": "", "text": "", "reason": "", "suggestion": "" }],
    "passed_checks": []
  },
  "quality": {
    "verdict": "✅ | ⚠️ | ❌",
    "dimensions": [{ "name": "", "verdict": "", "note": "" }]
  },
  "top_fixes": ["", "", ""],
  "human_required": ["事实溯源确认", "最终语气", "真实发布授权"]
}
```

## 第一关：合规

### 通用规则（`references/general-rules.md`）

- **绝对化用语** — 极端程度词（最／第一／唯一／顶级／全网之最）、绝对承诺（100%／永远／一定／保证／绝对有效）、
  排他声明（没有之一／无人能比／独家秘方）。
  **判定原则：客观可验证的排名（有官方榜单引用）不算违规；主观断言且无数据支撑算风险。**
- **虚假宣传** — 无来源的百分比与实验结果；「用了 X 之后 Y 立刻改善」这类无因果证据的暗示；
  伪造用户反馈或案例；把个人体验写成普遍效果。**有据可查放行；无法溯源的效果声明必须标风险。**
- **医疗/药品** — 非医疗产品不得做治疗／治愈／根治／药效或替代医疗的承诺。
- **违禁内容** — 暴力血腥、色情擦边、歧视言论、政治敏感、赌博毒品引导。
- **版权** — 他人图片／文案／视频／商标／Logo／IP 未授权或未标来源；搬运与洗稿。

### 平台叠加

| 平台 | 额外检查 | 依据 |
|---|---|---|
| 小红书 | **导流外站**（其他平台名称与链接、二维码、群号、联系方式、谐音/拼音/emoji 变体、评论区引导私信）＝高风险；**软广未标注**（利益交换必须显著标注）；**限流话术**（「买它／冲／闭眼入」式刷屏、过度堆砌价格与折扣、攻击性竞品对比）标中风险并给替代说法 | `references/platform-xiaohongshu.md` |
| 抖音 | 诱导互动（直接索要点赞/关注/转发/收藏、利益诱导、片头片尾堆叠引导、恐吓式强迫互动）；版权音乐与素材（非曲库 BGM、搬运片段、影视综艺未授权、录屏他人平台）；挂人与引战（未脱敏个人信息、针对个人的攻击、恶意剪辑） | `references/platform-douyin.md` |
| B站 | 引战与地域黑；**恰饭未标注**（品牌植入未用「商业合作」标签）；封面党与标题党（封面/标题与内容脱节） | `references/platform-bilibili.md` |
| 知乎 / 公众号 | **上游没有对应规则文件**。按通用规则 + 平台公开规范人工核对，核对结果写进 `gate.json` 的 `passed_checks`，并在 `SKILL` 之下注明「本地补」 | 需本地核实 |

平台规则会变：`gate.json` 里记 `checked_at` 与依据来源；超过 90 天未复核的规则视为待核。
本机没有平台侧的合规接口，**这里给的是判断框架，不是平台保证**。

## 第二关：质量（`references/review-dimensions.md`）

| 产物类型 | 维度 |
|---|---|
| 文本（文案、脚本） | 完整性（有无开头/主体/结尾）、任务匹配（是否回应主题与要求）、格式规范、内容质量（逻辑断裂、跳跃）、平台适配 |
| 图片（卡片、封面） | 文件真的存在、尺寸/格式符合平台（竖 9:16／横 16:9／方 1:1）、画面与描述一致 |
| 视频 | 文件存在且能播、时长在范围内、转场与拼接无黑屏卡顿 |

三级结论（`references/review-levels.md`）：

- **✅ 通过** — 可直接交付，可有非阻塞小建议。
- **⚠️ 有瑕疵但可接受** — 整体可用，列出瑕疵与改进方向，交人决定。
- **❌ 不达标** — 只在四种情况判：完全跑题、严重残缺、格式混乱不可用、与要求重大偏差。

## 综合判定（矩阵，不是平均值）

| 组合 | 整体结论 |
|---|---|
| 合规 high | ❌ 不达标 |
| 质量 ❌ | ❌ 不达标 |
| 合规 low + 质量 ✅ | ✅ 可发布 |
| 其他组合 | ⚠️ 需修改 |

然后给 **Top 3 优先修改建议**。判定 ❌ 时按 `references/rework-rules.md`：**最多返工 1 次**，
第二次仍不达标就把问题说清楚后交付，不无限重写。

审核原则：**宽进严出**（多数产物应是 ✅ 或 ⚠️）、不追求完美、不因风格偏好判不达标、结论必须透明告知。

## 人还得管的部分

机器与模型能先筛掉明显问题，但下面几件**必须人确认**，写进 `human_required` 并在交付时点名：

1. 事实是否足够、有没有把个人体验写成普遍效果；
2. 是否触到自有品牌红线与产品能力边界（讲不出做不到的效果）；
3. 卡片的「实质内容」与有理由的留白（机器只能算填充率）；
4. 最终语气是否适合这个账号；
5. 真实发布授权 —— **本技能不会发布任何东西**，也不替人点发布按钮。

## 执行步骤

1. 跑 `node bin/content.mjs verify --online`（证据）与 `node bin/content.mjs lint`（排版），把结果带进来。
   **任何一道没过，先修，不要用本门禁的「✅」掩盖它。**
2. 读内容，判定平台；无平台则只跑通用规则。
3. 第一关：逐条过通用规则 + 平台叠加规则，汇总 `risk_level` 与 `issues`（每条给 type／severity／原文／理由／改法）。
4. 第二关：按产物类型逐维检查，给三级结论。
5. 按矩阵出整体结论 + Top 3 修改建议。
6. 写 `data/promo/<slug>/quality/gate.json`；❌ 时按返工规则处理（最多一次）。
7. 交付时明说：过了哪几关、命中什么、还有哪些必须人看。

## 规则

1. 阻断项不许被「润色一下」自动抹掉；改的是内容，不是判定。
2. 事实类风险（无来源数字、无依据因果）一律标风险，不替用户承担判断。
3. 平台规则命中要有出处；本机无法核实的，写「需本地核实」。
4. 合规 high 或质量 ❌ 就是不能交付，不允许「先发出去看看」。
5. 本技能**不做发布**。

## 自检

- [ ] `content verify --online` 与 `content lint` 都过了
- [ ] 通用合规五类都检查过，平台规则按平台叠加
- [ ] 质量按产物类型的维度逐项查过
- [ ] 结论来自矩阵，不是平均分
- [ ] `gate.json` 里写了 `checked_at`、平台规则来源与 `human_required`
- [ ] 明确说了不负责发布

## Source

- Upstream project: [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel)
- License: Apache-2.0
- Upstream commit: `fb80ae6dd6fc26f5553efcb293ee6d93ef253f02`
- Original paths: `skills/openclaw/skill-quality-gate/{SKILL.md,references/{general-rules,review-dimensions,review-levels,rework-rules,platform-xiaohongshu,platform-douyin,platform-bilibili}.md}`；
  合并了上游 `skill-check-compliance` 与 `skill-review-deliverable` 的能力
- Local changes: 加入本机三道闸门的分工（`content verify` / `content lint` / 本门禁）；产物路径改为
  `data/promo/<slug>/quality/gate.json`；删除 OpenClaw 运行时、自动返工触发与 `outputs/` 约定，返工改为人工确认；
  平台规则标注「会变、需定期复核」，知乎与公众号规则标注「上游缺失、需本地核实」；
  显式列出仍需人确认的五件事与「本技能不发布」的边界。
