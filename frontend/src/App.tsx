import { useState, useEffect } from 'react';
import { useMetrics } from './hooks/useMetrics';
import Icon from './components/Icon';
import './index.css';

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')} hrs`;
  return `${m}m`;
}

interface ToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

function Toast({ title, message, onClose }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.5rem',
      backgroundColor: 'white',
      border: '1px solid #D4C9A8',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ color: '#EF4444' }}>
        <Icon icon="lucide:alert-triangle" style={{ fontSize: '24px' }} />
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: '0.875rem', color: '#4B5563' }}>{message}</div>
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
      >
        <Icon icon="lucide:x" style={{ fontSize: '18px' }} />
      </button>
    </div>
  );
}

function App() {
  const { metrics, isConnected, acknowledgeWater } = useMetrics();
  const [showCamera, setShowCamera] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAlert, setActiveAlert] = useState<{ title: string, message: string } | null>(null);

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
      {/* Sidebar Navigation */}
      <aside className="slide-in">
        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-box">
              <Icon icon="lucide:eye" style={{ fontSize: '24px' }} />
            </div>
            <div>
              <span className="logo-text">Ucare</span>
              <p className="subtitle" style={{ fontSize: '0.75rem' }}>Eye Health Monitor</p>
            </div>
          </div>
        </div>

        <div className="status-indicator">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div className={`status-dot ${isConnected ? 'pulse-dot' : ''}`} style={{ backgroundColor: isConnected ? '#10B981' : '#EF4444' }}></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{isConnected ? 'Monitoring Active' : 'Connecting...'}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>
            Webcam feed is being analyzed locally. No data leaves your device.
          </p>
        </div>

        <nav>
          <a href="#" onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <Icon icon="lucide:layout-dashboard" />
            Dashboard
          </a>
          <a href="#" onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <Icon icon="lucide:settings" />
            Settings
          </a>
          <a href="#" onClick={() => setActiveTab('history')} className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}>
            <Icon icon="lucide:history" />
            History
          </a>
        </nav>

        <div className="water-status-widget">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hydration</span>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{Math.floor(metrics.last_water_intake / 60)}m ago</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.max(0, 100 - (metrics.last_water_intake / (45 * 60)) * 100)}%` }}
            ></div>
          </div>
          <button onClick={acknowledgeWater} className="btn-outline">
            <Icon icon="lucide:droplets" style={{ marginRight: '0.5rem' }} />
            I drank water
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main>
        <header className="main-header slide-in" style={{ animationDelay: '0.1s' }}>
          <div>
            <h2>Live Telemetry</h2>
            <p className="subtitle">Real-time eye strain monitoring</p>
          </div>

        </header>

        {/* Risk Level Card */}
        <section className="risk-card slide-in" style={{ animationDelay: '0.2s' }}>
          <div>
            <p className="metric-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Risk Level</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 800 }}>{metrics.risk_level}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: metrics.risk_level !== 'Low' ? '#F59E0B' : '#E5E7EB' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: metrics.risk_level === 'High' ? '#EF4444' : '#E5E7EB' }}></div>
              </div>
            </div>
            <p style={{ marginTop: '1rem', color: '#4B5563', maxWidth: '500px' }}>
              {metrics.risk_level === 'Low' && "Your eye health metrics are optimal. Keep maintaining good posture and blink regularly."}
              {metrics.risk_level === 'Medium' && "Your blink rate has decreased slightly. Consider taking a short break soon."}
              {metrics.risk_level === 'High' && "High eye strain detected. Please take a 20-second break and look at something distant."}
            </p>
          </div>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#FFFBEB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '2rem' }}>
            <div style={{ margin: 'auto' }}>
              <Icon icon={metrics.risk_level === 'Low' ? "lucide:check-circle" : "lucide:alert-circle"} />
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="metric-icon">
              <Icon icon="lucide:activity" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="metric-label">Blink Rate</p>
                <div className="metric-value-container">
                  <span className="metric-value">{metrics.bpm}</span>
                  <span className="metric-unit">BPM</span>
                </div>
              </div>
              <span className="badge badge-success">Normal</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1rem' }}>Target: 15-20 BPM</p>
          </div>

          <div className="metric-card slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="metric-icon">
              <Icon icon="lucide:ruler" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="metric-label">Screen Distance</p>
                <div className="metric-value-container">
                  <span className="metric-value">{Math.round(metrics.distance_cm)}</span>
                  <span className="metric-unit">cm</span>
                </div>
              </div>
              <span className="badge badge-success">Good</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1rem' }}>Recommended: 50-70 cm</p>
          </div>

          <div className="metric-card slide-in" style={{ animationDelay: '0.5s' }}>
            <div className="metric-icon">
              <Icon icon="lucide:clock" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="metric-label">Session Duration</p>
                <div className="metric-value-container">
                  <span className="metric-value">{formatDuration(metrics.session_duration_sec)}</span>
                </div>
              </div>
              <span className="badge badge-warning" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>2h 14m</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1rem' }}>Started at 9:23 AM</p>
          </div>
        </div>

        {/* Camera Feed Context */}
        <section className="slide-in" style={{ animationDelay: '0.6s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Live Camera Feed</h3>
              <p className="subtitle">Facial landmark visualization for eye tracking</p>
            </div>
            <button onClick={() => setShowCamera(!showCamera)} className="btn-secondary">
              <Icon icon={showCamera ? "lucide:eye-off" : "lucide:eye"} />
              {showCamera ? "Hide Camera" : "Show Camera"}
            </button>
          </div>

          {showCamera && (
            <div className="camera-container">
              <img
                src="http://localhost:8000/video_feed"
                alt="Webcam Feed"
                className="camera-feed"
              />
              <div className="camera-overlay">
                <div className="eye-tracking-guide"></div>
              </div>
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <div className="status-dot pulse-dot"></div>
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>Camera Active</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
