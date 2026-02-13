import time
import numpy as np
from PIL import Image
from io import BytesIO


class Model:
    def __init__(self):
        print("Loading model...")
        time.sleep(1)
        print("Model loaded.")

    def predict(self, image_bytes: bytes):
        # 模擬推論時間
        time.sleep(0.12)

        image = Image.open(BytesIO(image_bytes))
        arr = np.array(image)

        print(time.time())

        return {
            "width": arr.shape[1],
            "height": arr.shape[0],
            "mean_pixel": float(arr.mean()),
        }


model = Model()
