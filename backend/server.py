from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import load_model
from skimage.filters import threshold_otsu
from skimage.morphology import skeletonize, dilation, disk
import numpy as np
import io
from PIL import Image
import random


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load MNIST at startup
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Organize images by digit for quick sampling
digit_images = {i: [] for i in range(10)}
for img, label in zip(x_test, y_test):
    digit_images[int(label)].append(img)

# Checking if model is loaded properly from predict.py
try:
    model = load_model('mnist_model.h5')
except Exception as e:
    model = None
    print(f"Warning: could not load model: {e}")


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

    # Resize to 28x28
    img = img.resize((28, 28), resample=Image.Resampling.LANCZOS)

    # Normalize to [0,1]
    arr = np.array(img, dtype=np.float32) / 255.0

    # Binarize using Otsu threshold
    thresh = threshold_otsu(arr)
    bin_img = (arr > thresh).astype(np.float32)

    #Skeletonize to ~1px backbone
    skel = skeletonize(bin_img > 0).astype(np.float32)

    # Dilate back to uniform thin strokes (~2px)
    processed = dilation(skel, disk(1)).astype(np.float32)

    # Invert if background is bright
    if processed.mean() > 0.5:
        processed = 1.0 - processed

    # Prepare batch dimension and channel
    x = processed.reshape(1, 28, 28, 1)

    # Predict
    preds = model.predict(x)
    pred_digit = int(np.argmax(preds, axis=1)[0])

    return {"prediction": pred_digit}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
