# from pathlib import Path
import os

# HOST = "0.0.0.0"
HOST = "127.0.0.1"
PORT = 9527
DEBUG = False
USE_LIP_TOOL = False
LOGGING_LEVEL = "INFO"

# LLM 設定
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPPORTED_MODELS = {
    "gpt-4.1",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5.1",
}
MODEL = "gpt-4.1"  # 當前採用的 llm 模型
# EMB_MODEL = "text-embedding-ada-002"
# TOP_K = 5  # 資料檢索時，要取前幾筆

# 路徑設定
# PRJT_ROOT = Path(__file__).resolve().parent.parent  # 設定專案根目錄
# VECTORDB_DIRECTORY = PRJT_ROOT / "office_data/vectordb_12_11"  # 設定 vectorDB 的路徑
