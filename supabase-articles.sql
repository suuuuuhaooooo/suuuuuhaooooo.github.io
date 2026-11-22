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
