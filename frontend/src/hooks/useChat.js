/*
 * FILE: /frontend/src/hooks/useChat.js
 * Make sure this file exists and has this content.
 */
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';

const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      setIsConnected(true);
      // Send user info with language
      ws.current.send(JSON.stringify({
        type: 'join',
        username: user.name,
        language: language
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            user: data.username,
            text: data.text,
            timestamp: new Date(data.timestamp),
            isBot: data.isBot || false
          }]);
          break;
        case 'user-list':
          // Handle both array of strings and array of objects
          const userList = data.users.map(u => {
            if (typeof u === 'string') {
              return { username: u, language: 'en' };
            }
            return u;
          });
          setUsers(userList);
          break;
        case 'bot-message':
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            user: 'ChatBot',
            text: data.text,
            timestamp: new Date(),
            isBot: true
          }]);
          break;
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user.name, language]);

  const sendMessage = (text) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        text: text,
        username: user.name,
        language: language
      }));
    }
  };

  return {
    messages,
    users,
    isConnected,
    sendMessage
  };
};

export default useChat;
