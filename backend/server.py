from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import load_model
import numpy as np
import io
from PIL import Image
import random

# preprocessing
from skimage.filters import threshold_otsu
from skimage.morphology import skeletonize, dilation, disk

app = FastAPI()

# Enable CORS so your Next.js front-end can fetch without errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust if your front-end runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load MNIST data once at startup
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Organize images by digit for quick sampling
digit_images = {i: [] for i in range(10)}
for img, label in zip(x_test, y_test):
    digit_images[int(label)].append(img)

# Load your trained model (ensure you have a model saved at 'mnist_model.h5')
try:
    model = load_model('mnist_model.h5')
except Exception as e:
    model = None
    print(f"Warning: could not load model: {e}")

@app.get("/random-image")
def random_image(digit: int):
    """
    Return a random MNIST image for the given digit (0-9) as a PNG.
    """
    if digit not in digit_images or not digit_images[digit]:
        raise HTTPException(status_code=404, detail="Digit not found")
    img_array = random.choice(digit_images[digit])  # shape (28,28), dtype uint8
    img = Image.fromarray(img_array)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Receive an image file, preprocess to MNIST style, and return the model's prediction.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert('L')  # grayscale
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # 1) Resize to 28x28
    img = img.resize((28, 28), resample=Image.Resampling.LANCZOS)

    # 2) Normalize to [0,1]
    arr = np.array(img, dtype=np.float32) / 255.0

    # 3) Binarize using Otsu threshold
    thresh = threshold_otsu(arr)
    bin_img = (arr > thresh).astype(np.float32)

    # 4) Skeletonize to ~1px backbone
    skel = skeletonize(bin_img > 0).astype(np.float32)

    # 5) Dilate back to uniform thin strokes (~2px)
    processed = dilation(skel, disk(1)).astype(np.float32)

    # 6) Invert if background is bright
    if processed.mean() > 0.5:
        processed = 1.0 - processed

    # 7) Prepare batch dimension and channel
    x = processed.reshape(1, 28, 28, 1)

    # 8) Predict
    preds = model.predict(x)
    pred_digit = int(np.argmax(preds, axis=1)[0])

    return {"prediction": pred_digit}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
