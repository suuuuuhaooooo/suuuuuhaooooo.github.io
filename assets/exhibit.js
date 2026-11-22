/* 蘇昊數理 — 展覽首頁互動
   1. 入口：粒子組成的字標
   2. 展間 I：作品說明卡（3D 展廳本身在 gallery3d.js，用 three.js）
   3. 展間 II：暗房手電筒
*/
(function () {
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const touch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= 作品資料（來自 works.js 或後台） ================= */
const svgOf = (k, c) => window.SUHAO_svgOf(k, c), pad2 = n => window.SUHAO_pad2(n);
const works = () => window.SUHAO_WORKS || window.SUHAO_WORKS_DEFAULT;

/* ================= 1. 入口：粒子字標 ================= */
(function dust() {
  const cv = document.getElementById('dust'); if (!cv) return;
  const ctx = cv.getContext('2d'), hint = document.getElementById('dhint2');
  let W, H, dpr, P = [], ptr = { x: -9e3, y: -9e3 }, visible = true, touched = false;
  const LAYERS = [1, .5, .22];                      // 本體、殘影 2、殘影 1
  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 在畫布外把字標畫出來，再取樣成點
    // 字標只能放在「上方標籤」和「下方文字」之間的空白，App 內建瀏覽器畫面比較矮時會自動縮小
    const cr = cv.getBoundingClientRect(), tl = cv.parentElement.querySelector('.tl'), bot = cv.parentElement.querySelector('.over > .wrap:last-child');
    const topY = tl ? tl.getBoundingClientRect().bottom - cr.top + 18 : H * .15;
    const botY = bot ? bot.getBoundingClientRect().top - cr.top - 44 : H * .7;   // 44 = 留給「用手指撥動它」
    const avail = Math.max(60, botY - topY);
    const tw = Math.min(W * .84, 760), fs = Math.min(tw / 4.5, avail / 2.15), oc = document.createElement('canvas');
    oc.width = Math.ceil(tw); oc.height = Math.ceil(fs * 2.3);
    const o = oc.getContext('2d'), y0 = fs * 1.05;
    o.textBaseline = 'top'; o.textAlign = 'center';
    o.font = `500 ${fs}px "Helvetica Neue","PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;
    [...'蘇昊數理'].forEach((c, i) => {
      const cx = fs * (.43 + i * 1.18);
      const draw = (dy, a, clipH) => { o.save(); if (clipH) { o.beginPath(); o.rect(cx - fs, y0 + dy - 2, fs * 2, clipH); o.clip(); }
        o.translate(cx, y0 + dy); o.scale(.78, 1); o.fillStyle = `rgba(0,0,0,${a})`; o.fillText(c, 0, 0); o.restore(); };
      draw(-fs * .82, .3, fs * .45); draw(-fs * .42, .6, fs * .45); draw(0, 1, 0);
    });
    const data = o.getImageData(0, 0, oc.width, oc.height).data, gap = W < 500 ? 2 : 3;
    const ox = (W - oc.width) / 2, oy = (topY + botY) / 2 - fs * 1.14, old = P; P = [];
    hint.style.top = Math.round(oy + fs * 2.05 + 14) + 'px';   // 提示字放在字標正下方
    for (let y = 0; y < oc.height; y += gap) for (let x = 0; x < oc.width; x += gap) {
      const a = data[(y * oc.width + x) * 4 + 3]; if (a < 40) continue;
      const L = a > 200 ? 0 : a > 110 ? 1 : 2, q = old[P.length];
      const ang = Math.random() * 6.283;
      P.push({ tx: ox + x, ty: oy + y, x: q ? q.x : Math.random() * W, y: q ? q.y : Math.random() * H, vx: 0, vy: 0, L,
               dx: Math.cos(ang), dy: Math.sin(ang) - .6, r: .4 + Math.random() * .9, s: .5 + Math.random() });
    }
  }
  function frame(t) {
    requestAnimationFrame(frame); if (!visible) return;
    const sp = clamp(scrollY / (innerHeight * .9)), R = W < 500 ? 60 : 90;
    ctx.clearRect(0, 0, W, H);
    const paths = [new Path2D(), new Path2D(), new Path2D()];
    for (const p of P) {
      // 捲動時：字標像塵埃一樣往上飄散
      const gx = p.tx + p.dx * sp * H * .7 * p.s + Math.sin(t / 900 + p.tx) * 1.2;
      const gy = p.ty + p.dy * sp * H * .7 * p.s + Math.cos(t / 1100 + p.ty) * 1.2;
      if (document.documentElement.classList.contains('ready')) { p.vx += (gx - p.x) * .045; p.vy += (gy - p.y) * .045; }
      else { p.vx += Math.sin(t / 700 + p.ty) * .05; p.vy += Math.cos(t / 800 + p.tx) * .05 - .01; }
      const ddx = p.x - ptr.x, ddy = p.y - ptr.y, d2 = ddx * ddx + ddy * ddy;
      if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 9; p.vx += ddx / d * f; p.vy += ddy / d * f; }
      p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
      const sz = W < 500 ? 1.1 + p.r * .5 : 1.5 + p.r * .8;
      paths[p.L].rect(p.x, p.y, sz, sz);
    }
    const fade = 1 - sp;
    LAYERS.forEach((a, i) => { ctx.fillStyle = `rgba(20,20,20,${a * fade})`; ctx.fill(paths[i]); });
  }
  const setP = (x, y) => { const r = cv.getBoundingClientRect(); ptr.x = x - r.left; ptr.y = y - r.top;
    if (!touched) { touched = true; hint.style.opacity = 0; } };
  cv.addEventListener('pointermove', e => setP(e.clientX, e.clientY));
  cv.addEventListener('pointerdown', e => setP(e.clientX, e.clientY));
  cv.addEventListener('touchmove', e => { const t = e.touches[0]; setP(t.clientX, t.clientY); }, { passive: true });
  const off = () => { ptr.x = ptr.y = -9e3; };
  cv.addEventListener('pointerleave', off); cv.addEventListener('touchend', off);
  if (!touch) hint.textContent = '用游標撥動它';
  new IntersectionObserver(es => visible = es[0].isIntersecting).observe(cv);
  let rw = 0, rh = 0; addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 40 || Math.abs(innerHeight - rh) > 80) { rw = innerWidth; rh = innerHeight; build(); } });
  rh = innerHeight;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => build());   // 字型載完，文字高度會變
  rw = innerWidth; build(); requestAnimationFrame(frame);
})();

/* ================= 2. 展間 I：3D 展廳 ================= */
const sheet = document.getElementById('sheet');
function openSheet(i) {
  const k = works()[i];
  document.getElementById('sPic').innerHTML = svgOf(k);
  document.getElementById('sNo').textContent = 'No. ' + pad2(i + 1);
  document.getElementById('sTitle').textContent = k.t;
  document.getElementById('sMed').textContent = k.m;
  document.getElementById('sDesc').textContent = k.d;
  const go = document.getElementById('sGo'); go.textContent = k.b;
  if (k.u) { go.href = k.u; go.style.pointerEvents = ''; go.style.opacity = 1; go.target = k.u.startsWith('http') ? '_blank' : ''; }
  else { go.removeAttribute('href'); go.style.pointerEvents = 'none'; go.style.opacity = .4; }
  sheet.classList.add('on');
}
const closeSheet = () => sheet.classList.remove('on');
document.getElementById('sx').onclick = closeSheet;
sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

window.SUHAO_openSheet = openSheet;   // 3D 展廳（gallery3d.js）點作品時呼叫

/* ================= 3. 暗房 ================= */
(function darkroom() {
  const dark = document.getElementById('dark'); if (!dark) return;
  const glow = document.getElementById('dglow');
  let lx = .5, ly = .5, tx = null, ty = null, on = false; const t0 = performance.now();
  if (touch) document.getElementById('dhint').textContent = '手指點一下照亮牆面';
  const set = e => { const r = dark.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; };
  dark.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') set(e); });
  dark.addEventListener('pointerdown', set);
  dark.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') tx = ty = null; });
  new IntersectionObserver(es => on = es[0].isIntersecting).observe(dark);
  (function loop(now) {
    requestAnimationFrame(loop); if (!on) return;
    const t = (now - t0) / 1000, ax = tx ?? (.5 + Math.sin(t * .37) * .3), ay = ty ?? (.5 + Math.sin(t * .53 + 1) * .22);
    lx += (ax - lx) * .06; ly += (ay - ly) * .06;
    dark.style.setProperty('--x', (lx * 100) + '%'); dark.style.setProperty('--y', (ly * 100) + '%');
    dark.style.setProperty('--r', Math.max(90, dark.clientWidth * .12) + 'px'); glow.style.opacity = tx == null ? 0 : 1;
  })(t0);
})();

/* ================= 其他：浮現、導覽列、展間指示 ================= */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
document.querySelectorAll('.rv, #sayhi').forEach(el => io.observe(el));
const nav = document.getElementById('nav'), whereN = document.getElementById('whereN'), rooms = [...document.querySelectorAll('[data-room]')], darkEl = document.getElementById('dark');
function onScroll() {
  const d = darkEl.getBoundingClientRect(); nav.classList.toggle('dark', d.top < 60 && d.bottom > 60);
  let cur = '入口'; rooms.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .5) cur = s.dataset.room; }); whereN.textContent = cur; document.getElementById('where').style.opacity = (cur === 'I' || cur === '入口') ? 0 : 1;   // 入口和 3D 展廳下方已經有字，不疊上去
}
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true }); onScroll();
})();
