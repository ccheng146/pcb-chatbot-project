/* FILE: /frontend/src/components/LoginScreen.jsx */
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translations';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('');
  const { language, setLanguage } = useLanguage();

  // Define API_BASE_URL using environment variable or fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Check network connectivity
  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setNetworkStatus('');
        return true;
      } else {
        setNetworkStatus('Warning: API server might be down. Response status: ' + response.status);
        return false;
      }
    } catch (err) {
      console.error('API connection error:', err);
      setNetworkStatus(
        `Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running.`
      );
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setError('');

    // Check API connection first
    const isConnected = await checkApiConnection();
    if (!isConnected) {
      setLoading(false);
      setError('Cannot connect to authentication server. Please try again later.');
      return;
    }

    try {
      if (isRegistering) {
        // Register new user
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: name.trim(), password, language }),
        });
        
        // Check if the response exists before trying to parse JSON
        if (!response) {
          throw new Error('No response from server');
        }
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Successfully registered, now log them in
        onLogin({ name: name.trim(), password, language });
      } else {
        // Login existing user
        console.log('Attempting login to:', `${API_BASE_URL}/api/auth/login`);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: name.trim(), password }),
        });
        
        // Check if the response exists before trying to parse JSON
        if (!response) {
          throw new Error('No response from server');
        }
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Authentication failed');
        }
        
        // Successfully authenticated
        onLogin({ name: name.trim(), password, language });
      }
    } catch (err) {
      console.error('Authentication error:', err);
      
      // Differentiate between network errors and authentication errors
      if (err.name === 'TypeError' && err.message.includes('NetworkError')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Could not connect to authentication server. Please try again later.');
      } else {
        setError(err.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Replace goToAdmin function with a simple link
  const goToAdmin = () => {
    window.location.href = '/admin';  // Simple navigation without useNavigate
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Main login form */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Header with logo/icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            {translate('welcome', language)}
          </h1>
          <p className="text-gray-600 text-sm">
            Professional PCB Solutions & AI Assistance
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {networkStatus && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-4">
            {networkStatus}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold">
              {translate('enterName', language)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50"
                placeholder={translate('enterName', language)}
                required
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold">
              {translate('selectLanguage', language)}
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50 appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
                <option value="de">Deutsch</option>
                <option value="th">ไทย</option>
              </select>
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
              </svg>
              <svg className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50"
                placeholder="Enter your password"
                required
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isRegistering ? translate('register', language) : translate('joinChat', language)}
          </button>

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
            >
              {isRegistering ? translate('loginPrompt', language) : translate('registerPrompt', language)}
            </button>
          </div>
        </form>

        {/* Footer - update the admin button */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Powered by AI • Secure • Professional
          </p>
          <button
            type="button"
            onClick={goToAdmin}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {translate('admin', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;