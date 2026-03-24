import { useState, useEffect, useRef } from 'react';
import type { Metrics, ChartData } from '../types';

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    session_duration_sec: 0,
    blink_count: 0,
    bpm: 0,
    distance_cm: 0,
    risk_level: 'Low',
    ear: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState<ChartData[]>([]);
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket('ws://localhost:8000/ws');
      
      ws.current.onopen = () => setIsConnected(true);
      ws.current.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000); // Reconnect
      };
      ws.current.onerror = () => setIsConnected(false);
      
      ws.current.onmessage = (event) => {
        try {
          const data: Metrics = JSON.parse(event.data);
          setMetrics(data);
          
          setHistory(prev => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const newPoint = { time: timeStr, bpm: data.bpm, ear: data.ear };
            const newHistory = [...prev, newPoint];
            return newHistory.slice(-50); // Keep last 50 points
          });
        } catch (e) {
          console.error("Parse error", e);
        }
      };
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, []);

  return { metrics, isConnected, history };
}
