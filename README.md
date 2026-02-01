# AI Camera Application 📸

A modern, premium AI-powered camera app with a smartphone-like experience. Built with Next.js, React, MediaPipe, TensorFlow.js, and optional Python FastAPI backend for advanced AI processing.

![AI Camera](https://img.shields.io/badge/AI-Powered-00d4aa)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🎥 Core Camera
- **Capture Photo** - High-quality image capture with filters
- **Record Video** - WebM/VP9 recording
- **Flip Camera** - Switch between front and back (user/environment)
- **Zoom** - 1x to 10x digital zoom
- **Grid Lines** - Rule of thirds overlay
- **Timer** - 3s, 5s, or 10s capture delay
- **Flash Control** - On / Off / Auto

### 📸 Camera Modes (Bottom Slider)
| Mode | Description |
|------|-------------|
| **Photo** | Standard photo capture |
| **Video** | Video recording |
| **Night** | Low-light optimized |
| **Portrait** | AI background blur (bokeh) |
| **108MP** | Ultra high-resolution capture |
| **Slo-Mo** | Slow motion video |
| **Panorama** | Panoramic capture mode |

### 🤖 AI Features
- **Background Blur** - Portrait effect via MediaPipe Selfie Segmentation
- **Face Detection** - Real-time face tracking + focus indicators
- **Scene Detection** - Night, Outdoor, Indoor (backend)
- **Auto Enhance** - Brightness + contrast adjustment
- **Filters** - Vintage, Cinematic, B&W, Warm, Cool

### 🎨 UI & Themes
- Light / Dark mode
- Camera skins: Minimal, iPhone Style, Samsung Style

### 📂 Gallery
- Save photos and videos locally (IndexedDB via Zustand persist)
- Last photo thumbnail preview
- Built-in gallery viewer with full-screen preview

### ⚙️ Extra
- Resolution: HD, Full HD, 4K, 108MP
- AI stabilization (setting)
- Voice command: "Take Photo", "Capture", "Cheese"

---

## 📁 Folder Structure

```
Camera/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page (dynamic camera load)
├── components/
│   ├── Camera/
│   │   ├── index.tsx        # Main camera component
│   │   ├── CameraView.tsx   # Video/canvas display
│   │   ├── CameraControls.tsx # Buttons, flash, timer
│   │   └── ModeSlider.tsx   # Bottom mode tabs
│   ├── Gallery/
│   │   └── index.tsx        # Gallery viewer
│   └── Settings/
│       └── index.tsx        # Settings panel
├── hooks/
│   ├── useFaceDetection.ts  # TensorFlow.js face detection
│   ├── useSelfieSegmentation.ts # MediaPipe portrait blur
│   └── useVoiceCommand.ts   # Web Speech API
├── lib/
│   ├── api.ts               # Backend API client (optional)
│   ├── canvas-utils.ts      # Image processing, thumbnails
│   ├── constants.ts         # Modes, filters, resolutions
│   ├── filters.ts           # Filter algorithms
│   ├── store.ts             # Zustand state
│   └── types.ts             # TypeScript types
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt     # Python dependencies
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ (for optional backend)
- **Webcam** or camera-enabled device
- **HTTPS** or **localhost** (required for camera access)

### 1. Clone & Install Frontend

```bash
cd Camera
npm install
```

### 2. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Allow camera access** when prompted.

### 3. (Optional) Python Backend for Enhanced AI

The frontend works standalone with in-browser AI (MediaPipe + TensorFlow.js). For server-side processing:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart the Next.js dev server. The app will use the backend for:
- `/api/enhance` - Auto enhance
- `/api/portrait-blur` - Server-side portrait blur
- `/api/face-detect` - Face detection
- `/api/scene-detect` - Scene detection
- `/api/filter` - Apply filters

---

## 🔧 AI Model Integration

### Frontend (Browser)

| Feature | Library | Notes |
|---------|---------|-------|
| Portrait Blur | `@mediapipe/selfie_segmentation` | Segments person from background |
| Face Detection | `@tensorflow-models/face-detection` | MediaPipe FaceDetector |
| Filters | Custom (canvas) | Vintage, B&W, etc. |
| Auto Enhance | Custom (ImageData) | CLAHE-like adjustment |

### Backend (Python)

| Feature | Library | Notes |
|---------|---------|-------|
| Portrait Blur | `mediapipe` | SelfieSegmentation |
| Face Detection | `mediapipe` | FaceDetection |
| Scene Detection | `opencv` + heuristics | Brightness, color analysis |
| Enhance | `opencv` | CLAHE on L channel |

---

## 📱 Make it Live & Install on Device

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:

- Deploy to **Vercel** or **Netlify** (free, HTTPS)
- **Install on phone**: Add to Home Screen (iOS/Android)
- **Install on desktop**: Chrome/Edge "Install app"

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Use HTTPS or localhost; check browser permissions |
| Face detection slow | Disable in Settings; uses TF.js WebGL |
| Portrait blur not loading | MediaPipe CDN; check network |
| Voice "Take Photo" | Requires microphone permission; Chrome/Edge |
| CORS errors with backend | Ensure `NEXT_PUBLIC_API_URL` matches backend origin |

---

## 📄 License

MIT
