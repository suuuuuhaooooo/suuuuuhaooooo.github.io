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
3. 打開 https://suuuuuhaooooo.github.io/admin.html ，用 Google 登入（展品在 admin-works.html）。
   - 會考模擬考後台的管理員（profiles.role = 'admin'）直接就能用。

## 之後要改什麼
- 展品（3D 展廳的作品、說明、圖片、順序）：後台 **admin-works.html**，存檔後重新整理首頁就會更新。
  資料庫讀不到時會用 `assets/works.js` 裡的預設六件。
- 參觀資訊、前言、暗房那句話：`index.html`。
- LINE、Supabase 設定：`assets/config.js`。

## 讓 Google 搜得到（網站裡已經做好的）
- 每頁都有標題、描述、正式網址（canonical）、分享預覽圖（og／twitter）、網站圖示。
- 首頁有品牌結構化資料（名稱、logo、服務、LINE／Threads／賣貨便）；每篇文章自動產生「文章」和「麵包屑」結構化資料。
- 首頁只有一個 h1（蘇昊數理｜數學・理化一對一家教），3D 展廳裡的作品另外有一份文字版給 Google 讀。
- sitemap.xml、robots.txt（擋掉後台）、自訂 404 頁。
- three.js 改成延後載入，首頁開得更快（速度也是排名因素）。

## 你要做的（照順序，做一次就好）
1. Search Console →「Sitemap」提交 `sitemap.xml`。
2. Search Console →「網址檢查」貼 `https://suuuuuhaooooo.github.io/` →「要求建立索引」；`articles.html` 也做一次。
3. 每發一篇新文章，就把那篇的網址也丟進「網址檢查」要求建立索引（Google 會比較快收錄）。
4. Bing Webmaster Tools 用「從 Google Search Console 匯入」一鍵加入（Bing、Yahoo、ChatGPT 搜尋、Copilot 都吃這邊的資料）。
5. 申請 Google 商家檔案（Google Business Profile），類別選「家教服務」，不想公開地址就設成「服務範圍」；網址填這個網站。搜「蘇昊數理」時右邊出現的資訊卡主要靠它。
6. 把網址放到所有你自己的地方：Threads 個人簡介、LINE 官方帳號主頁、賣貨便賣場介紹、講義與模擬考封底、數光島／見微理畫／模擬考網站的頁尾。別的網站連進來越多，排名越前面。
7. 固定寫專欄（例如兩週一篇）。新內容是讓 Google 常常回來看的最好理由。
