# 後端套件安裝方式
1. 此專案的後端，是使用 uv 作為 python 的套件管理工具，**使用前要先全域安裝 `uv`**
   - 安裝方式可參考 [uv 官網](https://docs.astral.sh/uv/getting-started/installation/)
   - 專案創建時
     - uv 版本是使用 0.9.22
     - python 版本是使用 3.12
2. 路徑切換到 root/backend
3. `uv venv --python 3.12`
   - 創建 python 虛擬環境
   - 指定 python 為 3.12
4. 並使用 `uv sync --frozen` 安裝套件
   - 參數 `--frozen` 是為了避免自動更新既有套件


# 後端啟動方式
1. 路徑切換到 root/backend
2. 啟用 .venv
    ```md
    # macOS / Linux
    source .venv/bin/activate
    
    # Windows PowerShell
    .venv\Scripts\activate
    ```
   - 但不啟用好像也可以
3. 輸入 `uv run main.py`，即可運行後端程式碼
4. 關閉虛擬環境 => `deactivate`