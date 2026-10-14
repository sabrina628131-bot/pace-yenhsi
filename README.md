# PACE 校園運動：我的 GPS 網站

這個倉庫是你自己的網站，是純靜態網頁，部署在 GitHub Pages，不需要後端，也不需要資料庫。運動紀錄只存在你的手機或電腦瀏覽器中。

## 開始使用

1. 在 Settings → Pages 找到你的網址，格式是 `https://你的帳號.github.io/倉庫名稱/`。
2. 用 VS Code 的 **Git: Clone** 把這個倉庫下載到電腦。
3. 在 Copilot Chat 輸入 `/explain-project`，認識檔案與流程。

## Copilot 指令

在 Copilot Chat 輸入下列指令（需要 VS Code 支援 prompt 檔案）：

| 指令 | 用途 |
| --- | --- |
| `/explain-project` | 用繁體中文認識專案檔案與資料流程 |
| `/preview-locally` | 在電腦啟動本機預覽，網址是 http://localhost:8000 |
| `/change-and-check` | 小步修改一個參數，並給出驗證步驟 |
| `/analyze-track` | 分析你匯出的軌跡 JSON，驗算距離、速度與熱量 |
| `/publish-changes` | 檢查變更、commit 並推送，讓網站自動更新 |

## 隱私

軌跡 JSON 與摘要 CSV 含有位置資料。請放在 `my-tracks/` 資料夾，不要推送到 GitHub，也不要公開分享。`.gitignore` 已經設定忽略這些檔案。

## 課程講義

完整的實作步驟、手機實測與實作紀錄表，請看課堂發下的《部署實作教學》。這個倉庫只放網站本身。
