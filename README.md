# Ucare - Wellbeing You

Ucare is a privacy-focused, "set and forget" well-being application designed for power users. It monitors eye strain signals in real time using your webcam locally, providing subtle alerts and a clean, high-performance dashboard for health optimization.

## Key Features

- **Autonomous Monitoring**: Continuous, automatic eye tracking without manual controls (Pause/Stop removed for a seamless experience).
- **Computer Vision Intelligence**: Real-time blink rate analysis and screen distance estimation via local CPU-friendly processing.
- **Dynamic Risk Assessment**: Three levels of strain detection (Low/Medium/High) with tailored health advice.
- **Privacy-First Architecture**: Zero cloud processing; no images or data ever leave your machine.
- **Premium Metallic UI**: A high-impact dashboard optimized for dark-mode workstations.


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
