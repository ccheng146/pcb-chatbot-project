/*
 * FILE: /frontend/src/App.jsx
 */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import UnifiedLayout from './components/UnifiedLayout';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <UnifiedLayout />
      </Router>
    </LanguageProvider>
  );
}

export default App;