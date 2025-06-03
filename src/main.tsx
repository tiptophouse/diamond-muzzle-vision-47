
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced startup with better error handling
async function initializeApp() {
  try {
    console.log('🚀 Starting Diamond Muzzle app initialization...');
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    const root = createRoot(rootElement);
    root.render(<App />);
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ Critical app initialization error:', error);
    
    // Emergency fallback UI
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="text-align: center; padding: 2rem; max-width: 400px;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">💎</div>
            <h1 style="font-size: 1.5rem; margin-bottom: 1rem; font-weight: 600;">Diamond Muzzle</h1>
            <p style="margin-bottom: 2rem; opacity: 0.9;">App is temporarily unavailable. Please try again.</p>
            <button 
              onclick="window.location.reload()" 
              style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; backdrop-filter: blur(10px);"
              onmouseover="this.style.background='rgba(255,255,255,0.3)'"
              onmouseout="this.style.background='rgba(255,255,255,0.2)'"
            >
              🔄 Reload App
            </button>
            <div style="margin-top: 2rem; font-size: 0.875rem; opacity: 0.7;">
              Error: ${error.message || 'Unknown error'}
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Start the app
initializeApp();
