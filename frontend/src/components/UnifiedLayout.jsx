import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import ChatWindow from './ChatWindow';
import AdminPage from './AdminPage';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';
import '../unified-layout.css'; // Import the new CSS

const UnifiedLayout = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Tabs navigation - more compact on mobile */}
      <div className={`flex bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm tab-nav ${isMobile ? 'justify-between' : ''}`}>
        <button
          className={`${isMobile ? 'flex-1' : 'px-6'} py-3 text-sm font-medium ${
            activeTab === 'chat' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          {translate('chatRoom', language)}
        </button>
        <button
          className={`${isMobile ? 'flex-1' : 'px-6'} py-3 text-sm font-medium ${
            activeTab === 'login' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('login')}
        >
          {translate('login', language)}
        </button>
        <button
          className={`${isMobile ? 'flex-1' : 'px-6'} py-3 text-sm font-medium ${
            activeTab === 'admin' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('admin')}
        >
          {translate('admin', language)}
        </button>
      </div>
      
      {/* Content area - adjusted for mobile */}
      <div className="flex-1 overflow-hidden tab-content">
        {/* Chat room tab */}
        <div className={`h-full ${activeTab === 'chat' ? 'block' : 'hidden'}`} 
             style={{ 
               height: 'calc(100% - 2px)', 
               paddingTop: '2px',
               overflow: 'auto' 
             }}>
          {user ? (
            <div className="h-full chat-container">
              <ChatWindow user={user} onLogout={handleLogout} isMobile={isMobile} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {translate('pleaseLogin', language)}
                </h2>
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {translate('goToLogin', language)}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Login tab */}
        <div className={`h-full ${activeTab === 'login' ? 'block' : 'hidden'}`}>
          <LoginScreen onLogin={(userData) => {
            handleLogin(userData);
            setActiveTab('chat');
          }} isMobile={isMobile} />
        </div>
        
        {/* Admin tab */}
        <div className={`h-full ${activeTab === 'admin' ? 'block' : 'hidden'}`}>
          <AdminPage isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedLayout;
