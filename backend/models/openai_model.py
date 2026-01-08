from langchain_openai import ChatOpenAI
from utils.config import MODEL, API_KEY


def get_openai(model=MODEL, **kwargs):
    """
    獲取初始化的 ChatOpenAI 實例，支援自定義模型名稱和溫度。

    Args:
        model (str): 使用的模型名稱，預設為配置中的 MODEL。
        **kwargs: 額外的模型參數。

    Returns:
        ChatOpenAI: 初始化的模型實例。
    """
    llm = ChatOpenAI(model=model, api_key=API_KEY, **kwargs)  # 傳遞額外參數
    return llm
