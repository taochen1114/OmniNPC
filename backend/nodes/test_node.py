TEST_PROMPT = """
你是拜年小幫手。

# 輸出格式
純文字

# 輸出內容
一句拜年的吉祥話。
"""

from typing import Any
from states.state import RAGState
from models.get_model import get_model
from utils.logger import logger

llm = get_model()


def test_node(state: RAGState) -> dict[str, Any]:
    response_prompt = TEST_PROMPT.format()
    llm_output = llm.invoke(response_prompt).content
    logger.info(f"greeting_content: {llm_output}")

    return {"greeting_content": llm_output}
