/*
 * FILE: /frontend/src/hooks/useChat.js
 * Make sure this file exists and has this content.
 */
import { useState, useEffect, useRef } from 'react';

// Vite uses `import.meta.env` and a VITE_ prefix
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';

export const useChat = (username, language) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        if (!username || !language) return;

        ws.current = new WebSocket(WEBSOCKET_URL);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            ws.current.send(JSON.stringify({ type: 'join', username, language }));
        };

        ws.current.onclose = () => {
            setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'message':
                    case 'bot-message':
                        if (data && typeof data.username === 'string' && typeof data.text === 'string') {
                            setMessages(prev => [...prev, { ...data, id: Math.random() }]);
                        }
                        break;
                    case 'user-list':
                        if (Array.isArray(data.users)) {
                            const validUsers = data.users.filter(u => u && u.username && u.language);
                            setUsers(validUsers);
                        }
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        };
        
        ws.current.onerror = (error) => console.error('WebSocket Error:', error);

        return () => ws.current?.close();
    }, [username, language]);

    const sendMessage = (text) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'message', username, text, language }));
        }
    };

    return { messages, users, sendMessage, isConnected };
};
