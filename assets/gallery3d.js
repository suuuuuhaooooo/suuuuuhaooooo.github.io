/* 展間 I：3D 展廳（three.js r169）
   - 往下捲 = 沿著走廊往前走，走到作品前鏡頭會轉頭去看
   - 每件作品一盞聚光燈；地板反光（平面反射）；展台上有旋轉的原子模型
   - 點畫框打開說明卡
   - 展品資料從後台（Supabase works 表）讀，讀不到就用 works.js 的預設 */
import * as THREE from './vendor/three/three.module.min.js';

const sec = document.getElementById('room1'), cv = document.getElementById('gl');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pad2 = n => String(n).padStart(2, '0');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = Math.min(innerWidth, innerHeight) < 700;

/* ---------- 展品資料 ---------- */
async function loadWorks() {
  const C = window.SUHAO, def = window.SUHAO_WORKS_DEFAULT;
  if (!C || !C.sb) return def;
  try {
    const q = C.sb.from('works').select('*').eq('active', true).order('sort');
    const r = await Promise.race([q, new Promise((_, no) => setTimeout(() => no('timeout'), 2500))]);
    if (r.error || !r.data || !r.data.length) return def;
    return r.data.map(w => ({ t: w.title, m: w.medium || '', d: w.description || '', u: w.url || '', b: w.button || '前往',
      img: w.image_url || '', svg: w.svg || '', w: w.width || 300, h: w.height || 300 }));
  } catch (_) { return def; }
}
const loadImg = src => new Promise(res => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

function fallback(W) {
  sec.classList.add('fallback');
  const box = document.getElementById('nogl');
  box.innerHTML = '<div class="room-head"><h2>展間 I　看見</h2></div>' +
    W.map((k, i) => `<p style="margin-top:28px"><a href="#" data-i="${i}" style="font-family:var(--serif);font-size:22px">No.${pad2(i + 1)}　${k.t}</a></p>`).join('');
  box.onclick = e => { const a = e.target.closest('[data-i]'); if (a) { e.preventDefault(); window.SUHAO_openSheet(+a.dataset.i); } };
}

const W = await loadWorks();
window.SUHAO_WORKS = W;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { fallback(W); throw e; }

renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = !small;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;   // 場景是靜態的，陰影只算幾次就好

const BG = new THREE.Color('#efede8');
const scene = new THREE.Scene();
scene.background = BG;
scene.fog = new THREE.Fog(BG, 9, 38);

/* ---------- 環境光（給金屬、亮面材質反射用） ---------- */
{
  const env = new THREE.Scene(), box = new THREE.BoxGeometry(1, 1, 1);
  const room = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 12), new THREE.MeshBasicMaterial({ color: 0x8a8782, side: THREE.BackSide }));
  env.add(room);
  [[0, 2.9, 0, 8, .1, 3], [-5.9, 1, 0, .1, 2, 6], [5.9, 1, 0, .1, 2, 6]].forEach(([x, y, z, sx, sy, sz]) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0xffffff })); m.position.set(x, y, z); m.scale.set(sx, sy, sz); env.add(m);
  });
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, .04).texture;
  scene.environmentIntensity = .55;
}

/* ---------- 尺寸 ---------- */
const HW = 3.5, HT = 4.4, Z0 = 6, GAP = 7.5, FIRST = -5;
const Z1 = FIRST - GAP * (W.length - 1) - 8;           // 走廊盡頭跟著作品數量
const LEN = Z0 - Z1, ZC = (Z0 + Z1) / 2;

const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .92, metalness: 0 }, o));
const canvasTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };

/* 牆、天花板 */
const wallMat = mat('#ecebe6');
const wallL = new THREE.Mesh(new THREE.PlaneGeometry(LEN, HT), wallMat); wallL.rotation.y = Math.PI / 2; wallL.position.set(-HW, HT / 2, ZC); wallL.receiveShadow = true;
const wallR = new THREE.Mesh(new THREE.PlaneGeometry(LEN, HT), wallMat); wallR.rotation.y = -Math.PI / 2; wallR.position.set(HW, HT / 2, ZC); wallR.receiveShadow = true;
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, LEN), mat('#f6f5f1')); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, HT, ZC);
scene.add(wallL, wallR, ceil);
// 踢腳板
[-1, 1].forEach(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(.03, .12, LEN), mat('#cfcabf')); b.position.set(s * (HW - .015), .06, ZC); scene.add(b); });
// 天花板燈軌
const trackMat = mat('#1e1e1e', { roughness: .5 });
[-1.7, 1.7].forEach(x => { const t = new THREE.Mesh(new THREE.BoxGeometry(.05, .04, LEN), trackMat); t.position.set(x, HT - .03, ZC); scene.add(t); });

/* 盡頭：通往暗房的門 */
{
  const tex = canvasTex(1024, 640, (g, w, h) => {
    g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#141414'; g.textAlign = 'center';
    g.font = '300 42px "Noto Serif TC","Songti TC",serif'; g.fillText('展間 II　暗房', w / 2, h * .2);
    g.font = '15px "Helvetica Neue",sans-serif'; g.fillStyle = '#777'; g.fillText('R O O M   I I   ·   T H E   D A R K   R O O M', w / 2, h * .26);
  });
  const end = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, HT), new THREE.MeshStandardMaterial({ map: tex, roughness: .95 }));
  end.position.set(0, HT / 2, Z1); scene.add(end);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.9), new THREE.MeshBasicMaterial({ color: 0x080808 }));
  door.position.set(0, 1.45, Z1 + .01); scene.add(door);
}

/* ---------- 燈 ---------- */
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, .55));
const amb = new THREE.AmbientLight(0xffffff, .25); scene.add(amb);

/* ---------- 作品 ---------- */
const picks = [];
const frameMat = mat('#151515', { roughness: .45 }), matteMat = mat('#fbfbf9', { roughness: .97 });
for (let i = 0; i < W.length; i++) {
  const k = W[i], side = i % 2 ? 1 : -1, z = FIRST - i * GAP;
  // 圖：照片或 SVG
  let src = k.img, url = null;
  if (!src) { url = URL.createObjectURL(new Blob([window.SUHAO_svgOf(k, `width="${k.w * 4}" height="${k.h * 4}"`)], { type: 'image/svg+xml' })); src = url; }
  const img = await loadImg(src); if (url) URL.revokeObjectURL(url);
  const iw = img ? img.naturalWidth || k.w : k.w, ih = img ? img.naturalHeight || k.h : k.h;
  if (img && k.img) { k.w = iw; k.h = ih; }
  const big = !!k.img, aw = big ? 2.1 : (iw > ih ? 1.55 : 1.25), ah = aw * ih / iw, m = .3, fr = .07, cy = 1.78;

  const g = new THREE.Group(); g.position.set(side * (HW - .02), cy, z); g.rotation.y = -side * Math.PI / 2; scene.add(g);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(aw + 2 * (m + fr), ah + 2 * (m + fr), .06), frameMat);
  frame.position.z = .03; frame.castShadow = true; g.add(frame);
  const matte = new THREE.Mesh(new THREE.PlaneGeometry(aw + 2 * m, ah + 2 * m), matteMat); matte.position.z = .061; g.add(matte);
  let artTex = null;
  if (img) {
    const c = document.createElement('canvas'), s = Math.min(1, 2048 / Math.max(iw, ih)); c.width = Math.round(iw * s * (k.img ? 1 : 1)); c.height = Math.round(ih * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    artTex = new THREE.CanvasTexture(c); artTex.colorSpace = THREE.SRGBColorSpace; artTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  const art = new THREE.Mesh(new THREE.PlaneGeometry(aw, ah), new THREE.MeshStandardMaterial({ map: artTex, color: artTex ? 0xffffff : 0xe6e3dc, roughness: .8 }));
  art.position.z = .062; g.add(art);
  [frame, matte, art].forEach(o => o.userData.i = i); picks.push(frame, matte, art);

  // 展品說明卡（牆上小白卡）
  const plate = canvasTex(512, 360, (x, w, h) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#8a8a86'; x.font = '22px "Helvetica Neue",sans-serif'; x.fillText('No. ' + pad2(i + 1), 34, 52);
    x.fillStyle = '#141414'; x.font = '500 42px "Noto Serif TC","Songti TC",serif'; x.fillText(k.t, 34, 114);
    x.fillStyle = '#8a8a86'; x.font = '21px "PingFang TC","Noto Sans TC",sans-serif'; x.fillText(k.m, 34, 156);
    x.fillStyle = '#333'; x.font = '22px "PingFang TC","Noto Sans TC",sans-serif';
    let line = '', y = 206; for (const ch of k.d) { if (x.measureText(line + ch).width > w - 68) { x.fillText(line, 34, y); line = ch; y += 34; if (y > h - 24) break; } else line += ch; }
    if (y <= h - 24) x.fillText(line, 34, y);
  });
  const pl = new THREE.Mesh(new THREE.BoxGeometry(.6, .42, .015), [matteMat, matteMat, matteMat, matteMat, new THREE.MeshStandardMaterial({ map: plate, roughness: .9 }), matteMat]);
  pl.position.set(aw / 2 + m + fr + .62, -.42, .01); pl.castShadow = true; pl.userData.i = i; g.add(pl); picks.push(pl);

  // 聚光燈：從天花板燈軌打在畫上
  const sp = new THREE.SpotLight(0xfff4e2, small ? 26 : 32, 9, .52, .55, 1.6);
  sp.position.set(side * 1.7, HT - .1, z + (small ? 0 : .6));
  sp.target.position.set(side * (HW - .05), cy - .1, z); scene.add(sp, sp.target);
  if (!small) { sp.castShadow = true; sp.shadow.mapSize.set(512, 512); sp.shadow.bias = -.0004; sp.shadow.radius = 5; }
  // 燈具
  const can = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, .22, 16), trackMat);
  can.position.copy(sp.position).add(new THREE.Vector3(0, .02, 0)); can.lookAt(sp.target.position); can.rotateX(Math.PI / 2); scene.add(can);
}

/* ---------- 展台與立體作品：原子模型 ---------- */
const atom = new THREE.Group();
const OBST = [];   // 走道中間的東西（展台、長椅），鏡頭要繞過去
{
  const pz = FIRST - GAP * Math.min(2.5, (W.length - 1) / 2);
  OBST.push({ z: pz, side: 1, look: true });     // 從展台右邊繞過，邊走邊看原子模型
  const ped = new THREE.Mesh(new THREE.BoxGeometry(.7, 1.05, .7), mat('#f7f6f2', { roughness: .6 }));
  ped.position.set(0, .525, pz); ped.castShadow = ped.receiveShadow = true; scene.add(ped);
  atom.position.set(0, 1.62, pz); scene.add(atom);
  const nuc = new THREE.Group(); atom.add(nuc);
  const red = mat('#c8361f', { roughness: .35 }), blue = mat('#1d3c78', { roughness: .35 }), sg = new THREE.SphereGeometry(.055, 24, 16);
  for (let j = 0; j < 14; j++) { const s = new THREE.Mesh(sg, j % 2 ? red : blue); const v = new THREE.Vector3().randomDirection().multiplyScalar(.06 * Math.cbrt(Math.random() + .2)); s.position.copy(v); nuc.add(s); }
  const ringMat = mat('#1a1a1a', { metalness: .9, roughness: .25 }), eMat = new THREE.MeshStandardMaterial({ color: 0xd9a521, emissive: 0xd9a521, emissiveIntensity: .6, roughness: .3 });
  atom.userData.e = [];
  for (let j = 0; j < 3; j++) {
    const orb = new THREE.Group(); orb.rotation.set(Math.PI / 2, 0, j * Math.PI / 3); atom.add(orb);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.34, .004, 8, 96), ringMat); orb.add(ring);
    const e = new THREE.Mesh(new THREE.SphereGeometry(.026, 16, 12), eMat); orb.add(e); atom.userData.e.push([e, j * 2.1, 1 + j * .25]);
  }
  const sp = new THREE.SpotLight(0xffffff, 18, 6, .35, .6, 1.5); sp.position.set(0, HT - .1, pz + .4); sp.target = ped;
  if (!small) { sp.castShadow = true; sp.shadow.mapSize.set(512, 512); }
  scene.add(sp);
  // 展台說明
  const tx = canvasTex(512, 160, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#141414'; x.font = '500 34px "Noto Serif TC",serif'; x.fillText('看不見的，畫出來', 26, 70);
    x.fillStyle = '#8a8a86'; x.font = '20px "PingFang TC",sans-serif'; x.fillText('原子模型・見微理畫立體版', 26, 118); });
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(.62, .19), new THREE.MeshStandardMaterial({ map: tx, roughness: .9 }));
  cap.position.set(0, .9, pz + .352); scene.add(cap);
  // 長椅
  const bz = pz - GAP * 1.6;
  if (bz > Z1 + 4) {
    OBST.push({ z: bz, side: -1, look: false });  // 長椅從左邊繞過
    const wood = mat('#3a2f25', { roughness: .55 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.6, .08, 2.2), wood); seat.position.set(0, .45, bz); seat.castShadow = true; scene.add(seat);
    [-1, 1].forEach(s => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.5, .42, .06), trackMat); leg.position.set(0, .21, bz + s * .95); scene.add(leg); });
  }
}

/* ---------- 地板：亮面，帶平面反射 ---------- */
const rtSize = small ? .5 : .75;
const rt = new THREE.WebGLRenderTarget(16, 16, { colorSpace: THREE.SRGBColorSpace });
const floorTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#d6d0c3'; g.fillRect(0, 0, w, h);
  for (let n = 0; n < 5000; n++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '90,80,60'},${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 10 + Math.random() * 40); }
  g.fillStyle = 'rgba(70,60,45,.22)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 1.5, h);
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(1.8, LEN / 3.6);
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55, metalness: 0 });
const texMatrix = new THREE.Matrix4();
floorMat.onBeforeCompile = sh => {
  sh.uniforms.tReflect = { value: rt.texture }; sh.uniforms.texMatrix = { value: texMatrix };
  sh.vertexShader = 'uniform mat4 texMatrix;\nvarying vec4 vRefl;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvRefl = texMatrix * vec4(position, 1.0);');
  sh.fragmentShader = 'uniform sampler2D tReflect;\nvarying vec4 vRefl;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     vec3 refl = texture2DProj(tReflect, vRefl).rgb;
     float fres = .16 + .22 * pow(1.0 - abs(normalize(vViewPosition).z), 2.0);
     gl_FragColor.rgb = mix(gl_FragColor.rgb, refl, fres);`);
};
const floor = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, LEN), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, ZC); floor.receiveShadow = true; scene.add(floor);
const mirrorCam = new THREE.PerspectiveCamera();
const bias = new THREE.Matrix4().set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1);
function renderReflection(cam) {
  mirrorCam.copy(cam);
  mirrorCam.position.set(cam.position.x, -cam.position.y, cam.position.z);   // 對 y=0 平面鏡射
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir); dir.y *= -1;
  mirrorCam.up.set(0, -1, 0); mirrorCam.lookAt(mirrorCam.position.clone().add(dir)); mirrorCam.up.set(0, 1, 0);
  mirrorCam.updateMatrixWorld(); mirrorCam.projectionMatrix.copy(cam.projectionMatrix);
  texMatrix.copy(bias).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse).multiply(floor.matrixWorld);
  floor.visible = false; renderer.setRenderTarget(rt); renderer.render(scene, mirrorCam); renderer.setRenderTarget(null); floor.visible = true;
}

/* ---------- 相機、捲動 ---------- */
const cam = new THREE.PerspectiveCamera(60, 1, .05, 80);
let Wd = 0, Ht = 0;
function size() {
  Wd = cv.clientWidth; Ht = cv.clientHeight; if (!Wd || !Ht) return;
  renderer.setSize(Wd, Ht, false);
  cam.aspect = Wd / Ht; cam.fov = cam.aspect < .8 ? 72 : 55; cam.updateProjectionMatrix();
  const pr = renderer.getPixelRatio(); rt.setSize(Math.round(Wd * pr * rtSize), Math.round(Ht * pr * rtSize));
}
addEventListener('resize', size); size();

let look2 = [0, 0], cz = Z0 - 1.5, yaw = 0, pitch = 0, active = false, lastNear = -2;
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') look2 = [(e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2]; });
new IntersectionObserver(es => active = es[0].isIntersecting).observe(sec);
// 作品越多，走廊越長。用「載入時的螢幕高度」換成固定 px，只有寬度改變（轉向）才重算：
// 手機網址列收合會讓 vh 變動，走廊有 8 個螢幕高，乘上去後下面的區塊就會跳來跳去
let lenW = 0;
function setLen() { if (innerWidth === lenW) return; lenW = innerWidth; sec.style.height = Math.round(innerHeight * (1 + (W.length * 115 + 120) / 100)) + 'px'; }
setLen(); addEventListener('resize', setLen);

const $ = id => document.getElementById(id);
const gnow = $('gnow'), gnowN = $('gnowN'), gnowT = $('gnowT'), gbar = $('gbar'), gcnt = $('gcnt'), ghead = $('ghead');
document.querySelector('.hud .label').textContent = `ROOM I · ${pad2(W.length)} WORKS`;
const CZ0 = Z0 - 1.5, CZ1 = Z1 + 6, clock = new THREE.Clock();
let shadowFrames = 4;

function frame() {
  requestAnimationFrame(frame);
  if (!active) return;
  const t = clock.getElapsedTime();
  const r = sec.getBoundingClientRect(), prog = clamp(-r.top / (r.height - innerHeight || 1));
  const tz = CZ0 + (CZ1 - CZ0) * prog; cz += (tz - cz) * (reduce ? 1 : .08);
  let ty = 0, near = -1, best = 0;
  W.forEach((k, i) => { const z = FIRST - i * GAP, side = i % 2 ? 1 : -1, w = Math.exp(-Math.pow(cz - (z + 2.4), 2) / 3.4);
    ty += side * .95 * w; if (w > best) { best = w; near = i; } });
  if (best < .45) near = -1;
  // 繞開走道中間的展台、長椅：越接近越往旁邊偏
  let ox = 0;
  OBST.forEach(o => { const w = Math.exp(-Math.pow(cz - o.z, 2) / (2 * 1.7 * 1.7)); ox += o.side * 1.6 * w; if (o.look) ty -= o.side * .5 * w; });
  ty += look2[0] * .16; yaw += (ty - yaw) * .06; pitch += (-look2[1] * .07 - pitch) * .06;
  cam.position.set(ox + Math.sin(yaw * .5) * .4, 1.62 + Math.sin(cz * 1.7) * .012, cz);
  cam.lookAt(cam.position.x + Math.sin(yaw), cam.position.y + pitch, cam.position.z - Math.cos(yaw));

  // 原子模型
  atom.rotation.y = t * .35; atom.rotation.x = Math.sin(t * .4) * .2;
  atom.userData.e.forEach(([e, ph, sp]) => { const a = t * sp * 1.6 + ph; e.position.set(Math.cos(a) * .34, Math.sin(a) * .34, 0); });

  if (shadowFrames-- > 0) renderer.shadowMap.needsUpdate = true;
  renderReflection(cam);
  renderer.render(scene, cam);

  gbar.style.width = (prog * 100) + '%';
  ghead.style.opacity = clamp(1 - prog * 12);
  if (near !== lastNear) {
    lastNear = near; gnow.style.opacity = 0; gnow.style.transform = 'translateY(8px)';
    setTimeout(() => {
      if (near < 0) { gnowN.textContent = prog > .9 ? '前方是展間 II' : '往下捲動，往前走'; gnowT.textContent = ''; }
      else { gnowN.textContent = 'No. ' + pad2(near + 1) + '　點一下看說明'; gnowT.textContent = W[near].t; }
      gnow.style.opacity = 1; gnow.style.transform = 'none';
    }, 250);
    gcnt.textContent = pad2(near < 0 ? Math.round(prog * W.length) : near + 1) + ' / ' + pad2(W.length);
  }
}
requestAnimationFrame(frame);

/* ---------- 點作品 ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let down = null;
cv.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
cv.addEventListener('click', e => {
  if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 10) return;
  const r = cv.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ndc, cam);
  const hit = ray.intersectObjects(picks, false)[0];
  if (hit) window.SUHAO_openSheet(hit.object.userData.i);
});
cv.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const r = cv.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ndc, cam); cv.style.cursor = ray.intersectObjects(picks, false).length ? 'pointer' : 'default';
});
