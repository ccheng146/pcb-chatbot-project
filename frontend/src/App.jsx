/*
 * FILE: /frontend/src/App.jsx
 */
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './components/AdminPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user credentials
  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Store user data securely (in a real app, you'd want to use a more secure method)
    localStorage.setItem('chatUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Routes>
            <Route
              path="/"
              element={
                !user ? (
                  <LoginScreen onLogin={handleLogin} />
                ) : (
                  <ChatWindow user={user} onLogout={handleLogout} />
                )
              }
            />
            {/* Ensure the admin route works properly */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;