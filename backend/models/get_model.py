from models.openai_model import get_openai
from utils.logger import logger
from utils.config import SUPPORTED_MODELS, MODEL


def get_model(model=MODEL):
    if model in SUPPORTED_MODELS:
        return get_openai()

    logger.error(
        f"Unsupported model: {model}. Supported models: {sorted(SUPPORTED_MODELS)}."
        f"If you want to use {model}, please update chatbot/utils/config.py (SUPPORTED_MODELS)."
    )
    return None
