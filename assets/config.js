/* 蘇昊數理 個人網站設定
   跟「會考模擬考」共用同一個 Supabase 專案，所以 Google 登入、管理員身分（profiles.role = 'admin'）兩邊通用。
   anon / publishable key 本來就是公開用的；真正的權限由資料表的 RLS 控制（見 supabase-articles.sql）。 */
window.SUHAO = {
  SUPABASE_URL: 'https://dqnwmfpwakuegpbyhksq.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_aurj3qU251aqb0lWoUoQnw_EfV1SnE0',
  LINE: 'https://line.me/ti/p/~@000gwomo',
  OLD: '/-/',                       // 舊版入口網（classroom、profile、schedule…都還在這裡）
  BUCKET: 'article-images'
};
(function () {
  const C = window.SUHAO;
  C.sb = (window.supabase && C.SUPABASE_URL) ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;

  // 共用小工具
  C.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.date = d => { const x = new Date(d); return `${x.getFullYear()}.${String(x.getMonth() + 1).padStart(2, '0')}.${String(x.getDate()).padStart(2, '0')}`; };
  C.articleUrl = slug => 'article.html?s=' + encodeURIComponent(slug);

  // 不在正式網域（例如預覽）時，讀不到資料就用示範文章，方便看版面
  C.demo = !/suuuuuhaooooo\.github\.io$|^localhost$/.test(location.hostname);
  C.DEMO = [
    { slug: 'demo-1', title: '為什麼我要把抽象畫出來', excerpt: '公式不是用來背的。它是某個人看見了什麼，才寫下來的一句話。', tags: ['教學筆記'], published_at: '2026-11-20', cover_url: '',
      body: '## 先看見\n\n這是一篇**示範文章**，正式上線後會換成你在後台寫的內容。\n\n> 公式也能寫：$a^2+b^2=c^2$\n\n$$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$' },
    { slug: 'demo-2', title: '會考理化，圖比字重要', excerpt: '近幾年的會考題，一半以上的關鍵資訊藏在圖裡。', tags: ['會考'], published_at: '2026-11-12', cover_url: '', body: '示範文章。' },
    { slug: 'demo-3', title: '讓國小孩子愛上分數的三個小實驗', excerpt: '一張紙、一條繩子、一盒披薩。', tags: ['國小數學'], published_at: '2026-11-03', cover_url: '', body: '示範文章。' },
  ];

  // 已發布的文章（新到舊）
  C.listArticles = async (limit = 50) => {
    if (!C.sb) { if (C.demo) return C.DEMO.slice(0, limit); throw new Error('no-supabase'); }
    if (C.demo) { try { const r = await C._list(limit); return r.length ? r : C.DEMO.slice(0, limit); } catch (_) { return C.DEMO.slice(0, limit); } }
    return C._list(limit);
  };
  C._list = async (limit) => {
    const { data, error } = await C.sb.from('articles')
      .select('slug,title,excerpt,cover_url,tags,published_at')
      .eq('published', true).lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false }).limit(limit);
    if (error) throw error; return data || [];
  };
})();
