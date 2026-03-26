import time
from typing import Optional
from plyer import notification

EAR_THRESHOLD = 0.20
BLINK_FRAMES = 2

DISTANCE_THRESHOLD_CM = 45
BREAK_INTERVAL_SEC = 20 * 60
WATER_INTERVAL_SEC = 45 * 60 # Default to 45 minutes

class StrainMonitor:
    def __init__(self):
        self.session_start = time.time()
        
        self.blink_count = 0
        self.consecutive_close_frames = 0
        self.last_blink_time = time.time()
        self.blinks_per_minute = 0
        
        self.too_close_start = None
        self.last_distance_alert = 0
        
        self.last_break_alert = 0
        
        self.last_water_intake = time.time()
        self.last_water_alert = 0
        
        self.risk_level = "Low"
        self.current_alert: Optional[dict[str, str]] = None
        
    def check_blink(self, ear):
        if ear < EAR_THRESHOLD:
            self.consecutive_close_frames += 1
        else:
            if self.consecutive_close_frames >= BLINK_FRAMES:
                self.blink_count += 1
                self.last_blink_time = time.time()
            self.consecutive_close_frames = 0
            
    def update(self, metrics):
        now = time.time()
        session_duration = now - self.session_start
        self.current_alert = None
        
        if metrics.get("face_detected"):
            self.check_blink(metrics["ear"])
            
            dist = metrics["distance_cm"]
            if dist > 0 and dist < DISTANCE_THRESHOLD_CM:
                if self.too_close_start is None:
                    self.too_close_start = now
                elif now - self.too_close_start > 5:
                    if now - self.last_distance_alert > 60:
                        self.trigger_alert("Too Close!", "You are sitting too close to the screen.")
                        self.last_distance_alert = now
            else:
                self.too_close_start = None
        
        elapsed_min = max((now - self.session_start) / 60.0, 1.0)
        self.blinks_per_minute = self.blink_count / elapsed_min
        
        if session_duration > BREAK_INTERVAL_SEC:
            if now - self.last_break_alert > 5 * 60:
                self.trigger_alert("Take a break!", "Follow the 20-20-20 rule. Look away 20 feet for 20 seconds.")
                self.last_break_alert = now
        
        # Water reminder
        if now - self.last_water_intake > WATER_INTERVAL_SEC:
            if now - self.last_water_alert > 5 * 60:
                self.trigger_alert("Stay Hydrated!", "It's time to drink some water.")
                self.last_water_alert = now
                
        if self.blinks_per_minute < 10 or (self.too_close_start and now - self.too_close_start > 60):
            self.risk_level = "High"
        elif self.blinks_per_minute < 15:
            self.risk_level = "Medium"
        else:
            self.risk_level = "Low"
            
        return {
            "session_duration_sec": int(session_duration),
            "blink_count": self.blink_count,
            "bpm": round(self.blinks_per_minute, 1),
            "distance_cm": round(metrics.get("distance_cm", 0), 1) if metrics.get("distance_cm") else 0,
            "risk_level": self.risk_level,
            "ear": round(metrics.get("ear", 0), 3),
            "alert": self.current_alert,
            "last_water_intake": int(now - self.last_water_intake)
        }
    
    def acknowledge_water(self):
        self.last_water_intake = time.time()
        self.last_water_alert = 0
        
    def trigger_alert(self, title, message):
        self.current_alert = {"title": title, "message": message}
        try:
            notification.notify(
                title=title,
                message=message,
                app_name="Ucare",
                timeout=5
            )
        except Exception as e:
            print(f"Alert failed: {e}")
