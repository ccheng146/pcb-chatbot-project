/* /frontend/src/main.jsx */
/* This is the new entry point for the application */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css' 

// Enhanced mobile viewport height calculation
function setAppHeight() {
  const doc = document.documentElement;
  const windowHeight = window.innerHeight;
  
  // Use the most reliable viewport height
  if (window.visualViewport) {
    // Modern approach with Visual Viewport API
    const height = window.visualViewport.height;
    doc.style.setProperty('--app-height', `${height}px`);
  } else {
    // Fallback for older browsers
    doc.style.setProperty('--app-height', `${windowHeight}px`);
  }
  
  // Also set CSS custom property for dynamic viewport
  doc.style.setProperty('--vh', `${windowHeight * 0.01}px`);
}

// Set initial height
setAppHeight();

// Listen for viewport changes (keyboard, orientation, etc.)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setAppHeight);
} else {
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setAppHeight, 100);
  });
}

// Handle iOS keyboard events
window.addEventListener('focusin', () => {
  setTimeout(setAppHeight, 300);
});

window.addEventListener('focusout', () => {
  setTimeout(setAppHeight, 300);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
