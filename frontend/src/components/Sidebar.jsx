/* FILE: /frontend/src/components/Sidebar.jsx */
import React, { useState } from 'react';

export default function Sidebar({ users, onTrain, isTraining, trainingStatus }) {
    const languageOptions = { 'en': 'English', 'es': 'Español', 'zh': '中文' };
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleTrainClick = () => {
        onTrain(files);
        // Do not clear files here, so user can see what was selected
    };

    return (
        <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col min-w-[280px]">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">PCB Chat</h2>
            <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-2">Participants ({users.length})</h3>
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li key={user.username} className="flex items-center">
                            <span className="h-3 w-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                            <span className="truncate">{user.username} ({languageOptions[user.language] || '...'})</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-700">
                 <h3 className="text-lg font-semibold mb-2">Train AI Model</h3>
                 <div className="bg-gray-700 p-3 rounded-lg">
                    <label className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                         <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V9h2v2z" /></svg>
                         <span>{files.length > 0 ? `${files.length} file(s) selected` : "Upload Files"}</span>
                         <input type='file' className="hidden" multiple onChange={handleFileChange} />
                    </label>
                     <button 
                        onClick={handleTrainClick} 
                        disabled={isTraining || files.length === 0}
                        className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                         {isTraining ? 'Training...' : 'Start Training'}
                     </button>
                     {trainingStatus && <p className="text-xs mt-2 text-center text-yellow-400">{trainingStatus}</p>}
                 </div>
            </div>
        </div>
    );
}