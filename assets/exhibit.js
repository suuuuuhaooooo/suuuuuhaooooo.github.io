/* 蘇昊數理 — 展覽首頁互動
   1. 入口：粒子組成的字標
   2. 展間 I：WebGL 3D 展廳（原生 WebGL，不靠套件）
   3. 展間 II：暗房手電筒
*/
(function () {
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const touch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= 作品資料 ================= */
const OP = (() => { let s = '', ans = 'BDACBADCCBDA';
  for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) { const on = 'ABCD'[c] === ans[r], x = 66 + c * 46, y = 40 + r * 19;
    s += on ? `<rect x="${x}" y="${y}" width="30" height="9" rx="4.5" fill="${r % 5 === 2 ? '#c8361f' : '#141414'}"/>`
            : `<rect x="${x}" y="${y}" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/>`; }
  return s; })();
const WORKS = [
 { t: '數光島筆記本', m: '網站　HTML、SVG、JavaScript', d: '國小數學 412 個小節，每一節都做成可以動手玩的頁面，另外有無限出題、學習地圖和遊戲場。', u: '/math-Illustration/', b: '前往數光島', w: 1200, h: 820, img: 'assets/works/math.jpg',
   svg: '<rect width="300" height="300" fill="#f2efe8"/><circle cx="150" cy="160" r="112" fill="none" stroke="#1d3c78" stroke-width="1.2"/><circle cx="150" cy="160" r="82" fill="none" stroke="#1d3c78" stroke-width="1.2"/><circle cx="150" cy="160" r="52" fill="#1d3c78"/><circle cx="226" cy="66" r="20" fill="#d9a521"/><rect x="146" y="98" width="8" height="20" fill="#c8361f"/><circle cx="150" cy="92" r="6" fill="#c8361f"/>' },
 { t: '見微理畫', m: '網站　程式繪製 SVG', d: '國中理化 70 個單元。燒杯、光線、電路和粒子，都是一筆一筆用程式畫出來的。', u: '/science-Illustration/', b: '前往見微理畫', w: 980, h: 670, img: 'assets/works/science.jpg',
   svg: '<rect width="240" height="320" fill="#f2efe8"/><g fill="none" stroke="#141414" stroke-width="1.2"><ellipse cx="120" cy="160" rx="96" ry="30"/><ellipse cx="120" cy="160" rx="96" ry="30" transform="rotate(60 120 160)"/><ellipse cx="120" cy="160" rx="96" ry="30" transform="rotate(-60 120 160)"/></g><circle cx="120" cy="160" r="10" fill="#c8361f"/><circle cx="216" cy="160" r="4" fill="#141414"/><circle cx="72" cy="77" r="4" fill="#141414"/><circle cx="72" cy="243" r="4" fill="#141414"/>' },
 { t: '會考模擬考', m: '網站　線上報名與作答', d: '題本和詳解只開放給報名的考生，答案也只能送出一次。', u: '/mock-exam/', b: '前往報名', w: 300, h: 300,
   svg: '<rect width="300" height="300" fill="#f2efe8"/>' + OP },
 { t: '《本徵》', m: '書　LaTeX 排版', d: '18 個單元的國中理化會考複習教材，分成教師版、學生版和詳解本。', u: 'https://myship.7-11.com.tw/general/detail/GM2609106147789', b: '蘇昊小舖', w: 240, h: 320,
   svg: '<rect width="240" height="320" fill="#f2efe8"/><line x1="20" y1="200" x2="220" y2="200" stroke="#141414"/><line x1="90" y1="40" x2="90" y2="290" stroke="#141414"/><line x1="90" y1="200" x2="200" y2="110" stroke="#c8361f" stroke-width="5"/><line x1="90" y1="200" x2="40" y2="90" stroke="#1d3c78" stroke-width="5"/><text x="120" y="272" text-anchor="middle" font-family="serif" font-size="30" fill="#141414" letter-spacing="8">本徵</text>' },
 { t: '理化模擬試題', m: '試題本與詳解本　LaTeX', d: '每回 50 題，版面照著會考題本排，每個選項都附上解析。', u: '/mock-exam/', b: '看看', w: 300, h: 300,
   svg: '<rect width="300" height="300" fill="#f2efe8"/><rect x="64" y="40" width="172" height="220" fill="#fff" stroke="#141414"/><g stroke="#bdbab2"><line x1="84" y1="70" x2="216" y2="70"/><line x1="84" y1="86" x2="196" y2="86"/><line x1="84" y1="102" x2="210" y2="102"/></g><path d="M100 220 L150 140 L200 220 Z" fill="none" stroke="#1d3c78" stroke-width="1.6"/><line x1="64" y1="196" x2="150" y2="186" stroke="#c8361f" stroke-width="1.6"/><line x1="150" y1="186" x2="236" y2="232" stroke="#d9a521" stroke-width="1.6"/>' },
 { t: '國小數學簡報', m: '簡報　PowerPoint', d: '一套簡報就能對照康軒、南一、翰林三個版本，用 Morph 轉場帶出課程地圖。', u: '', b: '課堂使用中', w: 300, h: 300,
   svg: '<rect width="300" height="300" fill="#f2efe8"/><rect x="96" y="64" width="160" height="100" fill="#d9a521"/><rect x="72" y="100" width="160" height="100" fill="#1d3c78"/><rect x="48" y="136" width="160" height="100" fill="#141414"/><text x="128" y="198" text-anchor="middle" font-family="serif" font-size="30" fill="#f2efe8">3.14</text>' },
];
const svgOf = (k, cls = '') => k.img && !cls ? `<img src="${k.img}" alt="${k.t}" style="width:100%;display:block;border:1px solid #141414">`
  : `<svg ${cls} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${k.w} ${k.h}">${k.svg}</svg>`;
const pad2 = n => String(n).padStart(2, '0');

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
    const tw = Math.min(W * .84, 760), fs = tw / 4.5, oc = document.createElement('canvas');
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
    const ox = (W - oc.width) / 2, oy = H * .40 - oc.height / 2, old = P; P = [];
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
  let rw = 0; addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; build(); } });
  rw = innerWidth; build(); requestAnimationFrame(frame);
})();

/* ================= 2. 展間 I：3D 展廳 ================= */
const sheet = document.getElementById('sheet');
function openSheet(i) {
  const k = WORKS[i];
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

(function gallery() {
  const sec = document.getElementById('room1'), cv = document.getElementById('gl');
  const gl = cv.getContext('webgl', { antialias: true, alpha: false }) || cv.getContext('experimental-webgl');
  if (!gl) {           // 不支援 WebGL：改成一般作品列表
    sec.classList.add('fallback');
    document.getElementById('nogl').innerHTML = '<div class="room-head"><h2>展間 I　看見</h2></div>' +
      WORKS.map((k, i) => `<p style="margin-top:28px"><a href="#" data-i="${i}" style="font-family:var(--serif);font-size:22px">No.${pad2(i + 1)}　${k.t}</a></p>`).join('');
    document.getElementById('nogl').onclick = e => { const a = e.target.closest('[data-i]'); if (a) { e.preventDefault(); openSheet(+a.dataset.i); } };
    return;
  }

  /* ---- 小型矩陣工具 ---- */
  const V = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    crs: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    nrm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
  function persp(fy, asp, n, f) { const t = 1 / Math.tan(fy / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; }
  function look(e, c, up) { const z = V.nrm(V.sub(e, c)), x = V.nrm(V.crs(up, z)), y = V.crs(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V.dot(x, e), -V.dot(y, e), -V.dot(z, e), 1]; }
  function mm(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }

  /* ---- 著色器：貼圖 × 顏色，加上霧與簡單打光 ---- */
  const vs = `attribute vec3 p;attribute vec2 uv;uniform mat4 M;uniform vec3 cam;varying vec2 vUv;varying float vD;varying vec3 vP;
    void main(){vUv=uv;vP=p;vD=distance(p,cam);gl_Position=M*vec4(p,1.0);}`;
  const fs = `precision mediump float;uniform sampler2D tex;uniform vec4 col;uniform float useTex;uniform vec3 fog;uniform vec2 fogR;uniform float lit;
    uniform vec3 lights[6];varying vec2 vUv;varying float vD;varying vec3 vP;
    void main(){vec4 c=col;if(useTex>.5)c*=texture2D(tex,vUv);
      if(lit>.5){float g=0.0;for(int i=0;i<6;i++){vec3 L=lights[i];float d=distance(vP.yz,L.yz);g+=exp(-d*d*.55)*.16;}
        float dim=.9+.1*clamp(vP.y/4.0,0.0,1.0);c.rgb=c.rgb*dim+g;}
      float f=smoothstep(fogR.x,fogR.y,vD);gl_FragColor=vec4(mix(c.rgb,fog,f),c.a);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const A = { p: gl.getAttribLocation(pr, 'p'), uv: gl.getAttribLocation(pr, 'uv') };
  const U = {}; ['M', 'cam', 'tex', 'col', 'useTex', 'fog', 'fogR', 'lit', 'lights'].forEach(n => U[n] = gl.getUniformLocation(pr, n));
  gl.enableVertexAttribArray(A.p); gl.enableVertexAttribArray(A.uv);
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const objs = [];
  function quad(c, r, u, color, tex, opt = {}) {   // c=中心, r/u=半邊向量
    const su = opt.su || 1, sv = opt.sv || 1, P = (a, b) => V.add(V.add(c, V.mul(r, a)), V.mul(u, b));
    const v = [[-1, -1, 0, 0], [1, -1, su, 0], [1, 1, su, sv], [-1, -1, 0, 0], [1, 1, su, sv], [-1, 1, 0, sv]]
      .flatMap(([a, b, s, t]) => [...P(a, b), s, t]);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    const o = { buf, color, tex: tex || null, lit: !!opt.lit, trans: !!opt.trans, pick: opt.pick };
    objs.push(o); return o;
  }
  const pot = n => Math.pow(2, Math.round(Math.log2(n)));
  function texFrom(canvas, repeat) {
    // WebGL1 的 mipmap 需要 2 的次方尺寸
    if (pot(canvas.width) !== canvas.width || pot(canvas.height) !== canvas.height) {
      const c = document.createElement('canvas'); c.width = pot(canvas.width); c.height = pot(canvas.height);
      c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height); canvas = c;
    }
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const w = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
    const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  }
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const hex = (h, a = 1) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255, a];

  /* ---- 場景 ---- */
  const HW = 3.4, HT = 4.3, Z0 = 6, Z1 = -50, GAP = 7, FIRST = -5;
  const floorTex = texFrom(mk(512, 512, (g, w, h) => {
    g.fillStyle = '#d8d3c8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '90,80,60'},${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 8 + Math.random() * 30); }
    g.fillStyle = 'rgba(80,70,55,.18)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 1.5, h);
  }), true);
  const lightTex = texFrom(mk(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h * .2, 0, w / 2, h * .35, w * .55);
    r.addColorStop(0, 'rgba(255,253,245,.95)'); r.addColorStop(.5, 'rgba(255,252,240,.35)'); r.addColorStop(1, 'rgba(255,252,240,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  }));
  const shadowTex = texFrom(mk(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
  }));
  const L = (Z0 - Z1) / 2, ZC = (Z0 + Z1) / 2;
  quad([0, 0, ZC], [HW, 0, 0], [0, 0, -L], [1, 1, 1, 1], floorTex, { su: 2, sv: 14 });                          // 地板
  quad([0, HT, ZC], [HW, 0, 0], [0, 0, L], hex('#f7f6f2'));                                                       // 天花板
  quad([-HW, HT / 2, ZC], [0, 0, -L], [0, HT / 2, 0], hex('#ecebe6'), null, { lit: true });                      // 左牆
  quad([HW, HT / 2, ZC], [0, 0, L], [0, HT / 2, 0], hex('#e6e4de'), null, { lit: true });                        // 右牆
  quad([-HW + .01, .07, ZC], [0, 0, -L], [0, .07, 0], hex('#cdc8bd'));                                            // 踢腳板
  quad([HW - .01, .07, ZC], [0, 0, L], [0, .07, 0], hex('#cdc8bd'));
  for (let z = Z0; z > Z1; z -= 3.5) {                                                                            // 天花板燈軌
    quad([-1.6, HT - .01, z], [.03, 0, 0], [0, 0, 1.4], hex('#2a2a2a'));
    quad([1.6, HT - .01, z], [.03, 0, 0], [0, 0, 1.4], hex('#2a2a2a'));
  }
  // 盡頭：通往暗房的門
  const endTex = texFrom(mk(1024, 512, (g, w, h) => {
    g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#0e0e0e'; g.fillRect(w * .36, h * .32, w * .28, h * .68);
    g.fillStyle = '#141414'; g.textAlign = 'center';
    g.font = '300 34px "Noto Serif TC","Songti TC",serif'; g.fillText('展間 II　暗房', w / 2, h * .22);
    g.font = '14px "Helvetica Neue",sans-serif'; g.fillStyle = '#777'; g.fillText('R O O M   I I   ·   T H E   D A R K   R O O M', w / 2, h * .27);
  }));
  quad([0, HT / 2, Z1], [HW, 0, 0], [0, HT / 2, 0], [1, 1, 1, 1], endTex);
  // 中央長椅
  const BZ = FIRST - GAP * 2.5;
  quad([0, .46, BZ], [.32, 0, 0], [0, 0, -1.2], hex('#3b3127'));
  quad([0, .23, BZ + 1.2], [.32, 0, 0], [0, .23, 0], hex('#2b231b'));
  quad([-.32, .23, BZ], [0, 0, -1.2], [0, .23, 0], hex('#30271e'));
  quad([.32, .23, BZ], [0, 0, 1.2], [0, .23, 0], hex('#30271e'));
  quad([0, .005, BZ], [.7, 0, 0], [0, 0, -1.6], [1, 1, 1, .6], shadowTex, { trans: true });

  const lights = [], picks = [];
  WORKS.forEach((k, i) => {
    const side = i % 2 ? 1 : -1, z = FIRST - i * GAP, x = side * (HW - .02);
    const R = side < 0 ? [0, 0, -1] : [0, 0, 1], N = [-side, 0, 0], UP = [0, 1, 0];
    const aw = k.img ? 1.9 : k.w > k.h ? 1.5 : 1.2, ah = aw * k.h / k.w, mat = .28, fr = .06, cy = 1.75;
    const C = d => [x + N[0] * d, cy, z];
    quad([side * (HW - .9), .006, z], [.9, 0, 0], [0, 0, -1.4], [1, 1, 1, .25], shadowTex, { trans: true });
    quad(C(.01), V.mul(R, aw / 2 + mat + fr), V.mul(UP, ah / 2 + mat + fr), hex('#151515'));   // 外框
    quad(C(.025), V.mul(R, aw / 2 + mat), V.mul(UP, ah / 2 + mat), hex('#fbfbf9'));            // 白色卡紙
    const art = quad(C(.04), V.mul(R, aw / 2), V.mul(UP, ah / 2), [1, 1, 1, 1], null, { pick: i });
    picks.push({ i, c: C(.04), hw: aw / 2 + mat, hh: ah / 2 + mat, R });
    // 牆上打光
    quad([x + N[0] * .005, 2.35, z], V.mul(R, 1.9), V.mul(UP, 2.1), [1, 1, 1, .9], lightTex, { trans: true });
    lights.push([0, 3.1, z]);
    // 展品說明卡
    const plate = mk(512, 340, (g, w, h) => {
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#8a8a86'; g.font = '22px "Helvetica Neue",sans-serif'; g.fillText('No. ' + pad2(i + 1), 34, 52);
      g.fillStyle = '#141414'; g.font = '500 44px "Noto Serif TC","Songti TC",serif'; g.fillText(k.t, 34, 116);
      g.fillStyle = '#8a8a86'; g.font = '22px "PingFang TC","Noto Sans TC",sans-serif'; g.fillText(k.m, 34, 160);
      g.fillStyle = '#333'; g.font = '23px "PingFang TC","Noto Sans TC",sans-serif';
      let line = '', y = 212; for (const ch of k.d) { if (g.measureText(line + ch).width > w - 68) { g.fillText(line, 34, y); line = ch; y += 36; if (y > h - 20) break; } else line += ch; }
      if (y <= h - 20) g.fillText(line, 34, y);
    });
    const pr = aw / 2 + mat + fr + .55;
    quad([x + N[0] * .02, 1.3, z + R[2] * pr], V.mul(R, .36), V.mul(UP, .24), [1, 1, 1, 1], texFrom(plate));
    // 作品圖：SVG 轉成貼圖（非同步）
    const img = new Image(), url = k.img || URL.createObjectURL(new Blob([svgOf(k, `width="${k.w * 4}" height="${k.h * 4}"`)], { type: 'image/svg+xml' }));
    img.onload = () => { art.tex = texFrom(mk(1024, 1024, (g, w, h) => g.drawImage(img, 0, 0, w, h))); if (!k.img) URL.revokeObjectURL(url); };
    img.src = url;
  });
  const lightArr = new Float32Array(18); lights.forEach((l, i) => lightArr.set(l, i * 3));
  const blank = texFrom(mk(4, 4, g => { g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, 4, 4); }));

  /* ---- 相機 ---- */
  let W = 0, H = 0, dpr = 1, prog = 0, cz = Z0 - 1, yaw = 0, pitch = 0, look2 = [0, 0], active = false, MVP = null, camP = [0, 1.6, 0];
  const CZ0 = Z0 - 1.5, CZ1 = Z1 + 6;
  function size() { dpr = Math.min(devicePixelRatio || 1, 1.75); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; gl.viewport(0, 0, cv.width, cv.height); }
  addEventListener('resize', size); size();
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') look2 = [(e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2]; });
  new IntersectionObserver(es => active = es[0].isIntersecting).observe(sec);

  const gnowN = document.getElementById('gnowN'), gnowT = document.getElementById('gnowT'), gnow = document.getElementById('gnow'),
        gbar = document.getElementById('gbar'), gcnt = document.getElementById('gcnt'), ghead = document.getElementById('ghead');
  let lastNear = -2;
  function frame() {
    requestAnimationFrame(frame); if (!active) return;
    const r = sec.getBoundingClientRect(); prog = clamp(-r.top / (r.height - innerHeight || 1));
    const tz = CZ0 + (CZ1 - CZ0) * prog; cz += (tz - cz) * (reduce ? 1 : .08);
    // 走到作品前面時，頭會轉過去看
    let ty = 0, near = -1, best = 0;
    WORKS.forEach((k, i) => { const z = FIRST - i * GAP, side = i % 2 ? 1 : -1, w = Math.exp(-Math.pow(cz - (z + 2.3), 2) / 3.2);
      ty += side * 1.0 * w; if (w > best) { best = w; near = i; } });
    if (best < .45) near = -1;
    ty += look2[0] * .18; yaw += (ty - yaw) * .06; pitch += (-look2[1] * .08 - pitch) * .06;
    camP = [Math.sin(yaw * .5) * .5, 1.62 + Math.sin(cz * 1.6) * .012, cz];
    const dir = [Math.sin(yaw), pitch, -Math.cos(yaw)];
    const asp = W / H, fov = asp < .8 ? 1.25 : .95;
    MVP = mm(persp(fov, asp, .05, 80), look(camP, V.add(camP, dir), [0, 1, 0]));

    gl.clearColor(.937, .929, .91, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(U.M, false, new Float32Array(MVP)); gl.uniform3fv(U.cam, camP);
    gl.uniform3f(U.fog, .937, .929, .91); gl.uniform2f(U.fogR, 7, 34); gl.uniform3fv(U.lights, lightArr);
    const draw = o => {
      gl.bindBuffer(gl.ARRAY_BUFFER, o.buf);
      gl.vertexAttribPointer(A.p, 3, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(A.uv, 2, gl.FLOAT, false, 20, 12);
      gl.uniform4fv(U.col, o.color); gl.uniform1f(U.lit, o.lit ? 1 : 0);
      const t = o.tex || (o.pick != null ? blank : null);
      gl.uniform1f(U.useTex, t ? 1 : 0); if (t) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(U.tex, 0); }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    gl.depthMask(true); objs.forEach(o => { if (!o.trans) draw(o); });
    gl.depthMask(false); objs.forEach(o => { if (o.trans) draw(o); }); gl.depthMask(true);

    // HUD
    gbar.style.width = (prog * 100) + '%';
    ghead.style.opacity = clamp(1 - prog * 12);
    if (near !== lastNear) {
      lastNear = near;
      gnow.style.opacity = 0; gnow.style.transform = 'translateY(8px)';
      setTimeout(() => {
        if (near < 0) { gnowN.textContent = prog > .9 ? '前方是展間 II' : '往下捲動，往前走'; gnowT.textContent = ''; }
        else { gnowN.textContent = 'No. ' + pad2(near + 1) + '　點一下看說明'; gnowT.textContent = WORKS[near].t; }
        gnow.style.opacity = 1; gnow.style.transform = 'none';
      }, 250);
      gcnt.textContent = pad2(near < 0 ? Math.round(prog * WORKS.length) : near + 1) + ' / ' + pad2(WORKS.length);
    }
  }
  requestAnimationFrame(frame);

  // 點作品：把畫框四角投影到螢幕上判斷
  function project(p) { const m = MVP, x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    if (w <= .05) return null; return [(x / w + 1) / 2 * W, (1 - y / w) / 2 * H, w]; }
  let down = null;
  cv.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
  cv.addEventListener('click', e => {
    if (!MVP || (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 10)) return;
    const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let hit = null;
    picks.forEach(pk => {
      const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => project([pk.c[0], pk.c[1] + b * pk.hh, pk.c[2] + pk.R[2] * a * pk.hw]));
      if (cs.some(c => !c)) return;
      // 點是否落在投影後的四邊形內
      let inside = true; for (let j = 0; j < 4; j++) { const a = cs[j], b = cs[(j + 1) % 4]; const cr = (b[0] - a[0]) * (my - a[1]) - (b[1] - a[1]) * (mx - a[0]); if (j === 0) inside = cr; else if (Math.sign(cr) !== Math.sign(inside)) { inside = false; break; } }
      if (inside !== false) { const d = cs[0][2]; if (!hit || d < hit.d) hit = { i: pk.i, d }; }
    });
    if (hit) openSheet(hit.i);
  });
})();

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
document.querySelectorAll('.rv').forEach(el => io.observe(el));
const nav = document.getElementById('nav'), whereN = document.getElementById('whereN'), rooms = [...document.querySelectorAll('[data-room]')], darkEl = document.getElementById('dark');
function onScroll() {
  const d = darkEl.getBoundingClientRect(); nav.classList.toggle('dark', d.top < 60 && d.bottom > 60);
  let cur = '入口'; rooms.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .5) cur = s.dataset.room; }); whereN.textContent = cur; document.getElementById('where').style.opacity = cur === 'I' ? 0 : 1;
}
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true }); onScroll();
})();
