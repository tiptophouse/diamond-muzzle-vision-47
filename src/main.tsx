import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Ultra-minimal emergency app component
const EmergencyApp = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: 'white',
    padding: '2rem'
  }}>
    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>Diamond Muzzle</h1>
      <p style={{ marginBottom: '2rem', opacity: 0.9 }}>Loading your diamond management platform...</p>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          animation: 'shimmer 2s infinite'
        }}></div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  </div>
);

// Safe initialization with maximum error handling
async function safeInit() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Show emergency app immediately
    const root = createRoot(rootElement);
    root.render(<EmergencyApp />);

    // Try to load the real app after a short delay
    setTimeout(async () => {
      try {
        const { default: App } = await import('./App');
        root.render(
          <StrictMode>
            <App />
          </StrictMode>
        );
        console.log('✅ Full app loaded successfully');
      } catch (appError) {
        console.warn('⚠️ Full app failed to load, keeping emergency app', appError);
        // Keep the emergency app running
      }
    }, 100);

  } catch (error) {
    console.error('❌ Critical initialization error:', error);
    
    // Last resort fallback
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a1a1a; color: white; font-family: sans-serif; text-align: center; padding: 2rem;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem;">💎</div>
            <h1 style="margin-bottom: 1rem;">Diamond Muzzle</h1>
            <p style="margin-bottom: 2rem;">System temporarily unavailable</p>
            <button onclick="window.location.reload()" style="background: #4a90e2; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
              🔄 Reload
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Start immediately
safeInit();
