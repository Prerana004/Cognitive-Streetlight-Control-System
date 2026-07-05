# LumenAI — Cognitive Streetlight Control System

> **A software-only smart city platform that transforms existing CCTV infrastructure into an intelligent, dual-purpose system for adaptive lighting and real-time safety monitoring**


Traditional streetlights waste energy by running at full brightness regardless of actual road usage. LumenAI turns existing CCTV cameras into virtual sensors, dynamically adjusting streetlight brightness based on real-time traffic density and automatically detecting accidents.

**Key results:**
1. **91% validation accuracy** on CNN-based incident classifier
2. **47ms average end-to-end inference latency** per frame
3. **~20–46% energy savings** vs. fixed-brightness baselines
4. **mAP 0.936** on object detection across 6 road-user classes
5. **<1000ms accident alert delivery** via MQTT

---

## System Architecture

The system is structured as a four-layer pipeline:

```
CCTV Feed (Live / File)
        │
        ▼
┌─────────────────────────────────────────┐
│         PERCEPTION LAYER                │
│  YOLOv8 Detection → ByteTrack Tracking  │
│  Kalman Filter (velocity) → Homography  │
│  (pixel → world coordinates)            │
│                    +                    │
│  CNN Accident Classifier (parallel)     │
└──────────────┬──────────────────────────┘
               │ ObjectTrack records
               ▼
┌─────────────────────────────────────────┐
│         CONTROL LAYER                   │
│  BrightnessEngine: physics-based model  │
│  (distance decay · velocity · class)    │
│  + Q-Learning agent per lamp            │
│  + Rate-limiting & dwell-time hysteresis│
└──────────────┬──────────────────────────┘
               │ Brightness commands + Alerts
               ▼
┌─────────────────────────────────────────┐
│         BROADCAST LAYER                 │
│  MQTT Publisher (brightness + alerts)   │
│  Flask REST API (health / config)       │
│  Server-Sent Events (real-time clients) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     VISUALIZATION LAYER                 │
│  Three.js 3D Digital Twin               │
│  Real-time dashboard (energy, FPS)      │
│  Accident alert feed + incident map     │
└─────────────────────────────────────────┘
```

---

## Screenshots

### Smart City Operations Dashboard
Real-time energy savings, occupancy tracking, and live alert feed.

<img width="1885" height="894" alt="Screenshot 2025-12-03 222749" src="https://github.com/user-attachments/assets/70dd74c1-806c-4e3c-a3fa-7947165a352d" />

### 3D Digital Twin
Streetlights updating brightness in real time, synchronized with live CCTV input via MQTT.

<img width="1868" height="856" alt="Screenshot 2025-12-03 222922" src="https://github.com/user-attachments/assets/a8c6b702-e5dd-4bab-8dc9-68a658f554d7" />


### Accident Detection
CNN classifier triggers high-confidence (99.7%) alert, delivered to dashboard and email within 1 second.

<img width="1839" height="875" alt="Screenshot 2025-12-03 223318" src="https://github.com/user-attachments/assets/68c0c5cc-ee86-4304-b704-1cc12fa8f69e" />

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Object Detection | YOLOv8n (Ultralytics) |
| Multi-Object Tracking | ByteTrack |
| Motion Estimation | OpenCV Kalman Filter |
| Spatial Mapping | Homography (cv2.getPerspectiveTransform) |
| Incident Classification | Custom CNN (TensorFlow/Keras) |
| Brightness Optimization | Q-Learning (custom RL agent) |
| Backend | Python, Flask, Paho-MQTT |
| Messaging | MQTT (HiveMQ), SSE |
| Frontend / Digital Twin | React, TypeScript, Three.js, Vite, Tailwind |
| Data Logging | CSV, Pandas |

---

## Performance Benchmarks

| Metric | Result |
|---|---|
| Object detection accuracy | mAP 0.936 |
| Incident classification accuracy | 91% validation accuracy |
| End-to-end inference latency | ~47ms per frame |
| Sustained frame rate | ≥10 FPS (CPU), 30+ FPS (GPU) |
| Accident alert delivery time | <1000ms via MQTT |
| Energy savings vs. 100% baseline | ~20–46% |
| Brightness update frequency | 5 Hz |

---

## Quickstart

### Prerequisites
- Python 3.10+
- Node.js 16+
- Model files (place in repo before running):
  - `backend/accident_detection/model.json`
  - `backend/accident_detection/model_weights.h5`
  - `backend/brightness_engine/yolov8n.pt`

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Prerana004/streetlight_brightness.git
cd streetlight_brightness

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# OR: .\.venv\Scripts\Activate.ps1   # Windows PowerShell

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Run accident detection server
cd backend/accident_detection
python app.py
```

In a separate terminal:

```bash
# Run brightness inference engine (publishes MQTT commands)
cd backend/brightness_engine
python inference.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to view the Digital Twin dashboard.

### Configuration

| Setting | File | Default |
|---|---|---|
| MQTT Broker | `inference.py` | `broker.hivemq.com:1883` |
| Video source | `inference.py` | YouTube live stream URL |
| Camera homography points | `inference.py` | `SRC_POINTS` / `DST_POINTS` arrays |
| Confidence threshold | `app.py` | 0.7 |

To use a local video file instead of a live stream, replace `YOUTUBE_LIVE_URL` in `inference.py` with a local file path.

---


Notes
- Backend Flask server exposes `:5000/video_feed`, `:5000/current_frame`, and `:5000/events`.
- Default MQTT broker is `broker.hivemq.com`; change broker in code if required.
- If the camera is not available, supply a video file in `backend/accident_detection` or pass a camera index.

