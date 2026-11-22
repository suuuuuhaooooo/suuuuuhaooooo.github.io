/* 參觀動線：一條從入口畫到出口的線，跟著捲動畫出來 */
(function () {
  const svg = document.getElementById('route'); if (!svg) return;
  const bg = document.getElementById('rbg'), fg = document.getElementById('rfg'), stG = document.getElementById('rst'), tip = document.getElementById('rtip');
  const Q = s => document.querySelector(s);
  let len = 0, table = [], stations = [];

  function build() {
    const W = document.documentElement.clientWidth, H = document.documentElement.scrollHeight, top = el => el.getBoundingClientRect().top + scrollY;
    svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const hero = Q('.entry'), pro = Q('.prologue'), gal = Q('#room1'), dark = Q('#dark'), col = Q('#column'), vis = Q('#visit'), ex = Q('#hi');
    const vh = innerHeight, m = Math.max(12, (W - 1160) / 2 + 12), R = W - m, T = el => top(el), B = el => top(el) + el.offsetHeight;
    // 線只走左右留白，在區塊之間的空白處換邊；藝廊和暗房不透明，線從後面穿過
    const P = [
      [R, T(hero) + hero.offsetHeight * .42],     // 00 入口
      [R, B(hero) - 4],
      [m, T(pro) + vh * .16],
      [m, T(gal) + 2],                            // 01 作品
      [m, T(col) + vh * .1],                      // 02 專欄
      [m, T(vis) + vh * .03],
      [R, T(vis) + vh * .14],                     // 03 參觀資訊
      [R, T(ex) + vh * .02],
      [m, T(ex) + vh * .12],                      // 04 出口
      [m, T(ex) + vh * .16 + 60],
    ];
    // 同一側就直線，換邊就畫一個 S 形
    let d = `M${P[0][0]},${P[0][1]}`;
    for (let i = 1; i < P.length; i++) {
      const [x1, y1] = P[i - 1], [x2, y2] = P[i];
      if (Math.abs(x1 - x2) < 1) d += ` L${x2},${y2}`;
      else { const my = (y1 + y2) / 2; d += ` C${x1},${my} ${x2},${my} ${x2},${y2}`; }
    }
    bg.setAttribute('d', d); fg.setAttribute('d', d);
    len = fg.getTotalLength(); fg.style.strokeDasharray = len; fg.style.strokeDashoffset = len;
    table = []; for (let l = 0; l <= len; l += 12) { const pt = fg.getPointAtLength(l); table.push([l, pt.y, pt.x]); }
    // 站點：每一區一個編號
    const names = [['00', 0], ['01', 3], ['02', 4], ['03', 6], ['04', 8]];
    stations = names.map(([n, i]) => ({ n, x: P[i][0], y: P[i][1] }));
    stG.innerHTML = stations.map((s, i) => `<g class="st" data-i="${i}"><circle cx="${s.x}" cy="${s.y}" r="5"/><text x="${s.x}" y="${s.y - 12}" text-anchor="middle">${s.n}</text></g>`).join('');
    draw();
  }
  function lenAtY(y) {             // 找到線在畫面這個高度時已經走了多長
    let best = 0; for (const [l, py] of table) { if (py <= y) best = l; else break; } return best;
  }
  function draw() {
    if (!len) return;
    const y = scrollY + innerHeight * .62, l = Math.min(len, lenAtY(y));
    fg.style.strokeDashoffset = len - l;
    const pt = fg.getPointAtLength(l); tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y);
    stG.querySelectorAll('.st').forEach((g, i) => g.classList.toggle('on', stations[i].y <= y));
  }
  let raf = 0;
  addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }, { passive: true });
  let rw = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 30) { rw = innerWidth; build(); } });
  addEventListener('load', build);
  setTimeout(build, 300); setTimeout(build, 2500);  // 字型、專欄載入後高度會變
  new MutationObserver(() => { clearTimeout(build.t); build.t = setTimeout(build, 200); }).observe(document.getElementById('alist'), { childList: true });
})();
