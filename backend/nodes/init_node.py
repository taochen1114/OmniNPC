# import chromadb
# from utils.config import VECTORDB_DIRECTORY
from typing import Any
from states.state import State


# 1) 建立 Chroma client / 取得 collection
# 初始化 chromadb PersistentClient，確保讀取相同的 collection
# chroma_client = chromadb.PersistentClient(path=str(VECTORDB_DIRECTORY))
# collection = chroma_client.get_or_create_collection("faq_database")
# collection = chroma_client.get_or_create_collection("faq_ada_002_cosine")


def init_node(state: State) -> dict[str, Any]:
    return {}
