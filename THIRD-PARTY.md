# 第三方组件与许可

## 随包内容

| 组件 | 版本 / 锚点 | 许可 | 用途与位置 |
|---|---|---|---|
| ZJU-REAL/Easel 的方法论文本与 `references/` 副本 | commit `fb80ae6dd6fc26f5553efcb293ee6d93ef253f02` | Apache-2.0（全文见 `LICENSE-Apache-2.0.txt`） | 选题评分、文案框架、去 AI 味、卡片骨架、合规判定、平台规则；位于 `skills/*/references/`、`upstream/easel-skills/`，以及据其改写的方法论正文 |

上游项目主页：https://github.com/ZJU-REAL/Easel

## 运行时依赖（不随包分发）

| 依赖 | 要求 | 许可 | 说明 |
|---|---|---|---|
| Node.js | ≥ 20 | MIT | 只为跑 `bin/promo.mjs`；**不需要 npm install**，本包没有 `package.json`、没有任何三方模块 |
| Chrome / Chromium | 任意近期版本 | 各自许可（Google Chrome 为专有，Chromium 为 BSD 类） | 唯一的外部能力：无头渲染与 `--dump-dom` 取回自检结果 |
| 中文字体 | 系统自带或自装 | 各自许可 | macOS 自带 PingFang / Hiragino；Linux 装 `fonts-noto-cjk`。缺字体时中文会变方框，`doctor` 会提示 |

## 未包含（刻意的）

- 没有 Easel 的运行时、Web 工作台、Python 依赖、浏览器登录态、发布队列与平台发布器。
- 没有 Python、没有 FFmpeg 依赖、没有图像处理库：裁切、加水印、转格式这类确定性操作
  交给调用方已有的工具（本机是 content-engine 的 `content images` 与系统 ffmpeg）。
- 没有任何模型 API 依赖：卡片渲染是纯本地的；只有让智能体写选题与文案时才需要模型，且由调用方自带。

## 关于上游方法的再分发义务

Apache-2.0 要求再分发时保留版权与许可声明、并说明改动。本包 `NOTICE.md` 已逐项列出：
哪些文件是上游原文副本、哪些是改写、改了什么。若你把本包再分发给别人，
**不要把 `NOTICE.md` 与 `LICENSE-Apache-2.0.txt` 删掉**，也不要把改写材料标成完全原创。
