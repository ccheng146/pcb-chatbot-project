import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import Message from './Message';
import useChat from '../hooks/useChat';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';

const ChatWindow = ({ user }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { language } = useLanguage();
  
  const {
    messages,
    users,
    isConnected,
    sendMessage
  } = useChat(user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (isConnected) {
      return { text: translate('connected', language), color: 'text-emerald-600', bgColor: 'bg-emerald-500', icon: '●' };
    } else {
      return { text: translate('connecting', language), color: 'text-amber-600', bgColor: 'bg-amber-500', icon: '●' };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar users={users} />
      
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header with Translations */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
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
                <div className={`w-2 h-2 rounded-full ${status.bgColor} animate-pulse`}></div>
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
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area with Translated Welcome */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-blue-50/30">
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
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} currentUser={user.name} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area with Translated Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-4 shadow-lg">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={translate('typeMessage', language)}
                className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50"
                disabled={!isConnected}
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <button
              type="submit"
              disabled={!isConnected || !message.trim()}
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
              onClick={() => {
                let question = "What is a PCB?";
                if (language === 'zh') question = "什么是PCB？";
                else if (language === 'es') question = "¿Qué es un PCB?";
                else if (language === 'de') question = "Was ist eine PCB?";
                else if (language === 'th') question = "PCB คืออะไร?";
                setMessage(question);
              }}
              className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              disabled={!isConnected}
            >
              {translate('quickWhatIsPCB', language)}
            </button>
            <button
              onClick={() => {
                let question = "PCB materials";
                if (language === 'zh') question = "PCB材料";
                else if (language === 'es') question = "Materiales PCB";
                else if (language === 'de') question = "PCB Materialien";
                else if (language === 'th') question = "วัสดุ PCB";
                setMessage(question);
              }}
              className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              disabled={!isConnected}
            >
              {translate('quickMaterials', language)}
            </button>
            <button
              onClick={() => {
                let question = "Types of PCB";
                if (language === 'zh') question = "PCB类型";
                else if (language === 'es') question = "Tipos de PCB";
                else if (language === 'de') question = "PCB Typen";
                else if (language === 'th') question = "ประเภทของ PCB";
                setMessage(question);
              }}
              className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              disabled={!isConnected}
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