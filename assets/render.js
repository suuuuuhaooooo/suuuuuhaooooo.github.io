/* Markdown → 文章 HTML。前台 article.html 和後台預覽共用，所以兩邊長得一樣。
   除了一般 Markdown，還支援「時事 × 自然」專欄用的幾種寫法：
   $公式$、$$獨立公式$$
   > [!先猜] 問題        → 先猜卡（答案要按才會打開；有「答案：」那行時，上面全部當題目）
   > [!注意] 文字        → 提醒框
   {官方} {報導} {訪談} {推估} {假設} → 證據等級標籤
   ```lab   …HTML…  ```   → 互動實驗（在隔離的小視窗裡執行）
   ```embed 網址 ```      → 嵌入見微理畫、數光島的單元頁 */
window.renderArticle = function (el, md) {
  const math = [];
  let src = String(md || '')
    .replace(/(```[\s\S]*?```)/g, m => m.replace(/\$/g, '\u0000'))        // code 區塊裡的 $ 先保護起來
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { math.push([t, true]); return `\n\nMATHBLOCK${math.length - 1}END\n\n`; })
    .replace(/(^|[^\\$])\$([^\n$]+?)\$/g, (_, pre, t) => { math.push([t, false]); return `${pre}MATHINLINE${math.length - 1}END`; })
    .replace(/\u0000/g, '$');

  let html = window.marked ? window.marked.parse(src, { breaks: true, gfm: true }) : '<p>' + src.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</p>';
  if (window.DOMPurify) html = window.DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });

  const tex = (t, d) => { try { return window.katex ? window.katex.renderToString(t, { displayMode: d, throwOnError: false }) : (d ? `$$${t}$$` : `$${t}$`); } catch (_) { return t; } };
  html = html.replace(/<p>\s*MATHBLOCK(\d+)END\s*<\/p>/g, (_, i) => tex(math[i][0], true))
             .replace(/MATHBLOCK(\d+)END/g, (_, i) => tex(math[i][0], true))
             .replace(/MATHINLINE(\d+)END/g, (_, i) => tex(math[i][0], false))
             .replace(/\{(官方|報導|訪談|推估|假設|研究)\}/g, (_, k) => `<span class="ev ev-${{ 官方: 'a', 研究: 'a', 報導: 'b', 訪談: 'c', 推估: 'd', 假設: 'd' }[k]}">${k}</span>`);
  el.innerHTML = html;

  // 先猜卡、注意框
  el.querySelectorAll('blockquote').forEach(bq => {
    const first = bq.firstElementChild; if (!first) return;
    const m = first.innerHTML.match(/^\s*\[!(先猜|注意)\]\s*/); if (!m) return;
    first.innerHTML = first.innerHTML.slice(m[0].length);
    if (m[1] === '注意') { bq.className = 'note'; return; }
    // 有「答案」開頭的那一行：上面全部是題目（含選項），下面才是答案；沒有的話，第一行是題目
    const parts = first.innerHTML.split(/<br\s*\/?>/);
    let cut = parts.findIndex((t, k) => k > 0 && /^\s*(<strong>)?\s*答案/.test(t));
    if (cut < 0) cut = 1;
    const q = parts.slice(0, cut).join('<br>'), rest = parts.slice(cut).join('<br>');
    const box = document.createElement('div'); box.className = 'guess';
    box.innerHTML = `<span class="gl">先猜</span><p class="gq">${q}</p><button type="button" class="gb">想好了，看答案</button><div class="ga"></div>`;
    const ans = box.querySelector('.ga');
    if (rest.trim()) { const p = document.createElement('p'); p.innerHTML = rest; ans.appendChild(p); }
    [...bq.children].slice(1).forEach(c => ans.appendChild(c));
    box.querySelector('.gb').onclick = e => { box.classList.add('open'); e.target.remove(); };
    bq.replaceWith(box);
  });

  // 互動實驗與嵌入
  el.querySelectorAll('pre > code').forEach(code => {
    const lang = (code.className.match(/language-(\w+)/) || [])[1];
    if (lang !== 'lab' && lang !== 'embed') return;
    const pre = code.parentElement, fig = document.createElement('figure'); fig.className = 'lab';
    const f = document.createElement('iframe'); f.loading = 'lazy'; f.title = '互動實驗';
    if (lang === 'embed') {
      const url = code.textContent.trim();
      if (!/^(\/|https:\/\/suuuuuhaooooo\.github\.io\/)/.test(url)) return;   // 只嵌自己網站的頁面
      f.src = url; f.style.height = '560px';
      fig.innerHTML = `<figcaption><span>互動單元</span><a href="${url}" target="_blank" rel="noopener">開新視窗 ↗</a></figcaption>`;
    } else {
      // 隔離執行：不能碰到網站本身、也拿不到登入資訊
      f.setAttribute('sandbox', 'allow-scripts');
      const id = 'lab' + Math.random().toString(36).slice(2);
      f.srcdoc = `<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
        body{margin:0;padding:18px;font:15px/1.7 "PingFang TC","Noto Sans TC",system-ui,sans-serif;color:#141414;background:#fff}
        input[type=range]{width:100%;accent-color:#141414}button{font:inherit;padding:6px 14px;border:1px solid #141414;background:#fff;cursor:pointer}
        button:hover{background:#141414;color:#fff}label{display:block;margin:8px 0 2px;font-size:13px;color:#666}canvas,svg{max-width:100%;display:block}
        .out{font:500 20px/1.5 Georgia,serif;margin-top:10px}</style>${code.textContent}
        <script>new ResizeObserver(()=>parent.postMessage({lab:'${id}',h:document.documentElement.scrollHeight},'*')).observe(document.body)<\/script>`;
      addEventListener('message', e => { if (e.data && e.data.lab === id) f.style.height = Math.min(1400, e.data.h + 4) + 'px'; });
      f.style.height = '320px';
      fig.innerHTML = '<figcaption><span>動手試</span><span>拖拉、按按看</span></figcaption>';
    }
    fig.insertBefore(f, fig.firstChild); pre.replaceWith(fig);
  });

  el.querySelectorAll('a[href^="http"]').forEach(a => { if (!a.href.startsWith(location.origin)) { a.target = '_blank'; a.rel = 'noopener'; } });
};

/* 專欄共用樣式（前台與後台預覽都會載入） */
(function () {
  if (document.getElementById('render-css')) return;
  const st = document.createElement('style'); st.id = 'render-css';
  st.textContent = `
  .guess{border:1px solid #141414;padding:22px 24px;margin:1.6em 0;position:relative;font-family:var(--serif,serif)}
  .guess .gl{position:absolute;top:-10px;left:18px;background:#fbfbf9;padding:0 8px;font:500 11px/20px var(--sans,sans-serif);letter-spacing:.3em}
  .guess .gq{font-size:1.08em;font-weight:500;margin:0}
  .guess .gb{margin-top:14px;font:12px/1 var(--sans,sans-serif);letter-spacing:.2em;padding:10px 16px;border:1px solid #141414;background:none;cursor:pointer}
  .guess .gb:hover{background:#141414;color:#fff}
  .guess .ga{display:none;margin-top:14px;padding-top:14px;border-top:1px dashed #cfcec8;color:#333}
  .guess.open .ga{display:block;animation:gaIn .6s ease}
  @keyframes gaIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  blockquote.note{border:0!important;background:#efede8;padding:16px 20px!important;font-size:.92em;color:#444}
  blockquote.note::before{content:"注意";display:block;font:500 11px var(--sans,sans-serif);letter-spacing:.3em;margin-bottom:4px;color:#141414}
  .ev{display:inline-block;font:500 11px/1.6 var(--sans,sans-serif);letter-spacing:.08em;padding:0 7px;margin:0 3px;border:1px solid;vertical-align:2px;border-radius:2px}
  .ev-a{color:#2e6b3a}.ev-b{color:#1d3c78}.ev-c{color:#8a6a10}.ev-d{color:#b3261e;border-style:dashed}
  figure.lab{margin:2em 0;border:1px solid #141414;background:#fff}
  figure.lab iframe{width:100%;border:0;display:block}
  figure.lab figcaption{display:flex;justify-content:space-between;border-top:1px solid #141414;padding:8px 14px;font:11px var(--sans,sans-serif);letter-spacing:.2em;color:#666}`;
  document.head.appendChild(st);
})();
