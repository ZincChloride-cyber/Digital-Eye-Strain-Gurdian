import asyncio
import cv2
import json
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import threading

from vision import process_frame
from monitor import StrainMonitor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

monitor = StrainMonitor()
current_stats = {}
latest_frame = None

def camera_loop():
    global current_stats, latest_frame
    cap = cv2.VideoCapture(0)
    
    while True:
        success, frame = cap.read()
        if not success:
            time.sleep(0.1)
            continue
            
        metrics = process_frame(frame)
        current_stats = monitor.update(metrics)
        
        # Encode for streaming
        _, buffer = cv2.imencode('.jpg', frame)
        latest_frame = buffer.tobytes()
        
        time.sleep(0.03)

thread = threading.Thread(target=camera_loop, daemon=True)
thread.start()

def gen_frames():
    while True:
        if latest_frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
        time.sleep(0.05)

@app.get("/api/stats")
def get_stats():
    return current_stats

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(gen_frames(),
                             media_type='multipart/x-mixed-replace; boundary=frame')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps(current_stats))
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass
