/* FILE: /frontend/src/components/ChatWindow.jsx */
import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';

export default function ChatWindow({ messages, onSendMessage, currentUser, isConnected }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };
    
    return (
        <div className="flex-1 flex flex-col bg-gray-200">
            <div className="flex-1 p-6 overflow-y-auto">
                {!isConnected && (
                    <div className="text-center text-red-500 font-semibold p-2 bg-red-100 rounded-md mb-4">
                        Connecting to server...
                    </div>
                )}
                {messages.map((msg) => (
                    <Message key={msg.id} msg={msg} currentUser={currentUser.username} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-300">
                <form onSubmit={handleSubmit} className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={isConnected ? "Type your question here..." : "Waiting for connection..."}
                        disabled={!isConnected}
                    />
                    <button type="submit" disabled={!isConnected} className="ml-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0 disabled:bg-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </form>
            </div>
        </div>
    );
}