# --- LUMENAI INFERENCE SCRIPT (RUNNING TRAINED MODEL) ---
import os
import time
import math
import cv2
import numpy as np
import json
import random
import pickle
import csv
import pandas as pd
import matplotlib.pyplot as plt
from dataclasses import dataclass, field
from collections import deque, defaultdict
from scipy.spatial import KDTree
from typing import Dict, List, Optional
from ultralytics import YOLO
import paho.mqtt.client as mqtt
import yt_dlp

# ==========================================
# 0. CONFIGURATION
# ==========================================
TARGET_DURATION_MINUTES = 10

YOUTUBE_LIVE_URL = "https://www.youtube.com/live/9SLt3AT0rXk?si=_Xt5G_qiZoTrEOKS"

# 🔵 LOCAL SAVE PATHS (NO COLAB)
SAVE_DIR = r"D:\FINAL+PROJECT\backend\brightness_engine"
Q_PATH = r"D:\FINAL+PROJECT\backend\brightness_engine\qtables_final.pkl"
CSV_PATH = os.path.join(SAVE_DIR, "energy_trace_inference.csv")

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "smart_streetlights/commands/brightness"

# Calibration
CALIB_LAMPS = [(350, 480), (500, 320), (580, 260), (650, 230)]
TARGET = {0: "person", 1: "bicycle", 2: "car", 3: "motorbike", 5: "bus", 7: "truck"}

# ==========================================
# 1. HOMOGRAPHY
# ==========================================
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

SRC_POINTS = np.float32([
    [200, 540],
    [860, 540],
    [620, 200],
    [380, 200]
])

DST_POINTS = np.float32([
    [0, 0],
    [15, 0],
    [15, 100],
    [0, 100]
])

H_MATRIX = cv2.getPerspectiveTransform(SRC_POINTS, DST_POINTS)

def pix_to_world(x, y):
    point = np.array([[[x, y]]], dtype='float32')
    warped_point = cv2.perspectiveTransform(point, H_MATRIX)
    return warped_point[0][0][0], warped_point[0][0][1]

# ==========================================
# 2. PHYSICS & AI
# ==========================================
class KalmanTracker:
    def __init__(self, init_x, init_y, dt=1.0/15.0):
        self.kf = cv2.KalmanFilter(4, 2)
        self.kf.measurementMatrix = np.array([[1, 0, 0, 0],
                                              [0, 1, 0, 0]], np.float32)
        self.kf.transitionMatrix = np.array([[1, 0, dt, 0],
                                             [0, 1, 0, dt],
                                             [0, 0, 1, 0],
                                             [0, 0, 0, 1]], np.float32)
        # Process Noise Covariance (Q) - Trust model (smoothness) vs reaction speed
        self.kf.processNoiseCov = np.eye(4, dtype=np.float32) * 0.03
        # Measurement Noise Covariance (R) - Trust measurement
        self.kf.measurementNoiseCov = np.eye(2, dtype=np.float32) * 0.5
        
        # Initialize state
        self.kf.statePre = np.array([[init_x], [init_y], [0], [0]], np.float32)
        self.kf.statePost = np.array([[init_x], [init_y], [0], [0]], np.float32)
        self.last_update_time = time.time()

    def predict(self):
        return self.kf.predict()

    def update(self, x, y):
        measurement = np.array([[np.float32(x)], [np.float32(y)]])
        self.kf.correct(measurement)
        self.last_update_time = time.time()

    def get_state(self):
        return (self.kf.statePost[0].item(), self.kf.statePost[1].item(), 
                self.kf.statePost[2].item(), self.kf.statePost[3].item())
@dataclass
class ObjectTrack:
    obj_id: int; cls: str; x: float; y: float; vx: float; vy: float
    conf: float = 1.0; headlights: bool = False; ts: float = field(default_factory=time.time)

@dataclass
class Lamp:
    lamp_id: str; x: float; y: float; brightness: float = 70.0
    last_cmd_ts: float = 0.0
    on_since: Optional[float] = None; off_since: Optional[float] = None

class QAgent:
    def __init__(self, trained_q_table=None):
        self.actions = [-5, 0, 5]
        if trained_q_table:
            self.Q = defaultdict(lambda: np.zeros(len(self.actions)), trained_q_table)
        else:
            self.Q = defaultdict(lambda: np.zeros(len(self.actions)))
        self.eps = 0.0

    def get_q(self, s): return self.Q[s]
    def act(self, s): return int(np.argmax(self.Q[s]))

class BrightnessEngine:
    def __init__(self, lamps, brain_data=None):
        self.lamps = {l.lamp_id: l for l in lamps}
        self._xy = np.array([[l.x, l.y] for l in lamps])
        self._tree = KDTree(self._xy)

        self.agents = {
            lid: QAgent(brain_data.get(lid) if brain_data else None)
            for lid in self.lamps
        }

        self.base_min, self.base_max, self.b_max = 70.0, 100.0, 100.0
        self.s_max, self.gamma, self.rate_limit = 3.0, 0.6, (self.base_max - self.base_min) * 0.25

        self.class_w = {"person":1.0, "bicycle":0.85, "car":0.75, "motorbike":0.75, "bus":0.7, "truck":0.7}
        self.range_m = {"person":32.0, "bicycle":36.0, "car":80.0, "motorbike":70.0, "bus":85.0, "truck":85.0}
        self.alpha   = {"person":0.6, "bicycle":0.7, "car":0.9, "motorbike":0.9, "bus":0.9, "truck":0.9}
        self.vmax    = {"person":2.5, "bicycle":8.0, "car":25.0, "motorbike":22.0, "bus":20.0, "truck":20.0}
        self.tau     = {"person":0.6, "bicycle":0.8, "car":1.4, "motorbike":1.2, "bus":1.6, "truck":1.6}
        self.min_on  = {"person":8.0, "bicycle":6.0, "car":3.0, "motorbike":3.0, "bus":3.5, "truck":3.5}
        self.min_off = {"person":5.0, "bicycle":4.0, "car":2.0, "motorbike":2.0, "bus":2.0, "truck":2.0}

        self.last_actions = {lid: 1 for lid in self.lamps}
        self.last_ts = {lid: 0.0 for lid in self.lamps}

    def decay(self, d, R): return math.exp(-max(d,0)/max(R,1e-6))

    def _predict_xy(self, o):
        c = o.cls if o.cls in self.tau else "car"
        px = o.x + o.vx * self.tau.get(c, 1.4)
        py = o.y + o.vy * self.tau.get(c, 1.4)
        return px, py, c, self.range_m.get(c, 50.0)

    def _contrib_from_pred(self, o, lamp_xy, c):
        px, py, _, R = self._predict_xy(o)
        w = self.class_w.get(c, 0.75)
        d = math.hypot(px - lamp_xy[0], py - lamp_xy[1])
        h = 1 + self.alpha.get(c, 0.8) * (math.hypot(o.vx, o.vy) / max(self.vmax.get(c, 10.0), 1e-3))
        p = 1.1 if o.headlights else 1.0
        return w * self.decay(d, R) * h * p

    def _apply_dwell(self, lamp, t, c, now):
        c = c or "car"
        if lamp.on_since and (now - lamp.on_since < self.min_on.get(c,4.0)) and t < lamp.brightness:
            t = lamp.brightness
        if lamp.off_since and (now - lamp.off_since < self.min_off.get(c,4.0)) and t > lamp.brightness:
            t = lamp.brightness
        return t

    def _smooth(self, lamp, target, now):
        dt = max(now - lamp.last_cmd_ts, 1e-3)
        delta = target - lamp.brightness
        max_delta = self.rate_limit * dt
        if abs(delta) > max_delta:
            target = lamp.brightness + math.copysign(max_delta, delta)
        if target > lamp.brightness: lamp.on_since = lamp.on_since or now; lamp.off_since = None
        elif target < lamp.brightness: lamp.off_since = lamp.off_since or now; lamp.on_since = None
        return target

    def _get_state(self, norm, f_amb, lamp, cls):
        return (
            0 if norm<=0 else 1 if norm<=0.33 else 2 if norm<=0.66 else 3,
            0 if f_amb<0.33 else 1 if f_amb<0.66 else 2,
            int(lamp.on_since is not None) - int(lamp.off_since is not None),
            1 if cls == "person" else 2 if cls in ["car","bus","truck","motorbike","bicycle"] else 0
        )

    def update(self, tracks, f_amb, now):
        cmds = {}
        base = self.base_min + f_amb * (self.base_max - self.base_min)
        scores = np.zeros(len(self.lamps))
        best_cls = [None]*len(self.lamps)
        best_score_val = np.zeros(len(self.lamps))

        for t in tracks:
            px, py, c, Rc = self._predict_xy(t)
            dists, idxs = self._tree.query([px, py], k=len(self.lamps))
            if np.isscalar(idxs): idxs=[idxs]; dists=[dists]
            for i, di in zip(idxs, dists):
                if di > Rc: continue
                s = self._contrib_from_pred(t, self._xy[i], c)
                scores[i] += s
                if s > best_score_val[i]:
                    best_score_val[i] = s
                    best_cls[i] = c

        for i, lid in enumerate(self.lamps):
            lamp = self.lamps[lid]
            norm = min(scores[i]/self.s_max, 1.0)
            T_nom = base + (self.base_max - base) * (norm ** self.gamma)

            s_tup = self._get_state(norm, f_amb, lamp, best_cls[i])
            agent = self.agents[lid]
            a = agent.act(s_tup)

            T_rl = T_nom + 5.0 * (a - 1)
            T_rl = self._apply_dwell(lamp, T_rl, best_cls[i], now)
            T_rl = self._smooth(lamp, T_rl, now)
            T_rl = float(np.clip(T_rl, self.base_min, self.base_max))

            self.last_actions[lid] = a
            self.last_ts[lid] = now
            lamp.brightness = T_rl
            lamp.last_cmd_ts = now
            cmds[lid] = round(T_rl, 1)

        return cmds

# --- HELPERS ---
def est_headlights(f, x1, y1, x2, y2):
    h, w = f.shape[:2]
    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
    xa, xb = max(0, int(0.35*(x2-x1))+x1), min(w, int(0.65*(x2-x1))+x1)
    ya, yb = max(0, int(0.65*(y2-y1))+y1), min(h, y2)
    if xa>=xb or ya>=yb: return False
    roi = f[ya:yb, xa:xb]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    return (float((cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(gray) > 220).sum()) / (gray.size+1e-9)) > 0.02

class AmbientEstimator:
    def __init__(self):
        self.v_ema = None
        self.window = deque(maxlen=120)
    def compute(self, f):
        v = float(np.median(cv2.cvtColor(f, cv2.COLOR_BGR2HSV)[..., 2]))
        self.v_ema = v if self.v_ema is None else (0.2 * v + 0.8 * self.v_ema)
        self.window.append(self.v_ema)
        if len(self.window) < 10: return 0.5
        vals = np.array(self.window)
        lo, hi = np.percentile(vals, 10), np.percentile(vals, 90)
        return float(np.clip((self.v_ema - lo) / ((hi - lo) + 1.0), 0.0, 1.0))

class MetricsLogger:
    def __init__(self, filepath):
        self.filepath = filepath
        with open(self.filepath, 'w', newline='') as f:
            csv.writer(f).writerow(["Frame", "Sim_Time", "Active_Watts", "Base100_Watts", "Base70_Watts", "Savings_vs_100", "Savings_vs_70"])
    def log(self, frame, sim_t, n_lamps, cmds):
        p_active = sum(cmds.values())
        p_100 = n_lamps * 100.0
        p_70 = n_lamps * 70.0
        sav100 = ((p_100 - p_active)/p_100)*100 if p_100>0 else 0
        sav70 = ((p_70 - p_active)/p_70)*100 if p_70>0 else 0
        with open(self.filepath, 'a', newline='') as f:
            csv.writer(f).writerow([frame, round(sim_t,2), round(p_active,1), p_100, p_70, round(sav100,1), round(sav70,1)])

# ==========================================
# 3. MAIN EXECUTION
# ==========================================
def main():
    print(f"\n🚀 STARTING {TARGET_DURATION_MINUTES} MIN INFERENCE RUN")
    print(f"📡 MQTT: {MQTT_BROKER} -> {MQTT_TOPIC}")
    print(f"🌐 Live URL: {YOUTUBE_LIVE_URL}")

    brain_data = None
    if os.path.exists(Q_PATH):
        print(f"🧠 Loading Q-Table from: {Q_PATH}")
        with open(Q_PATH, "rb") as f:
            brain_data = pickle.load(f)
        print("✅ Brain Loaded successfully.")
    else:
        print(f"⚠️ WARNING: {Q_PATH} not found! Running with empty brain.")

    try:
        mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "LumenAI_Inference")
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_start()
        print("✅ MQTT Connected!")
    except Exception as e:
        print(f"⚠️ MQTT Failed: {e}")
        mqtt_client = None

    model = YOLO("yolov8n.pt")
    lamps = [Lamp(f"L{i+1}", *pix_to_world(*p)) for i,p in enumerate(CALIB_LAMPS)]

    engine = BrightnessEngine(lamps, brain_data)
    amb_sensor = AmbientEstimator()
    logger = MetricsLogger(CSV_PATH)

    prev_tracks = {}
    frames = 0
    sim_time = 0.0
    SIM_DT = 1.0 / 15.0

    start_time = time.time()
    end_time = start_time + (TARGET_DURATION_MINUTES * 60)

    # --- STREAM SETUP USING yt-dlp ---
    ydl_opts = {'format': 'best', 'quiet': True, 'no_warnings': True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(YOUTUBE_LIVE_URL, download=False)
            stream_url = info.get('url') or info.get('formats', [{}])[-1].get('url')
            if not stream_url:
                print("❌ yt-dlp gave no URL, fallback used.")
                stream_url = YOUTUBE_LIVE_URL
    except Exception as e:
        print(f"❌ yt-dlp error: {e}")
        stream_url = YOUTUBE_LIVE_URL

    print("📥 Opening stream...")
    cap = cv2.VideoCapture(stream_url)


    if not cap.isOpened():
        print("❌ Cannot open livestream.")
        return

    # --- MAIN LOOP ---
    # Frame skipping configuration
    FRAME_SKIP = 3  # Process 1 out of every 3 frames

    while time.time() < end_time and cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.2)
            continue

        frames += 1
        
        # Skip frames to reduce load
        if frames % FRAME_SKIP != 0:
            continue

        frame = cv2.resize(frame, (960, 540))
        sim_time += SIM_DT
        f_amb = amb_sensor.compute(frame)

        res = model.track(frame, persist=True, verbose=False, classes=list(TARGET.keys()))
        tracks = []

        # Predict step for all existing trackers
        for tid in prev_tracks:
            prev_tracks[tid].predict()

        if res and res[0].boxes.id is not None:
            for box, tid, cid in zip(
                res[0].boxes.xyxy.cpu().numpy(),
                res[0].boxes.id.cpu().numpy().astype(int),
                res[0].boxes.cls.cpu().numpy()
            ):
                if int(cid) not in TARGET: continue
                x1, y1, x2, y2 = map(int, box)
                wx, wy = pix_to_world((x1+x2)/2, y2)

                if tid not in prev_tracks:
                    prev_tracks[tid] = KalmanTracker(wx, wy, SIM_DT)
                
                # Update step with measurement
                prev_tracks[tid].update(wx, wy)
                
                # Get smoothed state
                sx, sy, svx, svy = prev_tracks[tid].get_state()

                hl = (TARGET[int(cid)] in ["car","bus","truck"]) and est_headlights(frame, x1, y1, x2, y2)
                tracks.append(ObjectTrack(tid, TARGET[int(cid)], sx, sy, svx, svy, 1.0, hl, sim_time))

        # Remove old trackers
        current_real_time = time.time()
        for tid in list(prev_tracks.keys()):
            if current_real_time - prev_tracks[tid].last_update_time > 3.0:
                del prev_tracks[tid]

        cmds = engine.update(tracks, f_amb, sim_time)

        # --- METRICS CALCULATION ---
        n_lamps = len(lamps)
        p_active = sum(cmds.values())
        p_100 = n_lamps * 100.0
        p_70 = n_lamps * 70.0
        
        sav100 = ((p_100 - p_active)/p_100)*100 if p_100>0 else 0
        sav70 = ((p_70 - p_active)/p_70)*100 if p_70>0 else 0
        
        brightness_values = [l.brightness for l in lamps]
        
        # Count objects by type
        obj_counts = defaultdict(int)
        for t in tracks:
            obj_counts[t.cls] += 1
            
        # Prepare MQTT Payload
        payload = {
            "streetlights": [{"id": lid, "brightness": int(val)} for lid, val in cmds.items()],
            "metrics": {
                "active_power": round(p_active, 1),
                "baseline_100": p_100,
                "baseline_70": p_70,
                "savings_vs_100": round(sav100, 1),
                "savings_vs_70": round(sav70, 1),
                "brightness_dist": [round(b, 1) for b in brightness_values],
                "occupancy": len(tracks),
                "pedestrians": obj_counts["person"],
                "vehicles": sum(obj_counts[c] for c in ["car", "bus", "truck", "motorbike"]),
                "sim_time": round(sim_time, 2)
            }
        }

        if mqtt_client and frames % 5 == 0:
            # Publish simple commands for the simulation (restoring original behavior)
            mqtt_client.publish("smart_streetlights/commands/brightness", json.dumps(cmds))
            
            # Publish full metrics for the dashboard
            mqtt_client.publish("smart_streetlights/metrics", json.dumps(payload))

        logger.log(frames, sim_time, n_lamps, cmds)

        if frames % 100 == 0:
            remaining = int((end_time - time.time()) / 60)
            print(f"Running... Frame {frames} | Remaining: {remaining} mins | L1={cmds['L1']}%")

    cap.release()
    if mqtt_client: mqtt_client.loop_stop()
    print("\n✅ INFERENCE COMPLETE.")

if __name__ == "__main__":
    main()
