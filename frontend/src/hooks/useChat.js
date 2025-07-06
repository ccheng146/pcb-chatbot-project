/*
 * FILE: /frontend/src/hooks/useChat.js
 * Make sure this file exists and has this content.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// Define API base URL - ideally this would be in an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_BASE_URL = import.meta.env.VITE_WEBSOCKET_URL || API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');

const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isReconnectingRef = useRef(false);
  
  // Cleanup function to handle component unmount
  const cleanup = useCallback(() => {
    console.log('Cleaning up WebSocket connection...');
    isReconnectingRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.onclose = null; // Prevent reconnection on manual close
      socketRef.current.close(1000, 'Component unmounting');
      socketRef.current = null;
    }
  }, []);
  
  // Reconnect function with exponential backoff
  const reconnect = useCallback((attempt = 0) => {
    if (isReconnectingRef.current) return; // Prevent multiple reconnection attempts
    
    const maxAttempts = 5;
    if (attempt >= maxAttempts) {
      setConnectionError('Failed to connect after multiple attempts. Please refresh the page.');
      return;
    }
    
    isReconnectingRef.current = true;
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s delay
    console.log(`Attempting to reconnect (${attempt + 1}/${maxAttempts}) in ${delay}ms...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      initializeWebSocket(attempt + 1);
    }, delay);
  }, []);
  
  // Function to initialize WebSocket
  const initializeWebSocket = useCallback((attempt = 0) => {
    if (isReconnectingRef.current && attempt === 0) return; // Prevent multiple initial connections
    
    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      
      console.log(`Connecting to WebSocket: ${WS_BASE_URL} (attempt ${attempt + 1})`);
      socketRef.current = new WebSocket(WS_BASE_URL);
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close();
          setConnectionError('Connection timeout. Retrying...');
          reconnect(attempt);
        }
      }, 10000); // 10 second timeout
      
      socketRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError('');
        isReconnectingRef.current = false;
        
        // Send join message
        const joinMessage = {
          type: 'join',
          username: user.name,
          language: user.language,
          password: user.password // Include password for authentication
        };
        socketRef.current.send(JSON.stringify(joinMessage));
      };
      
      socketRef.current.onmessage = (event) => {
        try {
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
              setUsers(message.users || []);
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socketRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt to reconnect if it wasn't a clean close and component is still mounted
        if (event.code !== 1000 && !isReconnectingRef.current) {
          setConnectionError('Connection lost. Reconnecting...');
          reconnect(attempt);
        }
      };
      
      socketRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        setIsConnected(false);
        
        if (!isReconnectingRef.current) {
          setConnectionError('Connection error occurred. Attempting to reconnect...');
        }
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnected(false);
      setConnectionError('Failed to establish connection. Please check your network.');
      if (!isReconnectingRef.current) {
        reconnect(attempt);
      }
    }
  }, [user, reconnect]);
  
  // Initialize WebSocket when component mounts
  useEffect(() => {
    if (user && user.name) {
      isReconnectingRef.current = false;
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
