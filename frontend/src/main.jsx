/* /frontend/src/main.jsx */
/* This is the new entry point for the application */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// If you create a global CSS file, import it here
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
