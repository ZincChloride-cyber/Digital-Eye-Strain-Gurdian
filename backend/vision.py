import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import math

base_options = python.BaseOptions(model_asset_path='face_landmarker.task')
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

# Constants for EAR
LEFT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
RIGHT_EYE_INDICES = [33, 160, 158, 133, 153, 144]

def get_distance(p1, p2, frame_w, frame_h):
    return math.hypot((p1.x - p2.x) * frame_w, (p1.y - p2.y) * frame_h)

def calculate_ear(landmarks, eye_indices, frame_w, frame_h):
    p1, p2, p3, p4, p5, p6 = [landmarks[i] for i in eye_indices]
    
    # Verticals
    v1 = get_distance(p2, p6, frame_w, frame_h)
    v2 = get_distance(p3, p5, frame_w, frame_h)
    
    # Horizontal
    h = get_distance(p1, p4, frame_w, frame_h)
    
    if h == 0:
        return 0
    return (v1 + v2) / (2.0 * h)

def estimate_distance(landmarks, frame_w, frame_h):
    # Inter-pupillary distance is roughly 63mm on average
    try:
        p_left = landmarks[468]
        p_right = landmarks[473]
    except IndexError:
        return 0
    pixel_dist = get_distance(p_left, p_right, frame_w, frame_h)
    
    if pixel_dist == 0:
        return 0
        
    F = 700 # Approx focal length
    W_real = 6.3 # iris distance in cm
    return (F * W_real) / pixel_dist

def process_frame(frame):
    h, w, _ = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    
    detection_result = detector.detect(mp_image)
    
    metrics = {
        "face_detected": False,
        "ear": 0.0,
        "distance_cm": 0.0
    }
    
    if detection_result.face_landmarks:
        landmarks = detection_result.face_landmarks[0]
        
        left_ear = calculate_ear(landmarks, LEFT_EYE_INDICES, w, h)
        right_ear = calculate_ear(landmarks, RIGHT_EYE_INDICES, w, h)
        avg_ear = (left_ear + right_ear) / 2.0
        
        dist_cm = estimate_distance(landmarks, w, h)
        
        metrics["face_detected"] = True
        metrics["ear"] = avg_ear
        metrics["distance_cm"] = dist_cm
        
    return metrics
