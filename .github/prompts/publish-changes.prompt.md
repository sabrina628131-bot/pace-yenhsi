---
description: 檢查變更、commit 並推送到 main，讓 GitHub Pages 自動更新
mode: agent
---
請依下列步驟執行，每一步執行前先顯示指令：

1. 執行 `git status`，列出變更的檔案。如果出現 `my-tracks/` 或 `.json`、`.csv` 檔案，立即停止，並提醒我這些檔案不能推送。
2. 執行 `git diff`，用繁體中文摘要每個檔案的變更。
3. 用一行繁體中文寫出 commit 訊息，執行 `git add -A` 與 `git commit -m "訊息"`。
4. 執行 `git push origin main`。如果要求登入，停下來請我自己完成登入，不要替我輸入帳號或密碼。
5. 告訴我 1 到 3 分鐘後到 Settings → Pages 查看部署狀態，並給出網址。
