/*
 * FILE: /frontend/src/App.jsx
 * Replace the entire content of your App.jsx with this.
 */
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';

export default function App() {
    const [user, setUser] = useState(null);
    const { messages, users, sendMessage, isConnected } = useChat(user?.username, user?.language);
    
    const [isTraining, setIsTraining] = useState(false);
    const [trainingStatus, setTrainingStatus] = useState('');

    const handleLogin = (username, language) => {
        setUser({ username, language });
    };

    const handleTrainModel = async (files) => {
        if (!files || files.length === 0) {
            setTrainingStatus('Please select files to upload.');
            return;
        }
        setIsTraining(true);
        setTrainingStatus('Uploading files...');
        
        const formData = new FormData();
        for (const file of files) {
            formData.append('trainingFiles', file);
        }

        try {
            // IMPORTANT: Vite uses import.meta.env
            const httpUrl = (import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080').replace(/^ws/, 'http');
            const response = await fetch(`${httpUrl}/api/upload-training-data`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setTrainingStatus(result.message || 'Upload complete.');

        } catch (error) {
            console.error('Upload error:', error);
            setTrainingStatus('An error occurred during upload.');
        } finally {
            setIsTraining(false);
        }
    };
    
    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar
                users={users}
                onTrain={handleTrainModel}
                isTraining={isTraining}
                trainingStatus={trainingStatus}
            />
            <ChatWindow
                messages={messages}
                onSendMessage={sendMessage}
                currentUser={user}
                isConnected={isConnected}
            />
        </div>
    );
}