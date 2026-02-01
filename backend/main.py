"""
AI Camera Backend - FastAPI server for advanced AI processing
Provides: Background blur, face detection, scene detection, auto enhance
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import io
import cv2
import numpy as np
from PIL import Image
from typing import Optional

app = FastAPI(title="AI Camera API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy load MediaPipe for face detection
_face_detection = None

def get_face_detection():
    global _face_detection
    if _face_detection is None:
        import mediapipe as mp
        _face_detection = mp.solutions.face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5
        )
    return _face_detection


def bytes_to_cv2(image_bytes: bytes) -> np.ndarray:
    """Convert image bytes to OpenCV format (BGR)"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def cv2_to_bytes(img: np.ndarray, format: str = "jpg", quality: int = 92) -> bytes:
    """Convert OpenCV image to bytes"""
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    _, buffer = cv2.imencode(f".{format}", img, encode_param)
    return buffer.tobytes()


def pil_to_cv2(pil_img: Image.Image) -> np.ndarray:
    """Convert PIL to OpenCV BGR"""
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def cv2_to_pil(cv2_img: np.ndarray) -> Image.Image:
    """Convert OpenCV BGR to PIL RGB"""
    return Image.fromarray(cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB))


@app.get("/health")
def health():
    return {"status": "ok", "message": "AI Camera API is running"}


@app.post("/api/enhance")
async def enhance_image(file: UploadFile = File(...)):
    """Auto enhance: brightness and contrast adjustment"""
    contents = await file.read()
    img = bytes_to_cv2(contents)
    if img is None:
        raise HTTPException(400, "Invalid image")

    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    return Response(
        content=cv2_to_bytes(enhanced),
        media_type="image/jpeg"
    )


@app.post("/api/portrait-blur")
async def portrait_blur(
    file: UploadFile = File(...),
    blur_strength: int = 10
):
    """
    AI Background Blur (Portrait mode)
    Uses MediaPipe Selfie Segmentation
    """
    try:
        import mediapipe as mp
    except ImportError:
        raise HTTPException(500, "MediaPipe not installed")

    contents = await file.read()
    img = bytes_to_cv2(contents)
    if img is None:
        raise HTTPException(400, "Invalid image")

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    with mp.solutions.selfie_segmentation.SelfieSegmentation(
        model_selection=1
    ) as segmenter:
        results = segmenter.process(rgb)
        mask = results.segmentation_mask

    mask_uint8 = (mask > 0.5).astype(np.uint8) * 255
    mask_3ch = cv2.merge([mask_uint8, mask_uint8, mask_uint8])

    blurred = cv2.GaussianBlur(img, (blur_strength * 2 + 1, blur_strength * 2 + 1), 0)
    foreground = cv2.bitwise_and(img, mask_3ch)
    background = cv2.bitwise_and(blurred, 255 - mask_3ch)
    result = cv2.add(foreground, background)

    return Response(
        content=cv2_to_bytes(result),
        media_type="image/jpeg"
    )


@app.post("/api/face-detect")
async def face_detect(file: UploadFile = File(...)):
    """Detect faces and return coordinates"""
    contents = await file.read()
    img = bytes_to_cv2(contents)
    if img is None:
        raise HTTPException(400, "Invalid image")

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    detection = get_face_detection()
    results = detection.process(rgb)

    faces = []
    if results.detections:
        h, w, _ = img.shape
        for det in results.detections:
            bb = det.location_data.relative_bounding_box
            faces.append({
                "x": int(bb.xmin * w),
                "y": int(bb.ymin * h),
                "width": int(bb.width * w),
                "height": int(bb.height * h),
                "confidence": det.score[0]
            })

    return {"faces": faces}


@app.post("/api/scene-detect")
async def scene_detect(file: UploadFile = File(...)):
    """
    Smart scene detection: Night, Outdoor, Indoor
    Uses simple heuristics (brightness, color distribution)
    """
    contents = await file.read()
    img = bytes_to_cv2(contents)
    if img is None:
        raise HTTPException(400, "Invalid image")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_brightness = np.mean(gray)
    std_brightness = np.std(gray)

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    green_ratio = np.sum((hsv[:, :, 0] > 35) & (hsv[:, :, 0] < 85)) / (img.shape[0] * img.shape[1])
    blue_ratio = np.sum(hsv[:, :, 0] > 100) / (img.shape[0] * img.shape[1])

    if mean_brightness < 60:
        scene = "night"
        confidence = 0.9
    elif green_ratio > 0.15:
        scene = "outdoor"
        confidence = 0.85
    elif mean_brightness < 120:
        scene = "indoor"
        confidence = 0.8
    else:
        scene = "outdoor" if blue_ratio > 0.1 else "indoor"
        confidence = 0.7

    return {
        "scene": scene,
        "confidence": confidence,
        "brightness": float(mean_brightness),
        "contrast": float(std_brightness)
    }


@app.post("/api/filter")
async def apply_filter(
    file: UploadFile = File(...),
    filter_type: str = "none"
):
    """Apply filter: vintage, cinematic, bw, warm, cool"""
    contents = await file.read()
    img = bytes_to_cv2(contents)
    if img is None:
        raise HTTPException(400, "Invalid image")

    if filter_type == "vintage":
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        sepia = np.array([[0.393, 0.769, 0.189],
                         [0.349, 0.686, 0.168],
                         [0.272, 0.534, 0.131]])
        img = np.clip(img @ sepia.T, 0, 255).astype(np.uint8)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    elif filter_type == "cinematic":
        img = cv2.convertScaleAbs(img, alpha=1.2, beta=-20)
    elif filter_type == "bw":
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif filter_type == "warm":
        img = cv2.convertScaleAbs(img, alpha=1.05, beta=5)
        img[:, :, 0] = np.clip(img[:, :, 0] * 0.95, 0, 255).astype(np.uint8)
    elif filter_type == "cool":
        img[:, :, 0] = np.clip(img[:, :, 0] * 1.08, 0, 255).astype(np.uint8)
        img[:, :, 2] = np.clip(img[:, :, 2] * 0.95, 0, 255).astype(np.uint8)

    return Response(
        content=cv2_to_bytes(img),
        media_type="image/jpeg"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
