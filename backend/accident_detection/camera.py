"""
Accident Detection Camera Module
Enhanced with error handling, real-time streaming, and alert system
"""

import cv2
from detection import AccidentDetectionModel
import numpy as np
import os
import sys
import time
import json
import platform
from pathlib import Path

# Alert system imports
import smtplib
import ssl
from email.message import EmailMessage
try:
    import winsound  # Windows
    SOUND_AVAILABLE = True
except ImportError:
    try:
        import pygame  # Linux/Mac fallback
        pygame.mixer.init()
        SOUND_AVAILABLE = True
    except ImportError:
        SOUND_AVAILABLE = False
        print("Warning: Sound alerts not available. Install 'pygame' for audio support.")

class AccidentDetector:
    """Enhanced accident detection system with error handling and alerts"""
    
    def __init__(self, model_json="model.json", model_weights="model_weights.h5", 
                 video_source=None, threshold=90.0, email_config=None):
        """
        Initialize Accident Detector
        
        Args:
            model_json: Path to model architecture file
            model_weights: Path to model weights file
            video_source: Video file path or camera index (None = try camera 0, then look for video files)
            threshold: Confidence threshold for alerts (0-100)
            email_config: Dictionary containing email settings (server, port, user, password, etc.)
        """
        self.threshold = threshold
        self.last_alert_time = 0
        self.alert_cooldown = 2.0  # Minimum seconds between sound alerts
        
        # Email Alert Configuration
        self.email_config = email_config
        self.last_email_time = 0
        self.email_cooldown = 60.0  # Minimum seconds between email alerts (1 minute)
        
        # Get base directory
        self.base_dir = Path(__file__).parent
        model_json_path = self.base_dir / model_json
        model_weights_path = self.base_dir / model_weights
        
        # Load model with error handling
        print("Loading accident detection model...")
        try:
            self.model = AccidentDetectionModel(str(model_json_path), str(model_weights_path))
            print("✓ Model loaded successfully")
        except FileNotFoundError as e:
            print(f"\nERROR: {e}")
            print("\nPlease run the training script first:")
            print("  python train_model.py")
            sys.exit(1)
        except Exception as e:
            print(f"\nERROR: Failed to load model: {e}")
            sys.exit(1)
        
        # Setup video source
        self.video_source = self._find_video_source(video_source)
        self.video_capture = None
        
        # Font for text overlay
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        
    def _find_video_source(self, video_source):
        """Find available video source"""
        if video_source is not None:
            if isinstance(video_source, str):
                if os.path.exists(video_source):
                    print(f"Using video file: {video_source}")
                    return video_source
                else:
                    print(f"Warning: Video file not found: {video_source}")
            else:
                # Camera index
                print(f"Using camera: {video_source}")
                return video_source
        
        # Try to find video files in current directory
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv']
        for ext in video_extensions:
            for video_file in self.base_dir.glob(f'*{ext}'):
                print(f"Found video file: {video_file}")
                return str(video_file)
        
        # Try camera 0
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, _ = cap.read()
            cap.release()
            if ret:
                print("Using default camera (index 0)")
                return 0
        
        # No source found
        print("\nWARNING: No video source found!")
        print("Please provide a video file or ensure a camera is connected.")
        print("Usage: python camera.py [video_file_path or camera_index]")
        return None
    
    def _send_email_alert(self, confidence):
        """Send email alert for detected accident"""
        if not self.email_config:
            return

        current_time = time.time()
        if current_time - self.last_email_time < self.email_cooldown:
            return

        print("\n[ALERT] Attempting to send email alert...")
        self.last_email_time = current_time

        try:
            msg = EmailMessage()
            msg.set_content(f"""
URGENT: Accident Detected!

Confidence: {confidence:.1f}%
Time: {time.strftime('%Y-%m-%d %H:%M:%S')}

Please check the live feed immediately.
            """)

            msg['Subject'] = f'CRITICAL: Accident Detected ({confidence:.1f}%)'
            msg['From'] = self.email_config.get('sender', self.email_config['username'])
            msg['To'] = self.email_config['username']  # Send to self/admin

            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.email_config['server'], self.email_config['port']) as server:
                if self.email_config.get('use_tls', True):
                    server.starttls(context=context)
                
                server.login(self.email_config['username'], self.email_config['password'])
                server.send_message(msg)
                
            print("[ALERT] Email sent successfully!")
            
        except Exception as e:
            print(f"[ERROR] Failed to send email alert: {e}")

    def _play_alert(self):
        """Play alert sound"""
        if not SOUND_AVAILABLE:
            return
        
        current_time = time.time()
        if current_time - self.last_alert_time < self.alert_cooldown:
            return  # Cooldown period
        
        self.last_alert_time = current_time
        
        try:
            if platform.system() == "Windows":
                # Windows beep
                winsound.Beep(1000, 500)  # Frequency 1000Hz, duration 500ms
            else:
                # Linux/Mac beep
                os.system('play -n synth 0.5 sine 1000 vol 0.5 2>/dev/null || echo -e "\a"')
        except Exception as e:
            print(f"Warning: Could not play alert sound: {e}")
    
    def _draw_overlay(self, frame, prediction, confidence):
        """Draw prediction overlay on frame"""
        # Draw background rectangle
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (400, 60), (0, 0, 0), -1)
        
        # Add alpha transparency
        alpha = 0.7
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
        
        # Draw text
        if prediction == "Accident":
            color = (0, 0, 255)  # Red for accident
            text = f"ACCIDENT DETECTED: {confidence:.1f}%"
            # Draw warning box
            cv2.rectangle(frame, (5, 5), (395, 55), (0, 0, 255), 2)
        else:
            color = (0, 255, 0)  # Green for no accident
            text = f"No Accident: {confidence:.1f}%"
        
        # Put text
        cv2.putText(frame, text, (15, 35), self.font, 0.8, color, 2)
        
        return frame
    
    def process_frame(self, frame):
        """
        Process a single frame for accident detection
        
        Args:
            frame: BGR image frame from OpenCV
        
        Returns:
            tuple: (processed_frame, prediction, confidence)
        """
        if frame is None:
            return None, None, None
        
        try:
            # Convert BGR to RGB and resize
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            roi = cv2.resize(rgb_frame, (250, 250))
            
            # Predict
            pred, prob = self.model.predict_accident(roi[np.newaxis, :, :])
            confidence = self.model.get_confidence(prob, class_index=0)
            
            # Draw overlay
            processed_frame = self._draw_overlay(frame.copy(), pred, confidence)
            
            # Trigger alert if accident detected above threshold
            if pred == "Accident" and confidence >= self.threshold:
                self._play_alert()
                self._send_email_alert(confidence)
            
            return processed_frame, pred, confidence
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return frame, None, None
    
    def start_detection_stream(self, announcer=None):
        """
        Start accident detection and yield frames for web streaming.
        """
        if self.video_source is None:
            print("ERROR: No video source available")
            return

        try:
            self.video_capture = cv2.VideoCapture(self.video_source)
            if not self.video_capture.isOpened():
                print(f"ERROR: Failed to open video source: {self.video_source}")
                return
        except Exception as e:
            print(f"ERROR: Failed to open video source: {e}")
            return

        print("\nStarting accident detection stream for web...")
        retry_count = 0
        max_retries = 5
        
        try:
            while True:
                ret, frame = self.video_capture.read()
                
                if not ret:
                    print(f"\nWarning: Failed to read frame. Retry {retry_count + 1}/{max_retries}")
                    retry_count += 1
                    if retry_count > max_retries:
                        print("Error: Max retries exceeded. Camera might be disconnected or busy.")
                        break
                    
                    # Release and re-open camera
                    self.video_capture.release()
                    time.sleep(2)
                    self.video_capture = cv2.VideoCapture(self.video_source)
                    continue
                
                # Reset retry count on successful read
                retry_count = 0

                processed_frame, prediction, confidence = self.process_frame(frame)
                if processed_frame is None:
                    continue

                # Announce the event to all listeners
                if announcer:
                    data = {
                        "prediction": prediction,
                        "confidence": float(confidence) # Convert numpy.float32 to standard float
                    }
                    announcer.announce(msg=json.dumps(data))

                # Encode frame as JPEG and yield it
                (flag, encodedImage) = cv2.imencode(".jpg", processed_frame)
                if flag:
                    yield encodedImage.tobytes()
                
                # Add a small delay to reduce CPU usage
                time.sleep(0.03) 
                
        except (GeneratorExit, ConnectionResetError):
            print("Client disconnected, stopping stream.")
        finally:
            print("Releasing camera resource.")
            if self.video_capture:
                self.video_capture.release()

    def start_detection(self):
        """Start accident detection from video source"""
        if self.video_source is None:
            print("ERROR: No video source available")
            return False
        
        # Open video source
        try:
            self.video_capture = cv2.VideoCapture(self.video_source)
            if not self.video_capture.isOpened():
                print(f"ERROR: Failed to open video source: {self.video_source}")
                return False
        except Exception as e:
            print(f"ERROR: Failed to open video source: {e}")
            return False
        
        print(f"\nStarting accident detection...")
        print(f"Press 'q' to quit")
        print(f"Alert threshold: {self.threshold}%")
        print("-" * 60)
        
        frame_count = 0
        start_time = time.time()
        
        try:
            while True:
                ret, frame = self.video_capture.read()
                
                if not ret:
                    print("\nEnd of video stream")
                    break
                
                # Process frame
                processed_frame, prediction, confidence = self.process_frame(frame)
                
                if processed_frame is None:
                    continue
                
                # Display frame
                cv2.imshow('Accident Detection', processed_frame)
                
                # Print status every 30 frames
                frame_count += 1
                if frame_count % 30 == 0:
                    if prediction:
                        elapsed = time.time() - start_time
                        fps = frame_count / elapsed if elapsed > 0 else 0
                        print(f"Frame {frame_count} | {prediction}: {confidence:.1f}% | FPS: {fps:.1f}")
                
                # Check for quit
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("\nStopped by user")
                    break
                    
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
        except Exception as e:
            print(f"\nERROR during processing: {e}")
            import traceback
            traceback.print_exc()
        finally:
            # Cleanup
            if self.video_capture:
                self.video_capture.release()
            cv2.destroyAllWindows()
            print("\nCleanup complete")
        
        return True
    
    def __del__(self):
        """Cleanup resources"""
        if self.video_capture:
            self.video_capture.release()
        cv2.destroyAllWindows()


def startapplication(video_source=None, threshold=90.0):
    """
    Start accident detection application
    
    Args:
        video_source: Video file path or camera index (None = auto-detect)
        threshold: Confidence threshold for alerts (0-100)
    """
    detector = AccidentDetector(video_source=video_source, threshold=threshold)
    detector.start_detection()


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Accident Detection System')
    parser.add_argument('--video', type=str, default=None, 
                       help='Video file path or camera index (default: auto-detect)')
    parser.add_argument('--threshold', type=float, default=90.0,
                       help='Confidence threshold for alerts (0-100, default: 90.0)')
    
    args = parser.parse_args()
    
    # Handle video source argument
    video_source = args.video
    if video_source is not None:
        # Try to parse as integer (camera index)
        try:
            video_source = int(video_source)
        except ValueError:
            # Keep as string (file path)
            pass
    
    startapplication(video_source=video_source, threshold=args.threshold)
