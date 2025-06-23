/*
 * FILE: /frontend/src/hooks/useChat.js
 * Make sure this file exists and has this content.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';

// Define API base URL - ideally this would be in an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_BASE_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');

const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Cleanup function to handle component unmount
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);
  
  // Reconnect function with exponential backoff
  const reconnect = useCallback((attempt = 0) => {
    const maxAttempts = 5;
    if (attempt >= maxAttempts) {
      setConnectionError('Failed to connect after multiple attempts. Please refresh the page.');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff with 30s max
    console.log(`Attempting to reconnect (${attempt + 1}/${maxAttempts}) in ${delay}ms...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      initializeWebSocket(attempt + 1);
    }, delay);
  }, []);
  
  // Function to initialize WebSocket
  const initializeWebSocket = useCallback((attempt = 0) => {
    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      console.log(`Connecting to WebSocket: ${WS_BASE_URL}`);
      socketRef.current = new WebSocket(`${WS_BASE_URL}`);
      
      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError('');
        
        // Send join message
        const joinMessage = {
          type: 'join',
          username: user.name,
          language: user.language
        };
        socketRef.current.send(JSON.stringify(joinMessage));
      };
      
      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        
        switch(message.type) {
          case 'message':
          case 'bot-message':
            setMessages(prev => [...prev, {
              id: Date.now() + Math.random(),
              user: message.username,
              text: message.text,
              timestamp: message.timestamp,
              isBot: message.type === 'bot-message'
            }]);
            break;
          case 'user-list':
            setUsers(message.users);
            break;
        }
      };
      
      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        setIsConnected(false);
        
        // Don't attempt to reconnect if it was a clean close
        if (event.code !== 1000) {
          reconnect(attempt);
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setConnectionError('Connection error occurred. Attempting to reconnect...');
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnected(false);
      setConnectionError('Failed to establish connection. Please check your network.');
      reconnect(attempt);
    }
  }, [user, reconnect]);
  
  // Initialize WebSocket when component mounts
  useEffect(() => {
    if (user) {
      initializeWebSocket();
    }
    
    return cleanup;
  }, [user, initializeWebSocket, cleanup]);
  
  // Function to send messages
  const sendMessage = useCallback((text) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      setConnectionError('Not connected. Please wait or refresh the page.');
      return;
    }
    
    const messageObject = {
      type: 'message',
      text
    };
    
    socketRef.current.send(JSON.stringify(messageObject));
  }, []);
  
  return {
    messages,
    users,
    isConnected,
    connectionError,
    sendMessage
  };
};

export default useChat;
