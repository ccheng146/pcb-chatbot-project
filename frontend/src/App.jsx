/*
 * FILE: /frontend/src/App.jsx
 * Replace the entire content of your App.jsx with this.
 */
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <LanguageProvider>
      <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {!user ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <ChatWindow user={user} />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;