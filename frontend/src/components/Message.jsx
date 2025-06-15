/* FILE: /frontend/src/components/Message.jsx */
import React from 'react';

export default function Message({ msg, currentUser }) {
    if (!msg || !msg.username || typeof msg.text !== 'string') return null;

    const isCurrentUser = msg.username === currentUser;
    const isBot = msg.username === 'ChatBot';

    return (
        <div className={`flex items-start mb-4 ${isCurrentUser ? 'justify-end' : ''}`}>
            {!isCurrentUser && !isBot && <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>}
            {isBot && <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">B</div>}
            <div className={`max-w-md p-3 rounded-lg shadow-md ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                {!isCurrentUser && !isBot && <p className="text-xs text-gray-500 font-bold mb-1">{msg.username}</p>}
                <p className="text-sm">{msg.text}</p>
            </div>
        </div>
    );
}