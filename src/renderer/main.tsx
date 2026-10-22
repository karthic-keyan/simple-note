import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

// Initialize mock API only if not in Electron (for development in standalone browser)
if (import.meta.env.DEV && typeof window !== 'undefined' && !window.electronAPI) {
  const { setupBrowserMock } = await import('./mock/electron-mock');
  setupBrowserMock();
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
