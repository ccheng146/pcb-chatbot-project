import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import Message from './Message';
import useChat from '../hooks/useChat';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

const ChatWindow = ({ user, onLogout }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const {
    messages,
    users,
    isConnected,
    connectionError, // New error state from hook
    sendMessage
  } = useChat(user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Also prevent page scrolling
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      sendMessage(message);
      setMessage('');
    }
  };

  const getConnectionStatus = () => {
    if (connectionError) {
      return { text: connectionError, color: 'text-red-600', bgColor: 'bg-red-500', icon: '✕' };
    } else if (isConnected) {
      return { text: translate('connected', language), color: 'text-emerald-600', bgColor: 'bg-emerald-500', icon: '●' };
    } else {
      return { text: translate('connecting', language), color: 'text-amber-600', bgColor: 'bg-amber-500', icon: '●' };
    }
  };

  const status = getConnectionStatus();

  // Handle quick action buttons without page scrolling
  const handleQuickAction = (questionType) => {
    let question;
    switch(questionType) {
      case 'pcb':
        question = language === 'zh' ? "什么是PCB？" : 
                   language === 'es' ? "¿Qué es un PCB?" :
                   language === 'de' ? "Was ist eine PCB?" :
                   language === 'th' ? "PCB คืออะไร?" : 
                   "What is a PCB?";
        break;
      case 'materials':
        question = language === 'zh' ? "PCB材料" :
                   language === 'es' ? "Materiales PCB" :
                   language === 'de' ? "PCB Materialien" :
                   language === 'th' ? "วัสดุ PCB" :
                   "PCB materials";
        break;
      case 'types':
        question = language === 'zh' ? "PCB类型" :
                   language === 'es' ? "Tipos de PCB" :
                   language === 'de' ? "PCB Typen" :
                   language === 'th' ? "ประเภทของ PCB" :
                   "Types of PCB";
        break;
    }
    
    setMessage(question);
    
    // Focus back to input if needed
    const inputElement = document.getElementById('chatInput');
    if (inputElement) {
      inputElement.focus();
    }
    
    // Make sure we're not scrolling the page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 chat-room-fix">
      <Sidebar users={users} />
      
      <div className="flex-1 flex flex-col h-full">
        {/* Enhanced Header with Translations */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm chat-header-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {translate('appTitle', language)}
                </h1>
                <p className="text-sm text-gray-500">{translate('appSubtitle', language)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <div className={`w-2 h-2 rounded-full ${status.bgColor} ${connectionError ? '' : 'animate-pulse'}`}></div>
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span className="text-sm font-medium text-blue-700">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full hover:bg-rose-100 transition-colors"
                title="Back to login"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area with Translated Welcome */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-blue-50/30 chat-messages"
          ref={messagesContainerRef}
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{translate('welcomeTitle', language)}</h3>
                  <p className="text-gray-600 text-sm">{translate('welcomeSubtitle', language)}</p>
                </div>
              </div>
            </div>
          )}
          {connectionError && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-red-50 p-6 rounded-lg shadow border border-red-200 max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">Connection Error</h3>
                <p className="text-red-600 mb-4">{connectionError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} currentUser={user.name} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area with Translated Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-4 shadow-lg chat-input">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={translate('typeMessage', language)}
                className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50"
                disabled={!isConnected}
                id="chatInput"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <button
              type="submit"
              disabled={!isConnected || !message.trim() || !!connectionError}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <span className="font-medium">{translate('send', language)}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </form>
          
          {/* Quick Actions with Translations */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuickAction('pcb');
              }}
              className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              disabled={!isConnected}
              type="button"
            >
              {translate('quickWhatIsPCB', language)}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuickAction('materials');
              }}
              className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              disabled={!isConnected}
              type="button"
            >
              {translate('quickMaterials', language)}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuickAction('types');
              }}
              className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              disabled={!isConnected}
              type="button"
            >
              {translate('quickTypes', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;