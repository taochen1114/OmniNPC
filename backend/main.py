from dotenv import load_dotenv

load_dotenv()

import base64
import time
import uvicorn
import json
import asyncio

from fastapi import (
    FastAPI,
    Request,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from graphs.graph import build_compiled_graph
from states.state import build_state
from utils.config import DEBUG, HOST, PORT
from utils.data_class import Response, Animation, FacialExpression
from utils.logger import logger
from utils.openai_tools import openai_tools
from utils.toy_tools import get_default_lip
from utils.session import (
    ChatSession,
    sessions,
    get_or_create_chat_session,
)
from utils.model import model


app = FastAPI()

ALLOWED_ORIGINS = [
    # "http://127.0.0.1",
    "http://127.0.0.1:9453",  # frontend port
    "http://127.0.0.1:9454",  # frontend port (在 local 端同時開多個前端時，會從 9453 往後遞增)
    "http://127.0.0.1:9455",  # frontend port
    "http://127.0.0.1:9456",  # frontend port
    "http://127.0.0.1:9457",  # frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 初始化 graph
graph = build_compiled_graph()


@app.api_route("/health", methods=["GET", "POST"])
async def health():
    health_status = {"status": "ok", "timestamp": time.time()}
    return JSONResponse(content=health_status, status_code=200)


@app.post("/on_page_create")
async def on_page_create(request: Request):
    data = await request.json()
    page_id = data.get("pageId")

    if not page_id:
        raise HTTPException(status_code=400, detail="Missing 'pageId'")

    if page_id not in sessions:
        sessions[page_id] = ChatSession()

    return JSONResponse(content={"success": True}, status_code=200)


@app.post("/on_page_remove")
async def on_page_remove(request: Request):
    data = await request.json()
    page_id = data.get("pageId")

    if not page_id:
        raise HTTPException(status_code=400, detail="Missing 'pageId'")

    if page_id in sessions:
        sessions.pop(page_id)

    return JSONResponse(content={"success": True}, status_code=200)


@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message")  # 使用者的輸入
    thread_id = data.get("pageId")  # 前端產生的 pageId

    session = get_or_create_chat_session(thread_id)

    logger.info(f"message: {message}")
    logger.info(f"thread_id: {thread_id}")

    # 把使用者傳進來的文字，記錄進對話歷史
    session.append_memory(role="user", content=message)

    state = build_state(thread_id, message)

    final_state = graph.invoke(
        state,
        {"recursion_limit": 10, "configurable": {"thread_id": thread_id}},
    )

    logger.info(f"-----> final_state: {final_state}")

    # 提取回應內容
    answer = final_state["answer"]

    response_dict = Response(
        text=answer,
        facialExpression=FacialExpression.smile,
        animation=Animation.Idle,
    ).model_dump()

    audio_response = None

    # RAG 調整階段，可以先註解起來，避免文字轉語音的 token fee 爆炸
    # 產生語音

    def generate_audio(input_text: str, max_retries: int = 3):
        """封裝 TTS 生成與重試邏輯，最多重試 max_retries 次"""

        _audio_response = None
        _audio_bytes = None

        for attempt in range(1, max_retries + 1):
            _audio_response = openai_tools.text_to_speech(input_text=input_text)
            _audio_bytes = _audio_response.read()

            if len(_audio_bytes) > 0:
                return _audio_response

            logger.warning(f"第 {attempt} 次 TTS 回傳空音檔，準備重新請求...")

        logger.warning(f"TTS 連續 {max_retries} 次回傳空音檔，回傳空內容。")
        return _audio_response

    audio_response = generate_audio(answer)
    response_dict["audio"] = base64.b64encode(audio_response.read()).decode("utf-8")

    response_dict["lipsync"] = get_default_lip()

    logger.warning("response_dict", response_dict)

    return JSONResponse(content={"messages": [response_dict]}, status_code=200)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    is_processing = False

    try:
        while True:
            frame = await websocket.receive_bytes()

            # 如果正在推論，直接丟棄這張
            if is_processing:
                continue

            is_processing = True

            # 用 thread 執行推論避免卡 event loop
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, model.predict, frame)

            await websocket.send_text(json.dumps(result))

            is_processing = False

    except WebSocketDisconnect:
        print("Client disconnected")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
    )
