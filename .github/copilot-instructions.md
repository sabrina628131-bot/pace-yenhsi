# PACE 校園運動：專案指引

這是一個純靜態網站（HTML、CSS、JavaScript），部署在 GitHub Pages。沒有後端，也沒有資料庫。

## 檔案地圖

- `index.html`：首頁，包含開始運動、運動紀錄、地圖與集合點。
- `app.js`：GPS 記錄流程、地圖、紀錄與匯出（摘要 CSV、軌跡 JSON）。
- `core.js`：距離（Haversine）、熱量（MET × 3.5 × 體重 ÷ 200 × 分鐘）與定位點過濾。
- `review.html`、`review.js`：匯入檢視。讀取使用者自己匯出的 JSON 與 CSV，只在瀏覽器中運作。
- `sw.js`：離線快取。資源路徑必須是相對路徑，因為網站可能部署在 `/倉庫名稱/` 子路徑下。
- `style.css`：樣式。
- `tiles.js`：底圖設定。

## 修改原則

- 用繁體中文回覆，並用繁體中文寫註解。
- 不要加入後端、資料庫，或需要金鑰的服務。
- 不要用以 `/` 開頭的絕對路徑載入檔案。
- 只要修改了 `public` 來源中的檔案，就把 `sw.js` 的 `CACHE` 版本號加一，讓瀏覽器更新快取。
- 不要把學生的 GPS 軌跡（JSON）、摘要（CSV）或任何個人資料放進倉庫。`.gitignore` 已忽略 `my-tracks/` 與相關檔名。
- 小步修改：一次只改一件事，改完說明改了哪些檔案、哪一行，以及如何在本機驗證。

## 本機預覽

在專案根目錄執行 `python3 -m http.server 8000`（Windows 用 `py -3 -m http.server 8000`），再開啟 `http://localhost:8000`。
