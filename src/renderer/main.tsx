import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { setupBrowserMock } from './mock/electron-mock';
import './styles/index.css';

// Initialize mock API only if not in Electron (for viewing directly in browser)
setupBrowserMock();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
