import { Eye, Clock, Ruler, ShieldAlert, Camera, CameraOff, Info, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { useMetrics } from './hooks/useMetrics';
import './index.css';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

interface ToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

function Toast({ title, message, onClose }: ToastProps) {
  return (
    <div className="toast-container">
      <div className="toast-icon">
        <AlertTriangle size={24} color="#ef4444" />
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
}

function App() {
  const { metrics, isConnected, history } = useMetrics();
  const [showCamera, setShowCamera] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    if (metrics.alert) {
      setActiveAlert(metrics.alert);
      const timer = setTimeout(() => setActiveAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [metrics.alert]);

  return (
    <div className="dashboard-container">
      {activeAlert && (
        <Toast 
          title={activeAlert.title} 
          message={activeAlert.message} 
          onClose={() => setActiveAlert(null)} 
        />
      )}

      <header className="header">
        <h1 className="header-title">
          <Eye size={32} color="#38bdf8" />
          Eye Strain Guardian
        </h1>
        <div className="header-actions">
          <button 
            className={`camera-toggle ${showCamera ? 'active' : ''}`}
            onClick={() => setShowCamera(!showCamera)}
            title={showCamera ? "Hide Camera" : "View Camera"}
          >
            {showCamera ? <CameraOff size={20} /> : <Camera size={20} />}
            <span>{showCamera ? "Hide Feed" : "View Feed"}</span>
          </button>
          <div className="status-badge">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            {isConnected ? 'Live Monitoring' : 'Connecting to background...'}
          </div>
        </div>
      </header>

      <div className="main-layout">
        <div className="stats-column">
          <div className="grid-cards">
            <div className="card">
              <div className="card-header">
                <Clock size={18} /> Session Time
              </div>
              <div className="card-value">
                {formatTime(metrics.session_duration_sec)}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <Eye size={18} /> Blink Rate
              </div>
              <div className="card-value">
                {metrics.bpm.toFixed(1)} <span className="card-unit">BPM</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <Ruler size={18} /> Screen Distance
              </div>
              <div className="card-value">
                {metrics.distance_cm.toFixed(1)} <span className="card-unit">cm</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <ShieldAlert size={18} /> Risk Level
              </div>
              <div className={`card-value risk-${metrics.risk_level}`}>
                {metrics.risk_level}
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h2 className="chart-header">Blink Rate Trend</h2>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bpm" 
                  stroke="#38bdf8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBpm)" 
                  name="Blinks per Minute" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {showCamera && (
          <div className="camera-section">
            <div className="card camera-card">
              <div className="card-header">
                <Camera size={18} /> Live Feed
              </div>
              <div className="video-container">
                <img 
                  src="http://localhost:8000/video_feed" 
                  alt="Webcam Feed" 
                  className="webcam-image"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="info-section">
        <h2 className="info-title">
          <Info size={24} color="#38bdf8" />
          Understanding Eye Strain Risk Levels
        </h2>
        <div className="info-grid">
          <div className="info-card risk-Low">
            <div className="info-card-header">
              <CheckCircle size={20} />
              <h3>Low Risk</h3>
            </div>
            <p>Blink rate is optimal (&gt;15 BPM) and viewing distance is healthy. Keep it up!</p>
          </div>
          <div className="info-card risk-Medium">
            <div className="info-card-header">
              <AlertTriangle size={20} />
              <h3>Medium Risk</h3>
            </div>
            <p>Blink rate is slightly reduced (10-15 BPM). Remember to blink consciously while working.</p>
          </div>
          <div className="info-card risk-High">
            <div className="info-card-header">
              <ShieldAlert size={20} />
              <h3>High Risk</h3>
            </div>
            <p>Critical strain: Blink rate is low (&lt;10 BPM) or sitting too close for over 60 seconds.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
