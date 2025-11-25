# Cognitive Streetlight Control System — Quick Start

Minimal instructions: what to install and how to run.

Prerequisites
- Python 3.10+ (Windows recommended) and Node.js (16+)
- Ensure these model files exist before running:
  - `backend/accident_detection/model.json`
  - `backend/accident_detection/model_weights.h5`
  - `backend/brightness_engine/yolov8n.pt`

Requirements
- Backend Python packages (install via `pip install -r backend/requirements.txt`):
  - `flask`, `flask-cors`, `paho-mqtt`, `opencv-python`, `numpy`, `tensorflow`, `ultralytics`, `yt-dlp`, `pandas`, `matplotlib`, `scipy`, `pygame` (optional)
- Frontend packages are defined in `frontend/package.json` and installed with `npm install`.

Backend (Python)
1. Create and activate a venv (PowerShell):

```powershell
cd D:\FINAL+PROJECT\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install --upgrade pip
pip install -r D:\FINAL+PROJECT\backend\requirements.txt
```

3. Run accident detection server:

```powershell
cd D:\FINAL+PROJECT\backend\accident_detection
python app.py
```

Optional: run brightness inference (publishes MQTT metrics/commands):

```powershell
cd D:\FINAL+PROJECT\backend\brightness_engine
python inference.py
```

Frontend (React / Vite)
1. Install and run:

```powershell
cd D:\FINAL+PROJECT\frontend
npm install
npm run dev
```

Notes
- Backend Flask server exposes `:5000/video_feed`, `:5000/current_frame`, and `:5000/events`.
- Default MQTT broker is `broker.hivemq.com`; change broker in code if required.
- If the camera is not available, supply a video file in `backend/accident_detection` or pass a camera index.

