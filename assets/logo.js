/* 把 <span class="logo" data-text="蘇昊數理"> 變成殘影字標；
   之後如果改用 Canva 匯出的圖檔，直接換成 <img src="assets/logo.svg"> 即可 */
window.suhaoLogo = function (el) {
  var txt = el.dataset.text, html = '', drop = el.classList.contains('drop');
  [].forEach.call(txt, function (c, i) {
    var d = drop ? ' style="animation-delay:' + (0.25 + i * 0.12) + 's"' : '';
    html += '<span class="ch" aria-hidden="true"><b class="g g1"' + d + '>' + c + '</b><b class="g g2"' + d + '>' + c + '</b><b' + d + '>' + c + '</b></span>';
  });
  el.innerHTML = html; el.setAttribute('role', 'img'); el.setAttribute('aria-label', txt);
};
document.querySelectorAll('.logo[data-text]').forEach(window.suhaoLogo);
