from typing import List
from pydantic import BaseModel, ConfigDict, Json
from utils.session import ChatMessage, sessions


class RAGState(BaseModel):
    thread_id: str
    greeting_content: str


def build_rag_state(thread_id: str, user_input: str) -> RAGState:
    """
    從 session 中的 thread_id 讀出指定的 chat_memory，
    再搭配使用者此次的輸入，組成 RAGState 並回傳。
    """

    if not thread_id:
        raise ValueError("請傳入 thread_id")

    if not user_input:
        raise ValueError("請傳入 user_input")

    session = sessions[thread_id]

    state: RAGState = {
        "thread_id": thread_id,
        "greeting_content": "",
        # "messages": list(session.chat_memory),  # 複製一份 list
        # "query": user_input,
        # "retrieval_query": "",
        # "retrieved_context": [],
        # "answer": "",
        # "images": [],
        # "is_relevant": False,
        # "need_tts_simplify": False,
        # "summary": "",
    }

    return state
