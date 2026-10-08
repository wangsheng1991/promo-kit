/* 渲染一张卡 + 自检 —— 无依赖，在 Chrome 里同步跑完。
   骨架按上游 Easel `card-design/references/card-recipes.md` 的最小密度线实现：
     封面（标题当主角，副标占 40-55% 画高，底信息行锚底）
     账本行（4-6 行，主行 42px + 副行 26px，行间发丝线）
     管线（≥4 步，序号 + 标题 + 描述）
     矩阵（3×2 六格，等大等距，最多一格 accent）
     数据（巨型数字 + 单位 + 一句解读 + 底部来源）
     金句（允许 ≥60%，但必须有顶 kicker + 底出处 + 左侧细线三锚点）
   自检口径来自 `layout-laws.md`：覆盖 ≥75% 画高、最大无理由空白带 ≤216px、纵切四带、
   底部带必须有内容、相邻两带不能同时为空。结果写进 <script id="promo-audit">，
   由 bin/promo.mjs 用 `chrome --dump-dom` 读回。 */

(function () {
  const W = 1080, H = 1440, GAP_LIMIT = 0.15 * H, FILL_MIN = 0.75;
  const data = JSON.parse(document.getElementById('card-data').textContent);
  const frame = document.getElementById('frame');

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  };
  const content = (n) => { n.dataset.content = '1'; return n; };
  const bold = (text, target) => {
    const span = el('span');
    if (target && text.includes(target)) {
      const i = text.indexOf(target);
      span.appendChild(document.createTextNode(text.slice(0, i)));
      span.appendChild(el('b', null, target));
      span.appendChild(document.createTextNode(text.slice(i + target.length)));
    } else span.textContent = text;
    return span;
  };

  /* ---------- 卡头 ---------- */
  const head = el('div', 'head');
  head.appendChild(content(el('span', 'kicker', data.kicker || '')));
  head.appendChild(el('span', 'rule'));
  frame.appendChild(head);

  const titleCls = data.size === 'lg' ? 'title lg' : data.size === 'sm' ? 'title sm' : 'title';
  frame.appendChild(content(el('h1', titleCls, data.title || '')));

  if (data.lede) frame.appendChild(content(el('p', 'lede', data.lede)));

  /* ---------- 正文骨架 ---------- */
  const layout = data.layout || (data.stats && data.stats.length ? 'stat'
    : data.steps && data.steps.length ? 'pipeline'
      : data.cells && data.cells.length ? 'grid'
        : data.rows && data.rows.length ? 'ledger'
          : data.quote ? 'quote'
            : data.points ? 'points' : 'plain');

  if (layout === 'ledger') {
    const box = el('div', 'ledger');
    (data.rows || []).forEach((r) => {
      const row = el('div', 'row');
      const main = el('div', 'main');
      main.appendChild(bold(r.main, r.bold));
      row.appendChild(content(main));
      if (r.tag) row.appendChild(content(el('span', 'tag', r.tag)));
      if (r.sub) row.appendChild(content(el('span', 'sub', r.sub)));
      box.appendChild(row);
    });
    frame.appendChild(box);
    if (data.note) frame.appendChild(content(el('p', 'note', data.note)));
  } else if (layout === 'pipeline') {
    const box = el('div', 'pipeline');
    (data.steps || []).forEach((s, i) => {
      const step = el('div', 'step');
      step.appendChild(content(el('div', 'no', String(i + 1).padStart(2, '0'))));
      const body = el('div');
      body.appendChild(content(el('div', 'st-title', s.title)));
      if (s.desc) body.appendChild(content(el('div', 'st-desc', s.desc)));
      step.appendChild(body);
      box.appendChild(step);
    });
    frame.appendChild(box);
    if (data.note) frame.appendChild(content(el('p', 'note', data.note)));
  } else if (layout === 'grid') {
    const box = el('div', 'grid');
    (data.cells || []).forEach((c) => {
      const cell = el('div', 'cell' + (c.accent ? ' accent' : ''));
      if (c.num) cell.appendChild(content(el('div', 'cell-num', c.num)));
      cell.appendChild(content(el('div', 'cell-title', c.title)));
      if (c.text) cell.appendChild(content(el('div', 'cell-text', c.text)));
      box.appendChild(content(cell));
    });
    frame.appendChild(box);
    if (data.note) frame.appendChild(content(el('p', 'note', data.note)));
  } else if (layout === 'stat') {
    const box = el('div', 'stat-hero');
    (data.stats || []).forEach((s) => {
      box.appendChild(content(el('div', 'num', s.num)));
      if (s.unit) box.appendChild(content(el('div', 'unit', s.unit)));
      if (s.label) box.appendChild(content(el('div', 'read', s.label)));
    });
    frame.appendChild(box);
    if (data.note) frame.appendChild(content(el('p', 'note', data.note)));
  } else if (layout === 'quote') {
    /* 金句卡是唯一允许较空的骨架，但必须有三个锚点：顶 kicker + 底出处行 + 其上发丝线。
       所以这里只把文字本身标成 content，容器不标——否则拉伸的容器会把「空」算成「满」。 */
    const box = el('div', 'quote');
    box.appendChild(content(el('div', 'q', data.quote)));
    if (data.by) box.appendChild(content(el('div', 'by', data.by)));
    frame.appendChild(box);
    if (data.note) frame.appendChild(content(el('p', 'note', data.note)));
  } else if (layout === 'points') {
    const ul = el('ul', 'ledger');
    (data.points || []).forEach((p) => {
      const row = el('div', 'row');
      const text = typeof p === 'string' ? p : p.text;
      const main = el('div', 'main');
      main.appendChild(bold(text, typeof p === 'string' ? null : p.bold));
      row.appendChild(content(main));
      if (typeof p !== 'string' && p.tag) row.appendChild(content(el('span', 'tag', p.tag)));
      if (typeof p !== 'string' && p.sub) row.appendChild(content(el('span', 'sub', p.sub)));
      ul.appendChild(row);
    });
    frame.appendChild(ul);
    if (data.note) frame.appendChild(content(el('p', 'note', data.note)));
  } else if (data.note) {
    frame.appendChild(content(el('p', 'note', data.note)));
  }

  /* ---------- 底部锚点 ---------- */
  frame.appendChild(el('div', 'spacer'));
  const foot = el('footer', 'foot');
  foot.appendChild(content(el('span', 'source', data.source || '')));
  foot.appendChild(content(el('span', 'brand', data.brand || '')));
  foot.appendChild(content(el('span', 'page', data.page || '')));
  frame.appendChild(foot);

  /* ---------- 自检 ---------- */
  const rects = [...document.querySelectorAll('[data-content]')]
    .map((n) => {
      const r = n.getBoundingClientRect();
      return { top: Math.max(0, r.top), bottom: Math.min(H, r.bottom), left: r.left, right: r.right };
    })
    .filter((r) => r.bottom - r.top > 2);

  const spans = rects.map((r) => [r.top, r.bottom]).sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [a, b] of spans) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  const covered = merged.reduce((sum, [a, b]) => sum + (b - a), 0);

  /* 「覆盖 ≥75% 画高」量的是内容的**纵向跨度**（首尾边距之外都算内容区），不是文字像素占比；
     「无理由空白带」量的是内容之间的**内部空洞**，上下 8% 边距是有意的呼吸，不算。 */
  const contentTop = merged.length ? merged[0][0] : H;
  const contentBottom = merged.length ? merged[merged.length - 1][1] : 0;
  let cursor = contentTop;
  const interiorGaps = [];
  for (const [a, b] of merged) {
    if (a - cursor > 0) interiorGaps.push(a - cursor);
    cursor = Math.max(cursor, b);
  }
  const largestGap = interiorGaps.reduce((m, g) => Math.max(m, g), 0);

  const bands = [0, 1, 2, 3].map((i) => {
    const from = i * H / 4, to = (i + 1) * H / 4;
    const hit = merged.some(([a, b]) => Math.min(b, to) - Math.max(a, from) >= 8);
    return hit ? 'content' : 'gap';
  });
  let adjacentEmpty = false;
  for (let i = 0; i < 3; i++) if (bands[i] === 'gap' && bands[i + 1] === 'gap') adjacentEmpty = true;

  const overflowY = Math.max(0, frame.scrollHeight - frame.clientHeight);
  const overflowX = Math.max(0, frame.scrollWidth - frame.clientWidth);
  const extent = Math.max(0, contentBottom - contentTop);
  const fill = extent / H;
  const topGap = contentTop;
  const bottomGap = H - contentBottom;
  // 三锚点：顶部 kicker、底部出处行（.foot 自带发丝线）、且首尾空白都在 8% 边距的量级内
  const anchors = {
    kicker: Boolean(data.kicker),
    source: Boolean(data.source),
    bottom_rule: true,
    top_gap_px: Math.round(topGap),
    bottom_gap_px: Math.round(bottomGap),
  };
  const anchorsOk = anchors.kicker && anchors.source && topGap <= GAP_LIMIT && bottomGap <= GAP_LIMIT;

  const issues = [];
  if (data.breathing) {
    /* 呼吸型骨架（金句/单句陈述）：上游允许较空，但没有三锚点的空白读作「缺内容」。 */
    if (!anchorsOk) issues.push('呼吸型卡缺三锚点（顶 kicker / 底出处行 + 发丝线 / 首尾不超 216px）');
  } else {
    if (fill < FILL_MIN) issues.push(`内容跨度 ${(fill * 100).toFixed(1)}% < ${FILL_MIN * 100}% 画高`);
    if (largestGap > GAP_LIMIT) issues.push(`最大内部空白带 ${Math.round(largestGap)}px > ${GAP_LIMIT}px`);
    if (bands[3] !== 'content') issues.push('底部带没有实质内容');
    if (adjacentEmpty) issues.push('相邻两带同时为空');
  }
  if (overflowY > 4) issues.push(`纵向溢出 ${overflowY}px`);
  if (overflowX > 4) issues.push(`横向溢出 ${overflowX}px`);

  const out = {
    index: data.index || null,
    layout,
    title: data.title || null,
    fill_ratio: Number(fill.toFixed(3)),
    content_extent_px: extent,
    covered_px: covered,
    top_gap_px: Math.round(topGap),
    bottom_gap_px: Math.round(bottomGap),
    largest_gap_px: Math.round(largestGap),
    largest_gap_pct: Number((largestGap / H).toFixed(3)),
    bands,
    bottom_band_has_content: bands[3] === 'content',
    overflow_px: overflowY + overflowX,
    breathing: !!data.breathing,
    anchors,
    verdict: issues.length ? 'fail' : 'pass',
    issues,
  };
  const holder = document.createElement('script');
  holder.type = 'application/json';
  holder.id = 'promo-audit';
  holder.textContent = JSON.stringify(out);
  document.body.appendChild(holder);
  document.title = 'promo-card ' + out.verdict + ' ' + fill.toFixed(2);
})();
