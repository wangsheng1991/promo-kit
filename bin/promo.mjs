#!/usr/bin/env node
// promo — 可复制的素材内容制作工具（零 npm 依赖）
//
//   promo doctor                       检查这台机器能不能跑（node / Chrome / 字体 / 输出目录 / 模板 / 无本机路径与密钥）
//   promo cards <spec.json> [options]  把一份 JSON 规格渲染成小红书竖版卡片，并逐张自检
//
// options:
//   --out <dir>      产物目录（默认 ./out）
//   --chrome <path>  指定 Chrome/Chromium 可执行文件（默认自动探测，也可用 PROMO_CHROME）
//   --only <n>       只渲染第 n 张（1 开始）
//   --strict         有任何一张 FAIL 就退出码 1
//   --keep-html      保留中间 HTML（调试模板时有用）
//   --scale <n>      device scale factor（默认 1；2 出 @2x）
//
// 产物：<out>/card-01.png … <out>/cards.audit.json <out>/contact-sheet.html
// 渲染与自检都只依赖本机 Chrome，不联网、不装包。

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CARD_DIR = path.join(ROOT, 'templates', 'card');
const CARD_W = 1080;
const CARD_H = 1440;

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name, def = null) => {
  const i = argv.indexOf(name);
  return i === -1 ? def : argv[i + 1];
};
const has = (name) => argv.includes(name);

/* 配置：先找 --config，再找 cwd 的 promo.config.json，最后找包根目录的。
   没有配置文件也能跑——所有字段都有默认值，缺项静默降级。 */
function loadConfig() {
  const explicit = flag('--config');
  const candidates = explicit
    ? [explicit]
    : [path.join(process.cwd(), 'promo.config.json'), path.join(ROOT, 'promo.config.json')];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
        return { path: p, cfg };
      } catch (e) {
        die(`配置文件解析失败：${p}\n${e.message}`);
      }
    }
  }
  return { path: null, cfg: {} };
}
const CONFIG = loadConfig();
const cfgGet = (dot, def = undefined) =>
  dot.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), CONFIG.cfg) ?? def;

function log(...a) { process.stdout.write(a.join(' ') + '\n'); }
function die(msg, code = 1) { process.stderr.write(msg + '\n'); process.exit(code); }

/* ---------------------------------------------------------------- chrome ---- */

const CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
};

function playwrightChromium() {
  const bases = [
    path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
    path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright'),
  ];
  for (const base of bases) {
    if (!fs.existsSync(base)) continue;
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const d of dirs) {
      for (const rel of [
        ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
        ['chrome-linux', 'chrome'],
        ['chrome-win', 'chrome.exe'],
      ]) {
        const p = path.join(base, d, ...rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

function findChrome(explicit) {
  const tries = [explicit, process.env.PROMO_CHROME, cfgGet('chrome')].filter(Boolean);
  for (const t of tries) {
    if (fs.existsSync(t)) return t;
    try {
      return execFileSync('which', [t], { encoding: 'utf8' }).trim();
    } catch { /* not on PATH */ }
  }
  for (const c of CANDIDATES[process.platform] || []) if (fs.existsSync(c)) return c;
  return playwrightChromium();
}

function chromeVersion(bin) {
  try {
    const out = execFileSync(bin, ['--version'], { encoding: 'utf8', timeout: 20000 });
    return out.trim().replace(/^.*?(\d+\.\d+\.\d+\.\d+).*$/, '$1');
  } catch {
    return null;
  }
}

function runChrome(bin, args) {
  // Chrome 在无头模式下会往 stderr 喷一堆 CVDisplayLink / GPU 噪音，这里吞掉；
  // 真正的问题仍会以非零退出码或抛异常的形式冒出来。
  return execFileSync(bin, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--allow-file-access-from-files',
    ...args,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 120000, stdio: ['ignore', 'pipe', 'ignore'] });
}

/* ------------------------------------------------------------------ fonts --- */

function hasCjkFont() {
  const places = process.platform === 'darwin'
    ? ['/System/Library/Fonts', '/Library/Fonts', path.join(os.homedir(), 'Library', 'Fonts')]
    : process.platform === 'win32'
      ? [path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts')]
      : ['/usr/share/fonts', path.join(os.homedir(), '.fonts'), '/usr/local/share/fonts'];
  const needles = ['Noto Sans SC', 'NotoSansSC', 'NotoSansCJK', 'PingFang', 'Hiragino Sans', 'msyh', 'SourceHanSans', 'wqy'];
  for (const p of places) {
    if (!fs.existsSync(p)) continue;
    const stack = [p];
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) stack.push(full);
        else if (needles.some((n) => e.name.replace(/[-_ ]/g, '').toLowerCase().includes(n.replace(/[-_ ]/g, '').toLowerCase()))) return full;
      }
    }
  }
  return null;
}

/* ------------------------------------------------------- 可移植性扫描 --- */

/* 拷到别的电脑之前查一遍：包里不该出现本机绝对路径或密钥。
   做法照 Codex 第三轮方案 §4.3 —— 只读扫描，命中就报，不自动改。
   模式在运行时拼出来（不是字面量），免得扫描器命中自己。 */
function scanForLeaks() {
  const pats = [
    new RegExp('/' + 'Users' + '/[A-Za-z0-9._-]+', 'g'),
    new RegExp('/' + 'home' + '/[A-Za-z0-9._-]+', 'g'),
    /AKIA[0-9A-Z]{16}/g,
    /sk-[A-Za-z0-9_-]{20,}/g,
  ];
  const skip = new Set(['upstream', 'node_modules', '.git']); // upstream 是第三方语料，不查
  const exts = new Set(['.mjs', '.js', '.json', '.sh', '.html', '.css', '.md', '.txt', '.yml', '.yaml']);
  const hits = [];
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (skip.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!exts.has(path.extname(e.name).toLowerCase())) continue;
      let text = '';
      try { text = fs.readFileSync(full, 'utf8'); } catch { continue; }
      for (const re of pats) {
        const m = text.match(re);
        if (m) { hits.push(`${path.relative(ROOT, full)}:${m[0]}`); break; }
      }
    }
  };
  walk(ROOT);
  return hits;
}

/* ----------------------------------------------------------------- doctor --- */

function doctor() {
  const rows = [];
  const add = (name, ok, detail, fix = '') => rows.push({ name, ok, detail, fix });

  const major = Number(process.versions.node.split('.')[0]);
  add('node >= 20', major >= 20, `node ${process.versions.node}`, '升级 Node（本工具零依赖，不需要 npm install）');

  const bin = findChrome(flag('--chrome'));
  const ver = bin && chromeVersion(bin);
  add('Chrome / Chromium', Boolean(ver), `${ver || '未找到'} ${bin ? bin : ''}`,
    '装 Chrome，或用 --chrome <路径> / 设 PROMO_CHROME 指向 Chromium');

  const font = hasCjkFont();
  add('中文字体', Boolean(font), font || `未在常见目录找到（platform ${process.platform}）`,
    '装 Noto Sans SC / 苹果本自带 PingFang 与 Hiragino；缺字体时卡上中文会变方框');

  const out = path.resolve(flag('--out', path.join(process.cwd(), 'out')));
  let writable = true;
  try { fs.mkdirSync(out, { recursive: true }); fs.accessSync(out, fs.constants.W_OK); } catch { writable = false; }
  add('输出目录可写', writable, out, '换一个可写目录：--out <dir>');

  const css = fs.existsSync(path.join(CARD_DIR, 'card.css'));
  const tpl = fs.existsSync(path.join(CARD_DIR, 'card.html'));
  const rjs = fs.existsSync(path.join(CARD_DIR, 'render.js'));
  add('模板完整', css && tpl && rjs, `templates/card：css ${css ? 'ok' : '缺'} / html ${tpl ? 'ok' : '缺'} / js ${rjs ? 'ok' : '缺'}`,
    `找回 templates/card 三个文件（应该是随包复制的）`);

  let ffmpeg = false;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); ffmpeg = true; } catch { /* optional */ }
  add('ffmpeg（可选，视频用）', ffmpeg, ffmpeg ? 'present' : 'absent', '只有做视频时才需要，不在卡片链路上');

  const leaks = scanForLeaks();
  add('无本机路径 / 密钥', leaks.length === 0,
    leaks.length ? `${leaks.length} 处 · ${leaks.slice(0, 3).join(' · ')}${leaks.length > 3 ? ' …' : ''}` : 'clean',
    '本机绝对路径改成相对路径；密钥只走环境变量，绝不写进包');

  const width = Math.max(...rows.map((r) => r.name.length));
  log('promo doctor — 这台机器能做什么\n');
  for (const r of rows) {
    log(`  ${r.ok ? 'OK  ' : 'MISS'}  ${r.name.padEnd(width)}  ${r.detail}`);
    if (!r.ok && r.fix) log(`        → ${r.fix}`);
  }
  const hardFail = rows.some((r) => !r.ok && /node|Chrome|模板/.test(r.name));
  log(`\n结论：${hardFail ? '还不能渲染卡片，先处理上面标 MISS 的硬项。' : '可以渲染卡片（promo cards）。'}`);
  return hardFail ? 1 : 0;
}

/* ------------------------------------------------------------------ cards --- */

function renderOne({ bin, spec, card, index, total, out, scale, keep }) {
  const css = fs.readFileSync(path.join(CARD_DIR, 'card.css'), 'utf8');
  const render = fs.readFileSync(path.join(CARD_DIR, 'render.js'), 'utf8');
  const html = fs.readFileSync(path.join(CARD_DIR, 'card.html'), 'utf8');
  const data = {
    ...card,
    index,
    brand: card.brand || spec.brand || cfgGet('brand.name', ''),
    source: card.source || spec.source || cfgGet('brand.source', ''),
    page: card.page || `${index}/${total}`,
  };
  const page = html
    .replace('/*__CSS__*/', css)
    .replace('/*__RENDER__*/', render)
    .replace('__DATA__', JSON.stringify(data).replace(/</g, '\\u003c'));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-card-'));
  const htmlPath = path.join(dir, `card-${String(index).padStart(2, '0')}.html`);
  fs.writeFileSync(htmlPath, page);
  const url = 'file://' + htmlPath;

  const png = path.join(out, `card-${String(index).padStart(2, '0')}.png`);
  runChrome(bin, [
    `--force-device-scale-factor=${scale}`,
    `--window-size=${CARD_W},${CARD_H}`,
    `--screenshot=${png}`,
    `--virtual-time-budget=2000`,
    url,
  ]);

  const dom = runChrome(bin, ['--dump-dom', '--virtual-time-budget=2000', url]);
  const m = dom.match(/<script type="application\/json" id="promo-audit">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`第 ${index} 张没有产出 self-check 结果（模板可能被改坏）`);
  const audit = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  audit.png = path.relative(out, png);

  if (keep) fs.copyFileSync(htmlPath, path.join(out, `card-${String(index).padStart(2, '0')}.html`));
  fs.rmSync(dir, { recursive: true, force: true });
  return audit;
}

function cards() {
  const specPath = argv[1] && !argv[1].startsWith('--') ? argv[1] : flag('--spec');
  if (!specPath) die('用法：promo cards <spec.json> [--out dir] [--chrome path] [--only n] [--strict] [--scale 2]');
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  if (!Array.isArray(spec.cards) || !spec.cards.length) die('spec 里没有 cards[]');
  const out = path.resolve(flag('--out', cfgGet('out', path.join(process.cwd(), 'out'))));
  fs.mkdirSync(out, { recursive: true });

  const bin = findChrome(flag('--chrome'));
  const ver = bin && chromeVersion(bin);
  if (!ver) die('找不到 Chrome / Chromium：装一个，或用 --chrome <路径> / 设 PROMO_CHROME。先跑 `promo doctor`。');
  const scale = Number(flag('--scale', String(cfgGet('canvas.scale', 1))));
  const only = flag('--only');
  const keep = has('--keep-html');

  log(`渲染 ${spec.cards.length} 张卡片 → ${out}`);
  log(`Chrome ${ver} · ${CARD_W * scale}×${CARD_H * scale}${CONFIG.path ? ` · 配置 ${path.relative(process.cwd(), CONFIG.path) || CONFIG.path}` : ''}\n`);

  const audits = [];
  spec.cards.forEach((card, i) => {
    const index = i + 1;
    if (only && Number(only) !== index) return;
    const audit = renderOne({ bin, spec, card, index, total: spec.cards.length, out, scale, keep });
    audits.push(audit);
    const flagTxt = audit.verdict === 'pass' ? 'PASS' : 'FAIL';
    log(`${flagTxt}  card-${String(index).padStart(2, '0')}  ${audit.layout.padEnd(8)}  跨度 ${(audit.fill_ratio * 100).toFixed(1)}%  内部空白 ${audit.largest_gap_px}px  四带 ${audit.bands.map((b) => (b === 'content' ? '■' : '□')).join('')}  溢出 ${audit.overflow_px}px`);
    for (const issue of audit.issues) log(`      · ${issue}`);
  });

  const failed = audits.filter((a) => a.verdict === 'fail');
  const report = {
    spec: path.basename(specPath),
    generated_at: new Date().toISOString(),
    canvas: `${CARD_W}x${CARD_H}@${scale}x`,
    chrome: ver,
    thresholds: {
      fill_min: 0.75,
      largest_gap_px: 216,
      bottom_band: 'must have content',
      breathing: '金句/单句陈述卡免填充率，但必须有顶 kicker + 底出处行 + 发丝线三锚点',
    },
    cards: audits,
    summary: { total: audits.length, pass: audits.length - failed.length, fail: failed.length },
  };
  fs.writeFileSync(path.join(out, 'cards.audit.json'), JSON.stringify(report, null, 2));

  const sheet = `<!doctype html><meta charset="utf-8"><title>contact sheet</title>
<style>body{margin:0;background:#141210;color:#e8e2d8;font:14px/1.5 system-ui,sans-serif;padding:32px}
h1{font-size:20px;font-weight:500;margin:0 0 8px}p{margin:0 0 24px;color:#a49c90}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:24px}
figure{margin:0}img{width:100%;display:block;border:1px solid #2c2822}
figcaption{margin-top:8px;color:#a49c90}code{color:#e8a87c}</style>
<h1>${spec.title || spec.brand || 'promo cards'} — contact sheet</h1>
<p>${audits.length} 张 · ${failed.length ? `<code>${failed.length} 张没过自检</code>` : '全部通过脚本自检'} · 脚本只能算填充率与空白带，「实质内容」仍需人看这张总览</p>
<div class="grid">
${audits.map((a) => `<figure><img src="${a.png}"><figcaption>${a.png} · fill ${(a.fill_ratio * 100).toFixed(0)}% · ${a.verdict.toUpperCase()}${a.issues.length ? ' · ' + a.issues.join('；') : ''}</figcaption></figure>`).join('\n')}
</div>`;
  fs.writeFileSync(path.join(out, 'contact-sheet.html'), sheet);
  log(`\n${report.summary.pass}/${report.summary.total} 通过 · cards.audit.json · contact-sheet.html`);
  if (failed.length) {
    log('自检失败 = 按 layout-laws 的欠填修正阶梯处理：先补内容，再换高容量骨架，最后才换 1:1 画幅；不要用装饰填空白。');
    if (has('--strict')) process.exit(1);
  }
  return 0;
}

/* ------------------------------------------------------------------- main --- */

if (cmd === 'doctor') process.exit(doctor());
else if (cmd === 'cards') process.exit(cards());
else {
  log(`promo — 素材内容制作工具（零依赖）

  promo doctor                       检查这台机器能不能跑
  promo cards <spec.json> [options]  渲染小红书竖版卡片（1080×1440）并逐张自检

options
  --out <dir>      产物目录（默认 ./out）
  --chrome <path>  Chrome/Chromium 路径（也可用 PROMO_CHROME）
  --only <n>       只渲染第 n 张
  --strict         有 FAIL 就退出码 1
  --scale <n>      device scale（2 = @2x）
  --keep-html      保留中间 HTML

规格文件见 demo/cards.json；产物写 <out>/，其中 contact-sheet.html 给人看，cards.audit.json 给脚本读。`);
  process.exit(cmd ? 1 : 0);
}
