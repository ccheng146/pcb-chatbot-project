/* FILE: /frontend/src/components/Sidebar.jsx */
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate, nativeLanguageNames } from '../utils/translations';

const Sidebar = ({ users }) => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  const { language } = useLanguage();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('trainingFiles', file);

    try {
      setUploadStatus(translate('loading', language));
      const response = await fetch('http://localhost:8080/api/upload-training-data', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus(translate('fileUploaded', language));
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        setUploadStatus(translate('uploadError', language));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(translate('uploadError', language));
    }
  };

  const getLanguageDisplay = (userLang) => {
    const languageMap = {
      'en': { name: nativeLanguageNames.en, flag: '🇺🇸', color: 'bg-blue-100 text-blue-700' },
      'es': { name: nativeLanguageNames.es, flag: '🇪🇸', color: 'bg-red-100 text-red-700' },
      'zh': { name: nativeLanguageNames.zh, flag: '🇨🇳', color: 'bg-yellow-100 text-yellow-700' },
      'de': { name: nativeLanguageNames.de, flag: '🇩🇪', color: 'bg-green-100 text-green-700' },
      'th': { name: nativeLanguageNames.th, flag: '🇹🇭', color: 'bg-purple-100 text-purple-700' }
    };
    return languageMap[userLang] || { name: '...', flag: '🌐', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-lg">
      {/* Enhanced Online Users Section */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {translate('onlineUsers', language)}
            </h2>
            <p className="text-xs text-gray-500">{users.length} active participants</p>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {users.map((user, index) => {
            const langInfo = getLanguageDisplay(user.language);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {(user.username || user).charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.username || user}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{langInfo.flag}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${langInfo.color}`}>
                      {langInfo.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced AI Training Section */}
      <div className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsUploadExpanded(!isUploadExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {translate('aiTraining', language)}
              </h2>
              <p className="text-xs text-gray-500">Enhance AI knowledge</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isUploadExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {isUploadExpanded && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700 mb-3">
                {translate('uploadTrainingData', language)}
              </p>
              
              <div className="relative">
                <input
                  type="file"
                  id="trainingFile"
                  className="hidden"
                  accept=".txt,.csv,.json,.pdf"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="trainingFile"
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center space-x-2 group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span>{translate('selectFile', language)}</span>
                </label>
              </div>
              
              {uploadStatus && (
                <div className={`mt-3 text-sm p-3 rounded-lg ${
                  uploadStatus.includes(translate('fileUploaded', language)) 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : uploadStatus.includes(translate('loading', language))
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {uploadStatus.includes(translate('loading', language)) && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{uploadStatus}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Training Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                <div className="text-lg font-bold text-emerald-600">156</div>
                <div className="text-xs text-emerald-700">Training Files</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100">
                <div className="text-lg font-bold text-cyan-600">98%</div>
                <div className="text-xs text-cyan-700">Accuracy</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-auto p-6 border-t border-gray-200/50">
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            🔒 Secure & Encrypted
          </p>
          <p className="text-xs text-gray-400">
            v2.1.0 • Made with ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;