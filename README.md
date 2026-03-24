# Digital Eye Strain Guardian

An AI-powered, privacy-focused background monitoring system designed to prevent digital eye strain. It uses computer vision to track blink rates, screen distance, and continuous usage time, providing intelligent alerts based on optometric best practices like the 20-20-20 rule.

## Features

- Real-time Blink Detection: Monitors blink rate (Blinks Per Minute) via Eye Aspect Ratio (EAR) using MediaPipe FaceLandmarker.
- Screen Distance Estimation: Warns if you are sitting too close to the monitor (less than 45cm) for extended periods.
- Continuous Usage Alerts: Reminds you to take breaks after 20 minutes of continuous screen time.
- Integrated Dashboard: A modern, metallic-themed React dashboard providing live telemetry and trend charts.
- Dual Alert System: Provides both OS-level toast notifications and in-app "popout" alerts for immediate feedback.

## Tech Stack

### Backend
- Language: Python 3.10+ (Tested on 3.14)
- Core Libraries: MediaPipe (Tasks API), OpenCV, FastAPI, Uvicorn
- Notification Engine: Plyer

### Frontend
- Framework: React (TypeScript)
- Build Tool: Vite
- UI/UX: Vanilla CSS with a Metallic Dark Theme (#2C3A47, #C7D2D8)
- Icons: Lucide React
- Charts: Recharts

## Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js (v18 or higher)
- A webcam for computer vision tracking

### Backend Setup
1. Navigate to the backend directory.
2. Create and activate a virtual environment.
3. Install dependencies:
   pip install -r requirements.txt
4. Ensure the face_landmarker.task model file is present in the backend folder.
5. Start the server:
   uvicorn main:app --reload --port 8000

### Frontend Setup
1. Navigate to the frontend directory.
2. Install dependencies:
   npm install
3. Start the development server:
   npm run dev

## How it Works

The system runs a dedicated background thread that captures frames from your webcam. These frames are processed locally (no data is sent to the cloud) to determine facial landmarks. It calculates the vertical/horizontal distance of the eyelids to detect blinks and estimates distance based on inter-pupillary scale. Telemetry is streamed to the frontend via WebSockets and REST APIs for real-time visualization.

## Risk Level Definitions

- Low Risk: Blink rate is optimal (>15 BPM) and viewing distance is healthy.
- Medium Risk: Blink rate is slightly reduced (10-15 BPM).
- High Risk: Critical strain detected (Blink rate <10 BPM or distance violation > 60 seconds).
