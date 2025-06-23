/* /frontend/src/main.jsx */
/* This is the new entry point for the application */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// If you create a global CSS file, import it here
import './index.css' 

// Calculate the viewport height for mobile browsers - improved version
function setAppHeight() {
  const doc = document.documentElement;
  const windowHeight = window.innerHeight;
  
  // Fix for iOS Safari - use more reliable approaches
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (isIOS) {
    // On iOS, we need to handle the viewport differently
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"), 10) || 0;
    const height = `${windowHeight - safeAreaBottom}px`;
    doc.style.setProperty('--app-height', height);
  } else {
    // For other browsers
    doc.style.setProperty('--app-height', `${windowHeight}px`);
  }
}

// Set initial height
setAppHeight();

// Update on resize and orientation change
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', () => {
  // Small delay to ensure the orientation has fully changed
  setTimeout(setAppHeight, 100);
});

// Also update on page load to ensure accurate calculations
window.addEventListener('load', setAppHeight);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
