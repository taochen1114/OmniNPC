from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import os
from datetime import datetime
from pathlib import Path

load_dotenv()

elevenlabs = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)


def text_to_speech(input_text: str):
    if not input_text:
        raise ValueError("請傳入 text 才能進行 TTS")

    audio = elevenlabs.text_to_speech.convert(
        text=input_text,
        voice_id="9lHjugDhwqoxA5MhX0az",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
        language_code="zh",
        voice_settings={"speed": 1.0},  # speed 須介於 0.7 - 1.2
    )

    # 以時間戳命名，避免衝突（含微秒）
    # 寫入到 backend\audios\tts_outputs
    # ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    # backend_dir = Path(__file__).resolve().parents[1]
    # out_dir = backend_dir / "audios" / "tts_outputs"
    # out_dir.mkdir(parents=True, exist_ok=True)
    # out_path = out_dir / f"tts_{ts}.mp3"

    # # audio 可能是 bytes 或可迭代的 chunk stream，兩種都支援
    # with open(out_path, "wb") as f:
    #     if isinstance(audio, (bytes, bytearray)):
    #         f.write(audio)
    #     else:
    #         for chunk in audio:
    #             f.write(chunk)

    # 如果有裝 ffmpeg 的話，可以後端直接 play 然後聽聲音
    # ffplay from ffmpeg not found, necessary to play audio.
    # play(audio)

    return audio
