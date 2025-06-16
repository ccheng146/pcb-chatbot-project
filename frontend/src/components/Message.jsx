/* FILE: /frontend/src/components/Message.jsx */
import React from 'react';

export default function Message({ message, currentUser }) {
    if (!message || !message.user || typeof message.text !== 'string') return null;

    const isCurrentUser = message.user === currentUser;
    const isBot = message.user === 'ChatBot';

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex items-start mb-6 ${isCurrentUser ? 'justify-end' : ''} animate-fadeIn`}>
            {!isCurrentUser && (
                <div className="flex-shrink-0 mr-3">
                    {isBot ? (
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {message.user.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}
            
            <div className={`max-w-md lg:max-w-lg ${isCurrentUser ? 'ml-auto' : ''}`}>
                {!isCurrentUser && (
                    <div className="flex items-center space-x-2 mb-1">
                        <p className="text-xs font-semibold text-gray-600">
                            {isBot ? 'PCB AI Assistant' : message.user}
                        </p>
                        {isBot && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                AI
                            </span>
                        )}
                    </div>
                )}
                
                <div className={`relative p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                    isCurrentUser 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                        : isBot
                        ? 'bg-gradient-to-r from-gray-50 to-blue-50 text-gray-800 border border-gray-200'
                        : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                    </p>
                    
                    {/* Message tail */}
                    <div className={`absolute top-4 ${
                        isCurrentUser 
                            ? 'right-0 transform translate-x-1' 
                            : 'left-0 transform -translate-x-1'
                    }`}>
                        <div className={`w-3 h-3 rotate-45 ${
                            isCurrentUser 
                                ? 'bg-blue-500' 
                                : isBot
                                ? 'bg-gray-50 border-l border-t border-gray-200'
                                : 'bg-white border-l border-t border-gray-200'
                        }`}></div>
                    </div>
                </div>
                
                <div className={`mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                    <p className="text-xs text-gray-500">
                        {message.timestamp ? formatTime(message.timestamp) : 'now'}
                    </p>
                </div>
            </div>
        </div>
    );
}