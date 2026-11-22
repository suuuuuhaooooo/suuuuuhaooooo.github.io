# 蘇昊數理 個人網站（新 repo：suuuuuhaooooo.github.io）

## 網址分工
| 網址 | 來自哪個 repo |
|---|---|
| https://suuuuuhaooooo.github.io/ | **這個新 repo**（展覽首頁、專欄、後台） |
| https://suuuuuhaooooo.github.io/-/ | 舊的 `-` repo，原封不動當舊站；classroom、profile、schedule、FAQ… 都照常可用 |
| /math-Illustration/ /science-Illustration/ /mock-exam/ | 各自的 repo，不受影響 |

## 上線步驟
1. GitHub 新建 repo，名稱一定要是 `suuuuuhaooooo.github.io`（Public）。
2. 把這個資料夾裡的東西全部上傳到根目錄（`supabase-articles.sql`、`README.md` 可以不傳）。
3. Settings → Pages → Source 選 `Deploy from a branch`、`main` / `(root)`。
4. 一兩分鐘後打開 https://suuuuuhaooooo.github.io/ 。

## 專欄後台（Supabase，跟會考模擬考同一個專案）
1. Supabase → SQL Editor，貼上 `supabase-articles.sql` 執行。
2. Supabase → Authentication → URL Configuration → Redirect URLs 加上
   `https://suuuuuhaooooo.github.io/admin.html`
3. 打開 https://suuuuuhaooooo.github.io/admin.html ，用 Google 登入。
   - 會考模擬考後台的管理員（profiles.role = 'admin'）直接就能用。

## 之後要改什麼
- 作品：`assets/exhibit.js` 最上面的 `WORKS`；截圖放 `assets/works/`。
- 參觀資訊、前言、暗房那句話：`index.html`。
- LINE、Supabase 設定：`assets/config.js`。

## 讓 Google 搜「蘇昊數理」找到這裡
1. 上線後到 Google Search Console 新增資源「網址前置字元」`https://suuuuuhaooooo.github.io/`
   （驗證用的 google98a6cadc678cdc89.html 已經放在根目錄，直接選「HTML 檔案」驗證）。
2. 提交 Sitemap：`sitemap.xml`。
3. 用「網址檢查」貼首頁網址 →「要求建立索引」。
4. 在舊站 `/-/index.html` 最上面加一個連到新首頁的連結（下面那行），舊站的排名會帶過來：
   `<a href="https://suuuuuhaooooo.github.io/">蘇昊數理 新版首頁</a>`
5. 在 Threads、LINE 官方帳號、賣貨便賣場的介紹欄都放這個網址。
