from typing import List
from pydantic import BaseModel, ConfigDict
from utils.session import ChatMessage, sessions


class State(BaseModel):
    """
    State of graph.

    欄位說明：
        thread_id:
            來自前端的 `pageId`，用於區分不同頁面或不同對話執行緒。
        messages:
            目前的對話紀錄（包含 system / user / assistant 等訊息），最多保留 11 筆（含第一筆 system prompt）。
        query:
            使用者本輪輸入的問題。
        answer:
            最終要回覆給使用者的文字答案。
    """

    """
    extra="forbid"
        - 用來控制「輸入資料裡出現模型未定義欄位」時的處理方式。
        - forbid：嚴格禁止多餘欄位。建立模型（Model(**data)）時只要多一個 key，就會丟出 ValidationError。
        -（對照）ignore：多的欄位直接忽略。
        -（對照）allow：多的欄位允許保留（會存在 model_extra 之類的結構中）。

    validate_assignment=True
        - 用來控制「模型建立後，對屬性重新賦值」時是否也要走驗證。
    """
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    thread_id: str
    messages: List[ChatMessage]
    query: str
    answer: str


def build_state(thread_id: str, user_input: str) -> State:
    """
    從 session 中的 thread_id 讀出指定的 chat_memory，
    再搭配使用者此次的輸入，組成 State 並回傳。
    """

    if not thread_id:
        raise ValueError("請傳入 thread_id")

    if not user_input:
        raise ValueError("請傳入 user_input")

    session = sessions[thread_id]

    state: State = {
        "thread_id": thread_id,
        "messages": list(session.chat_memory),  # 複製一份 list
        "query": user_input,
        "answer": "",
    }

    return state
