/* /frontend/src/main.jsx */
/* This is the new entry point for the application */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// If you create a global CSS file, import it here
import './index.css' 

// Calculate the viewport height for mobile browsers
function setAppHeight() {
  const doc = document.documentElement;
  doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}

// Set initial height
setAppHeight();

// Update on resize and orientation change
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
