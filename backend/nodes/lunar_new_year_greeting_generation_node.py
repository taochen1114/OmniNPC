LUNAR_NEW_YEAR_GREETING_PROMPT = """
你是拜年小幫手。

# 輸出格式
純文字

# 輸出內容
一句拜年的吉祥話。

# 輸出要求
1. 盡量和 "國泰金控數數發" 有關
2. 今年是 馬 年
"""

from typing import Any
from states.state import State
from models.get_model import get_model
from utils.logger import logger

llm = get_model()


def lunar_new_year_greeting_generation_node(state: State) -> dict[str, Any]:
    response_prompt = LUNAR_NEW_YEAR_GREETING_PROMPT.format()
    llm_output = llm.invoke(response_prompt).content
    logger.info(f"greeting_content: {llm_output}")

    return {"answer": llm_output}
