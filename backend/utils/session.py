from typing import Dict, List, Literal, TypedDict
from prompts.prompt_store import DEFAULT_SYSTEM_PROMPT


Role = Literal["system", "user", "assistant"]


class ChatMessage(TypedDict):
    role: Role
    content: str


class ChatSession:
    def __init__(self):
        self.max_memory = 21
        # 開頭固定為 system message
        self.chat_memory: List[ChatMessage] = [
            {
                "role": "system",
                "content": DEFAULT_SYSTEM_PROMPT,
            }
        ]

    def append_memory(self, role: Role, content: str):
        valid_roles: List[Role] = ["system", "user", "assistant"]
        if role not in valid_roles:
            raise ValueError(f"Invalid role: {role}")

        if len(self.chat_memory) >= self.max_memory:
            self.chat_memory.pop(1)  # 始終保留第一則的 system message

        self.chat_memory.append({"role": role, "content": content})


sessions: Dict[str, ChatSession] = {}


def get_or_create_chat_session(thread_id: str) -> ChatSession:
    """
    如果第一次看到這個 thread_id，就建立一個新的 ChatSession() 放進 sessions
    """
    if thread_id not in sessions:
        sessions[thread_id] = ChatSession()
    return sessions[thread_id]
