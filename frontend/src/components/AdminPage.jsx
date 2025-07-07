import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  // Define the styles within the component
  const adminPageStyles = `
    .admin-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .user-management-header {
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 0;
      position: sticky;
      top: 64px;
      z-index: 15;
    }

    .user-records-container {
      flex: 1;
      overflow: hidden;
      padding: 1.5rem 0;
    }

    .table-container {
      height: calc(100vh - 200px);
      overflow: hidden;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .scrollable-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .scrollable-body::-webkit-scrollbar {
      width: 8px;
    }

    .scrollable-body::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .scrollable-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .scrollable-body::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Firefox scrollbar */
    .scrollable-body {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }
  `;

  // Add API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const navigate = useNavigate();

  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add user state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    language: 'en'
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  // User password change state
  const [isChangingUserPassword, setIsChangingUserPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Admin password change state
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);
  const [adminPasswordData, setAdminPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [adminPasswordChangeError, setAdminPasswordChangeError] = useState('');
  const [adminPasswordChangeSuccess, setAdminPasswordChangeSuccess] = useState('');

  // Check for stored admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch users when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');
    
    if (!newUser.username || !newUser.password) {
      setAddUserError('Username and password are required');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create user');
      }
      
      setAddUserSuccess('User created successfully');
      setNewUser({
        username: '',
        password: '',
        language: 'en'
      });
      
      fetchUsers();
      
      setTimeout(() => {
        setIsAddingUser(false);
        setAddUserSuccess('');
      }, 1500);
      
    } catch (err) {
      setAddUserError(err.message || 'Failed to create user');
    }
  };

  const openPasswordChangeModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    setIsChangingUserPassword(true);
  };

  const handleUserPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    
    if (!selectedUser || !newPassword) {
      setPasswordChangeError('Password is required');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.username}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password');
      }
      
      setPasswordChangeSuccess(`Password for ${selectedUser.username} changed successfully`);
      setNewPassword('');
      
      setTimeout(() => {
        setIsChangingUserPassword(false);
        setPasswordChangeSuccess('');
        setSelectedUser(null);
      }, 1500);
      
    } catch (err) {
      setPasswordChangeError(err.message || 'Failed to change password');
    }
  };

  const handleAdminPasswordChange = async (e) => {
    e.preventDefault();
    setAdminPasswordChangeError('');
    setAdminPasswordChangeSuccess('');
    
    if (!adminPasswordData.currentPassword || !adminPasswordData.newPassword || !adminPasswordData.confirmPassword) {
      setAdminPasswordChangeError('All fields are required');
      return;
    }
    
    if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
      setAdminPasswordChangeError('New passwords do not match');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: adminPasswordData.currentPassword,
          newPassword: adminPasswordData.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password');
      }
      
      setAdminPasswordChangeSuccess('Password changed successfully');
      
      setAdminPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setIsChangingAdminPassword(false);
        setAdminPasswordChangeSuccess('');
      }, 1500);
      
    } catch (err) {
      setAdminPasswordChangeError(err.message || 'Failed to change password');
    }
  };

  // Render modals
  const renderAddUserModal = () => {
    if (!isAddingUser) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          
          {addUserError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              {addUserError}
            </div>
          )}
          
          {addUserSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
              {addUserSuccess}
            </div>
          )}
          
          <form onSubmit={handleAddUser}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={newUser.language}
                  onChange={(e) => setNewUser({...newUser, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="zh">中文</option>
                  <option value="de">Deutsch</option>
                  <option value="th">ไทย</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderUserPasswordChangeModal = () => {
    if (!isChangingUserPassword) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Change Password for {selectedUser?.username}</h3>
          
          {passwordChangeError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              {passwordChangeError}
            </div>
          )}
          
          {passwordChangeSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
              {passwordChangeSuccess}
            </div>
          )}
          
          <form onSubmit={handleUserPasswordChange}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsChangingUserPassword(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAdminPasswordChangeModal = () => {
    if (!isChangingAdminPassword) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Change Admin Password</h3>
          
          {adminPasswordChangeError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              {adminPasswordChangeError}
            </div>
          )}
          
          {adminPasswordChangeSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
              {adminPasswordChangeSuccess}
            </div>
          )}
          
          <form onSubmit={handleAdminPasswordChange}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={adminPasswordData.currentPassword}
                  onChange={(e) => setAdminPasswordData({...adminPasswordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={adminPasswordData.newPassword}
                  onChange={(e) => setAdminPasswordData({...adminPasswordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={adminPasswordData.confirmPassword}
                  onChange={(e) => setAdminPasswordData({...adminPasswordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsChangingAdminPassword(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-800 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600 text-sm">
              Access the PCB Admin Panel
            </p>
          </div>
          
          {loginError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 bg-gray-50/50"
                placeholder="Enter admin username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 bg-gray-50/50"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 outline-none shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Login to Admin Panel
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-red-600 hover:text-red-800 text-sm font-medium transition"
            >
              ← Back to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{adminPageStyles}</style>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Admin Header */}
        <div className="admin-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center shadow-md mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">PCB Admin Panel</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsChangingAdminPassword(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Header */}
        <div className="user-management-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              <button 
                onClick={() => setIsAddingUser(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* User Records Container with fixed headers and proper scrolling */}
        <div className="user-records-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="ml-3 text-gray-600">Loading users...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
                <button
                  onClick={fetchUsers}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="table-container shadow-lg">
                {/* Fixed header table */}
                <div className="sticky-header">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Language</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                
                {/* Scrollable body */}
                <div className="scrollable-body">
                  <table className="min-w-full">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                              <p className="text-lg font-medium text-gray-900 mb-1">No users found</p>
                              <p className="text-sm text-gray-500">Get started by adding your first user</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500">User ID: {index + 1}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {user.language || 'en'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastLogin ? (
                                <div>
                                  <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(user.lastLogin).toLocaleTimeString()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Never</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.online ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                  Online
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                  Offline
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button 
                                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                                  onClick={() => alert(`View details for ${user.username}`)}
                                  title="View user details"
                                >
                                  View
                                </button>
                                <button 
                                  className="text-purple-600 hover:text-purple-900 font-medium"
                                  onClick={() => openPasswordChangeModal(user)}
                                  title="Change user password"
                                >
                                  Password
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900 font-medium"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                                      handleDeleteUser(user.username);
                                    }
                                  }}
                                  title="Delete user"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Footer with user count */}
                {users.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{users.length}</span> user{users.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total registered users: {users.length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Render modals */}
        {renderAddUserModal()}
        {renderUserPasswordChangeModal()}
        {renderAdminPasswordChangeModal()}
      </div>
    </>
  );
};

export default AdminPage;