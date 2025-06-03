
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevent any startup errors from crashing the app
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Failed to initialize app:', error);
  // Fallback emergency render
  document.getElementById("root")!.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1>App Failed to Load</h1>
        <p>Please refresh the page to try again.</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
          Reload App
        </button>
      </div>
    </div>
  `;
}
