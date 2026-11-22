/* 防止右鍵、選取、複製、拖曳圖片（只是增加門檻，擋不了截圖或懂技術的人） */
(function () {
  const ok = e => e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]');
  ['contextmenu', 'copy', 'cut', 'selectstart', 'dragstart'].forEach(t =>
    document.addEventListener(t, e => { if (!ok(e)) e.preventDefault(); }, { capture: true }));
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (ok(e) && mod && ['c', 'x', 'a', 'v'].includes(k)) return;          // 搜尋框還是可以正常打字、貼上
    if ((mod && ['c', 'x', 'a', 's', 'u', 'p'].includes(k)) || k === 'f12' || (mod && e.shiftKey && ['i', 'j', 'c'].includes(k))) e.preventDefault();
  }, { capture: true });
  const st = document.createElement('style');
  st.textContent = 'body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}input,textarea{-webkit-user-select:text;user-select:text}img{-webkit-user-drag:none}';
  document.head.appendChild(st);
})();
