from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import uuid
from utils.config import HOST, PORT, DEBUG
from graphs.rag_graph import build_compiled_graph
from states.state import build_rag_state
from utils.session import get_or_create_chat_session


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",  # frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_compiled_graph()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/test")
def test():
    random_uuid = str(uuid.uuid4())
    thread_id = random_uuid

    session = get_or_create_chat_session(thread_id)

    # 把使用者傳進來的文字，記錄進對話歷史
    # session.append_memory(role="user", content=message)

    state = build_rag_state(thread_id, "user_message")
    final_state = graph.invoke(
        state,
        {"recursion_limit": 10, "configurable": {"thread_id": thread_id}},
    )

    res = final_state["greeting_content"]

    return {"greeting_content": res}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
    )
