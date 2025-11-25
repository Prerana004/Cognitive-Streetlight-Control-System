"""
Main Flask application to stream accident detection video to the frontend.
"""
from flask import Flask, Response, jsonify
from flask_cors import CORS
from camera import AccidentDetector
import json
import queue
import paho.mqtt.client as mqtt
import threading
import time

# A simple thread-safe message queue
class MessageAnnouncer:
    def __init__(self):
        self.listeners = []

    def listen(self):
        q = queue.Queue(maxsize=10)
        self.listeners.append(q)
        return q

    def announce(self, msg):
        # We go in reverse order to make sure we can remove listeners
        for i in reversed(range(len(self.listeners))):
            try:
                self.listeners[i].put_nowait(msg)
            except queue.Full:
                del self.listeners[i]

# Initialize the Flask app
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) to allow the React frontend
# (running on a different port) to connect to this server.
CORS(app)

# MQTT Configuration
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "smart_streetlights/metrics"

announcer = MessageAnnouncer()

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        # Relay the payload directly to the frontend
        announcer.announce(payload)
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def start_mqtt_client():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        print("MQTT Client Started")
    except Exception as e:
        print(f"Failed to start MQTT client: {e}")

# Start MQTT in a separate thread
mqtt_thread = threading.Thread(target=start_mqtt_client, daemon=True)
mqtt_thread.start()

# Global variables for video streaming
outputFrame = None
lock = threading.Lock()

def start_camera_thread():
    global outputFrame
    print("Initializing Global AccidentDetector...")
    
    while True:
        try:
            # Initialize the detector
            detector = AccidentDetector(video_source=0)
            print("Camera initialized. Starting detection stream...")
            
            # Iterate over the generator to get frames
            for frame_bytes in detector.start_detection_stream(announcer):
                with lock:
                    outputFrame = frame_bytes
                time.sleep(0.01) # Small sleep to prevent tight loop
            
            print("Stream ended unexpectedly. Restarting in 2 seconds...")
            time.sleep(2)
            
        except Exception as e:
            print(f"Camera thread error: {e}. Restarting in 2 seconds...")
            time.sleep(2)

# Start camera in a separate thread
camera_thread = threading.Thread(target=start_camera_thread, daemon=True)
camera_thread.start()

def generate_frames():
    """
    Generator function to stream frames from the global buffer.
    """
    global outputFrame, lock
    while True:
        with lock:
            if outputFrame is None:
                time.sleep(0.1)
                continue
            frame = outputFrame
        
        # Wrap raw JPEG bytes in multipart header
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + 
               frame + b'\r\n')
        
        # Limit frame rate for clients to avoid saturation
        time.sleep(0.03)

@app.route('/current_frame')
def current_frame():
    """Return the current frame as a JPEG image."""
    global outputFrame, lock
    with lock:
        if outputFrame is None:
            return "", 204
        return Response(outputFrame, mimetype='image/jpeg')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. The frontend will connect to this."""
    # print("Received request for /video_feed") # Commented out to reduce spam
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/events')
def listen():
    def stream():
        messages = announcer.listen()  # returns a queue.Queue
        while True:
            msg = messages.get()  # blocks until a new message arrives
            yield f"data: {msg}\n\n"
    return Response(stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    # Run the app on port 5000, accessible from any IP address.
    # threaded=True is important for handling concurrent requests.
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True, use_reloader=False)