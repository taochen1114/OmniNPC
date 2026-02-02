from openai import OpenAI


class OpenAITools:
    def __init__(self):
        self.client = OpenAI()

    def text_to_speech(self, input_text: str, response_format: str = "wav"):
        if response_format not in ("wav", "mp3"):  # 依 API 支援格式自行調整
            response_format = "wav"
        audio_response = self.client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=input_text,
            speed=1.25,
            response_format=response_format,
        )
        return audio_response


openai_tools = OpenAITools()
