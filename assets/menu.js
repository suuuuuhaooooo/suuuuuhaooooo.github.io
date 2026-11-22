/* 手機版選單：導覽列右上角的漢堡按鈕，點了變叉叉，展開全螢幕選單
   選單內容直接取自導覽列的連結，所以每一頁不用各寫一份 */
(function () {
  const nav = document.querySelector('.nav .wrap'); if (!nav) return;
  const links = [...nav.querySelectorAll('.links a')], pill = nav.querySelector('.pill[href]'), H = document.documentElement;
  const btn = document.createElement('button');
  btn.className = 'burger'; btn.type = 'button'; btn.setAttribute('aria-label', '開啟選單'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<i></i><i></i><i></i>';
  nav.appendChild(btn);

  const m = document.createElement('div'); m.className = 'mmenu'; m.setAttribute('aria-hidden', 'true');
  m.innerHTML = '<nav>' + links.map((a, i) => {
      const em = a.querySelector('em'), txt = a.textContent.replace(em ? em.textContent : '', '').trim();
      return `<a href="${a.getAttribute('href')}" style="transition-delay:${.18 + i * .07}s"><em>${em ? em.textContent : String(i + 1).padStart(2, '0')}</em>${txt}</a>`;
    }).join('') + '</nav>' +
    `<div class="foot">${pill ? `<a class="btn solid" href="${pill.getAttribute('href')}" target="_blank" rel="noopener">${pill.textContent.trim()}</a>` : ''}<p>SUHAO MATH &amp; SCIENCE</p></div>`;
  document.body.appendChild(m);

  const set = open => {
    H.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    m.setAttribute('aria-hidden', !open);
  };
  btn.addEventListener('click', () => set(!H.classList.contains('menu-open')));
  m.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 680) set(false); });
})();
