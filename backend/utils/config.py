import os

# HOST = "0.0.0.0"
HOST = "127.0.0.1"
PORT = 5555
# DEBUG = True
DEBUG = False

# LLM 設定
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
EMB_MODEL = "text-embedding-ada-002"
API_KEY = os.getenv("OPENAI_API_KEY")
TOP_K = 5  # 資料檢索時，要取前幾筆
