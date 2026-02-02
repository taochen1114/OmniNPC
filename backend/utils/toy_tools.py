import json
import os
import subprocess
from typing import Callable
from utils.logger import logger


def is_truthy(val) -> bool:
    """
    用途：將各種可能代表「是/否」的輸入（例如 LLM 回傳的 relevant 欄位）
    統一正規化成 Python 的布林值 True/False。

    支援的常見輸入：
    - bool：True/False
    - None：視為 False
    - 數字：非 0 視為 True，0 視為 False
    - 字串：可辨識 "yes" / "true" / "是" / "相關" 等為 True，
           可辨識 "no" / "false" / "否" / "不相關" 等為 False
    - 其他：轉成字串後判斷；無法辨識則保守回傳 False
    """
    if val is True:
        return True
    if val is False or val is None:
        return False
    if isinstance(val, (int, float)):
        return val != 0

    s = str(val).strip().lower()
    s = s.strip(".。!！?？")

    truthy = {"yes", "y", "true", "t", "1", "是", "對", "相關"}
    falsy = {"no", "n", "false", "f", "0", "否", "不", "不相關"}

    if s in falsy:
        return False

    return s in truthy


def exec_command(command):
    result = subprocess.run(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    if result.returncode != 0:
        raise Exception(result.stderr.decode())
    return result.stdout.decode()


def lip_sync_message(mp3_file_name):
    logger.info(f"語音轉唇型: {mp3_file_name}")
    exec_command(f"ffmpeg -y -i {mp3_file_name}.mp3 {mp3_file_name}.wav")
    exec_command(
        f"./bin/rhubarb -f json -o {mp3_file_name}.json {mp3_file_name}.wav -r phonetic"
    )


def get_default_lip():
    with open("./audios/default_lip.json", "r") as f:
        result = json.load(f)
    return result


def get_lip(
    use_rhubarb=False, mp3_file_name: str = None, write_file_func: Callable = None
):
    if use_rhubarb and mp3_file_name is not None and write_file_func is not None:
        directory = os.path.dirname(mp3_file_name)
        os.makedirs(directory, exist_ok=True)

        # 生成嘴形同步數據
        write_file_func(f"{mp3_file_name}.mp3")
        lip_sync_message(mp3_file_name)

        with open(f"{mp3_file_name}.json", "r") as f:
            result = json.load(f)
        return result

    else:
        with open("./audios/default_lip.json", "r") as f:
            result = json.load(f)
        return result
