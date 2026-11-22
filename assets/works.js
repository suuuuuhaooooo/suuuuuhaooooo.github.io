/* 展品預設資料：後台（admin-works.html）讀不到資料庫時才用這份。
   正式的展品請到後台改，不用改這個檔案。 */
(function () {
/* ================= 作品資料 ================= */
const OP = (() => { let s = '', ans = 'BDACBADCCBDA';
  for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) { const on = 'ABCD'[c] === ans[r], x = 66 + c * 46, y = 40 + r * 19;
    s += on ? `<rect x="${x}" y="${y}" width="30" height="9" rx="4.5" fill="${r % 5 === 2 ? '#c8361f' : '#141414'}"/>`
            : `<rect x="${x}" y="${y}" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/>`; }
  return s; })();
window.SUHAO_WORKS_DEFAULT = [
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
window.SUHAO_svgOf = (k, cls = '') => k.img && !cls ? `<img src="${k.img}" alt="${k.t}" style="width:100%;display:block;border:1px solid #141414">`
  : `<svg ${cls} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${k.w} ${k.h}">${k.svg}</svg>`;
window.SUHAO_pad2 = n => String(n).padStart(2, '0');

})();
