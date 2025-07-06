import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import ChatWindow from './ChatWindow';
import AdminPage from './AdminPage';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';
import '../unified-layout.css';

const UnifiedLayout = () => {
  const [user, setUser] = useState(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check for stored credentials
  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser');
    const adminAuth = localStorage.getItem('adminAuthenticated');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    if (adminAuth === 'true') {
      setAdminAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('chatUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
  };

  // If we're on admin route, show only admin page
  if (location.pathname === '/admin') {
    return <AdminPage isMobile={isMobile} />;
  }

  // If user is logged in, show chat interface
  if (user) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" 
           style={{ 
             height: '100dvh',
             minHeight: '-webkit-fill-available'
           }}>
        <div className="h-full chat-container">
          <ChatWindow user={user} onLogout={handleLogout} isMobile={isMobile} />
        </div>
      </div>
    );
  }

  // If no user is logged in, show login screen directly
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" 
         style={{ 
           height: '100dvh',
           minHeight: '-webkit-fill-available'
         }}>
      <div className="h-full">
        <LoginScreen onLogin={handleLogin} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default UnifiedLayout;
