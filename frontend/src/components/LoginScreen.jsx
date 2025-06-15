/* FILE: /frontend/src/components/LoginScreen.jsx */
import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [language, setLanguage] = useState('en');
    const languageOptions = { 'en': 'English', 'es': 'Español', 'zh': '中文' };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username, language);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-800">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Join PCB Chat</h1>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-600 mb-2">Enter your name</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Jane Doe"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="language" className="block text-gray-600 mb-2">Select your language</label>
                     <select 
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                        {Object.entries(languageOptions).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                    Enter Chat
                </button>
            </form>
        </div>
    );
}