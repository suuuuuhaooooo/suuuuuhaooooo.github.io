-- =========================================================
-- 蘇昊數理 個人網站：專欄文章
-- 貼到「會考模擬考」那個 Supabase 專案 → SQL Editor → Run
-- 沿用既有的 profiles 表：role = 'admin' 的帳號就能在 admin.html 寫文章
-- （這個檔案不用上傳到 GitHub）
-- =========================================================

-- 1. 判斷目前登入的人是不是管理員
create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
grant execute on function public.is_site_admin() to anon, authenticated;

-- 2. 文章表
create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,                 -- 網址用：article.html?s=slug
  title        text not null,
  excerpt      text,                                 -- 列表上的摘要
  cover_url    text,                                 -- 封面圖
  tags         text[] not null default '{}',
  body         text not null default '',             -- Markdown，可寫 $公式$
  published    boolean not null default false,       -- false = 草稿
  published_at timestamptz not null default now(),   -- 可以排未來時間，到時間才會出現
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists articles_pub_idx on public.articles (published, published_at desc);

create or replace function public.touch_articles() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles for each row execute function public.touch_articles();

alter table public.articles enable row level security;

-- 所有人：只讀得到「已發布、而且時間到了」的文章；管理員讀得到全部（含草稿）
drop policy if exists "articles read" on public.articles;
create policy "articles read" on public.articles for select to anon, authenticated
  using ((published and published_at <= now()) or public.is_site_admin());

-- 只有管理員可以新增／修改／刪除
drop policy if exists "articles admin write" on public.articles;
create policy "articles admin write" on public.articles for all to authenticated
  using (public.is_site_admin()) with check (public.is_site_admin());

-- 2b. 瀏覽人次：用一個不會被亂改的函式來加 1，而不是讓前端直接寫 views 欄位
alter table public.articles add column if not exists views integer not null default 0;

create or replace function public.bump_article_views(p_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v integer;
begin
  update public.articles
     set views = views + 1
   where slug = p_slug
     and published
     and published_at <= now()
  returning views into v;
  return v;
end;
$$;
-- 只開放「執行這個函式」的權限；沒有開放任何人直接 update articles.views，
-- 所以訪客端只能透過這支函式讓數字 +1，沒辦法把數字改成任意值。
grant execute on function public.bump_article_views(text) to anon, authenticated;

-- 3. 文章圖片（公開讀取，只有管理員能上傳）
insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true)
on conflict (id) do nothing;

drop policy if exists "article images read" on storage.objects;
create policy "article images read" on storage.objects for select
  using (bucket_id = 'article-images');
drop policy if exists "article images admin insert" on storage.objects;
create policy "article images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'article-images' and public.is_site_admin());
drop policy if exists "article images admin update" on storage.objects;
create policy "article images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'article-images' and public.is_site_admin());
drop policy if exists "article images admin delete" on storage.objects;
create policy "article images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'article-images' and public.is_site_admin());

-- 4. 第一篇範例文章（不要的話在後台刪掉就好）
insert into public.articles (slug, title, excerpt, tags, body, published)
values ('hello', '開張：為什麼我要把抽象畫出來', '這個專欄會寫教學現場的觀察、讀書方法，還有一些我覺得很美的數學和物理。', array['教學筆記'],
'## 第一篇

這裡是專欄的第一篇文章，可以在 **admin.html** 後台修改或刪除。

> 公式也能寫：$E = mc^2$，或是獨立一行
$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
', true)
on conflict (slug) do nothing;

-- =========================================================
-- 5. 展品（首頁 3D 展廳的作品，在 admin-works.html 編輯）
-- =========================================================
create table if not exists public.works (
  id          uuid primary key default gen_random_uuid(),
  sort        int not null default 100,        -- 越小越前面
  title       text not null,
  medium      text,                            -- 媒材，例如「網站　HTML、SVG」
  description text,
  url         text,                            -- 說明卡上按鈕的連結
  button      text default '前往',
  image_url   text,                            -- 作品圖（截圖、照片）
  svg         text,                            -- 沒有圖片時用的 SVG 圖
  width       int,                             -- SVG 的寬高（有圖片時自動抓）
  height      int,
  active      boolean not null default true,   -- false = 先不展出
  updated_at  timestamptz not null default now()
);
alter table public.works enable row level security;
drop policy if exists "works read" on public.works;
create policy "works read" on public.works for select to anon, authenticated using (active or public.is_site_admin());
drop policy if exists "works admin write" on public.works;
create policy "works admin write" on public.works for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- 預設六件（跟網站內建的一樣；表裡已經有資料就不會重複放）
insert into public.works (sort, title, medium, description, url, button, image_url, svg, width, height)
select * from (values
(10, '數光島筆記本', '網站　HTML、SVG、JavaScript', '國小數學 412 個小節，每一節都做成可以動手玩的頁面，另外有無限出題、學習地圖和遊戲場。', '/math-Illustration/', '前往數光島', 'assets/works/math.jpg', null, null, null),
(20, '見微理畫', '網站　程式繪製 SVG', '國中理化 70 個單元。燒杯、光線、電路和粒子，都是一筆一筆用程式畫出來的。', '/science-Illustration/', '前往見微理畫', 'assets/works/science.jpg', null, null, null),
(30, '會考模擬考', '網站　線上報名與作答', '題本和詳解只開放給報名的考生，答案也只能送出一次。', '/mock-exam/', '前往報名', null, '<rect width="300" height="300" fill="#f2efe8"/><rect x="66" y="40" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="40" width="30" height="9" rx="4.5" fill="#141414"/><rect x="158" y="40" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="40" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="59" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="59" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="59" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="59" width="30" height="9" rx="4.5" fill="#141414"/><rect x="66" y="78" width="30" height="9" rx="4.5" fill="#c8361f"/><rect x="112" y="78" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="78" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="78" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="97" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="97" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="97" width="30" height="9" rx="4.5" fill="#141414"/><rect x="204" y="97" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="116" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="116" width="30" height="9" rx="4.5" fill="#141414"/><rect x="158" y="116" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="116" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="135" width="30" height="9" rx="4.5" fill="#141414"/><rect x="112" y="135" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="135" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="135" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="154" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="154" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="154" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="154" width="30" height="9" rx="4.5" fill="#141414"/><rect x="66" y="173" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="173" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="173" width="30" height="9" rx="4.5" fill="#c8361f"/><rect x="204" y="173" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="192" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="192" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="192" width="30" height="9" rx="4.5" fill="#141414"/><rect x="204" y="192" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="211" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="211" width="30" height="9" rx="4.5" fill="#141414"/><rect x="158" y="211" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="211" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="66" y="230" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="112" y="230" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="230" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="230" width="30" height="9" rx="4.5" fill="#141414"/><rect x="66" y="249" width="30" height="9" rx="4.5" fill="#141414"/><rect x="112" y="249" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="158" y="249" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/><rect x="204" y="249" width="30" height="9" rx="4.5" fill="none" stroke="#141414" stroke-width=".8"/>', 300, 300),
(40, '《本徵》', '書　LaTeX 排版', '18 個單元的國中理化會考複習教材，分成教師版、學生版和詳解本。', 'https://myship.7-11.com.tw/general/detail/GM2609106147789', '蘇昊小舖', null, '<rect width="240" height="320" fill="#f2efe8"/><line x1="20" y1="200" x2="220" y2="200" stroke="#141414"/><line x1="90" y1="40" x2="90" y2="290" stroke="#141414"/><line x1="90" y1="200" x2="200" y2="110" stroke="#c8361f" stroke-width="5"/><line x1="90" y1="200" x2="40" y2="90" stroke="#1d3c78" stroke-width="5"/><text x="120" y="272" text-anchor="middle" font-family="serif" font-size="30" fill="#141414" letter-spacing="8">本徵</text>', 240, 320),
(50, '理化模擬試題', '試題本與詳解本　LaTeX', '每回 50 題，版面照著會考題本排，每個選項都附上解析。', '/mock-exam/', '看看', null, '<rect width="300" height="300" fill="#f2efe8"/><rect x="64" y="40" width="172" height="220" fill="#fff" stroke="#141414"/><g stroke="#bdbab2"><line x1="84" y1="70" x2="216" y2="70"/><line x1="84" y1="86" x2="196" y2="86"/><line x1="84" y1="102" x2="210" y2="102"/></g><path d="M100 220 L150 140 L200 220 Z" fill="none" stroke="#1d3c78" stroke-width="1.6"/><line x1="64" y1="196" x2="150" y2="186" stroke="#c8361f" stroke-width="1.6"/><line x1="150" y1="186" x2="236" y2="232" stroke="#d9a521" stroke-width="1.6"/>', 300, 300),
(60, '國小數學簡報', '簡報　PowerPoint', '一套簡報就能對照康軒、南一、翰林三個版本，用 Morph 轉場帶出課程地圖。', null, '課堂使用中', null, '<rect width="300" height="300" fill="#f2efe8"/><rect x="96" y="64" width="160" height="100" fill="#d9a521"/><rect x="72" y="100" width="160" height="100" fill="#1d3c78"/><rect x="48" y="136" width="160" height="100" fill="#141414"/><text x="128" y="198" text-anchor="middle" font-family="serif" font-size="30" fill="#f2efe8">3.14</text>', 300, 300)
) as v(sort, title, medium, description, url, button, image_url, svg, width, height)
where not exists (select 1 from public.works);
