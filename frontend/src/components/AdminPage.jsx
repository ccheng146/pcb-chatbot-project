import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Add a simple error boundary to catch silent errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-red-600 text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || "Unknown error"}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminPage = () => {
  const navigate = useNavigate();

  // State declarations
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    language: 'en'
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChangingUserPassword, setIsChangingUserPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  // Add a visible loading state
  const [pageLoaded, setPageLoaded] = useState(false);

  // Add new state variables for admin password change
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);
  const [adminPasswordData, setAdminPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [adminPasswordChangeError, setAdminPasswordChangeError] = useState('');
  const [adminPasswordChangeSuccess, setAdminPasswordChangeSuccess] = useState('');

  // useEffect for authentication check
  useEffect(() => {
    const checkAuth = localStorage.getItem('adminAuthenticated');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // useEffect for fetching users when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Add a timer to ensure component state updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handler functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/admin/login', {
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/users');
      
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  const handleDeleteUser = async (username) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${username}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter(user => user.username !== username));
    } catch (err) {
      setError('Failed to delete user: ' + err.message);
    }
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');
    
    if (!newUser.username || !newUser.password) {
      setAddUserError('Username and password are required');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
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

  // Handle user password change
  const handleUserPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    
    if (!selectedUser || !newPassword) {
      setPasswordChangeError('Password is required');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/users/${selectedUser.username}/change-password`, {
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
  
  // Open password change modal for a user
  const openPasswordChangeModal = (user) => {
    setSelectedUser(user);
    setIsChangingUserPassword(true);
    setNewPassword('');
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
  };

  // Add function to handle admin password change
  const handleAdminPasswordChange = async (e) => {
    e.preventDefault();
    setAdminPasswordChangeError('');
    setAdminPasswordChangeSuccess('');
    
    // Validate passwords
    if (!adminPasswordData.currentPassword || !adminPasswordData.newPassword || !adminPasswordData.confirmPassword) {
      setAdminPasswordChangeError('All fields are required');
      return;
    }
    
    if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
      setAdminPasswordChangeError('New passwords do not match');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/admin/change-password', {
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
      
      // Success
      setAdminPasswordChangeSuccess('Password changed successfully');
      
      // Reset form
      setAdminPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close modal after a delay
      setTimeout(() => {
        setIsChangingAdminPassword(false);
        setAdminPasswordChangeSuccess('');
      }, 1500);
      
    } catch (err) {
      setAdminPasswordChangeError(err.message || 'Failed to change password');
    }
  };

  // Add User Modal
  const renderAddUserModal = () => {
    if (!isAddingUser) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
            <button 
              onClick={() => setIsAddingUser(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {addUserError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {addUserError}
            </div>
          )}
          
          {addUserSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4">
              {addUserSuccess}
            </div>
          )}
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={newUser.language}
                onChange={(e) => setNewUser({...newUser, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish (Español)</option>
                <option value="zh">Chinese (中文)</option>
                <option value="de">German (Deutsch)</option>
                <option value="th">Thai (ไทย)</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // User Password Change Modal
  const renderUserPasswordChangeModal = () => {
    if (!isChangingUserPassword || !selectedUser) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Change Password for {selectedUser.username}
            </h2>
            <button 
              onClick={() => setIsChangingUserPassword(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {passwordChangeError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {passwordChangeError}
            </div>
          )}
          
          {passwordChangeSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4">
              {passwordChangeSuccess}
            </div>
          )}
          
          <form onSubmit={handleUserPasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter new password"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsChangingUserPassword(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Admin Password Change Modal
  const renderAdminPasswordChangeModal = () => {
    if (!isChangingAdminPassword) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Change Admin Password</h2>
            <button 
              onClick={() => setIsChangingAdminPassword(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {adminPasswordChangeError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {adminPasswordChangeError}
            </div>
          )}
          
          {adminPasswordChangeSuccess && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4">
              {adminPasswordChangeSuccess}
            </div>
          )}
          
          <form onSubmit={handleAdminPasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={adminPasswordData.currentPassword}
                onChange={(e) => setAdminPasswordData({...adminPasswordData, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={adminPasswordData.newPassword}
                onChange={(e) => setAdminPasswordData({...adminPasswordData, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={adminPasswordData.confirmPassword}
                onChange={(e) => setAdminPasswordData({...adminPasswordData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsChangingAdminPassword(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Verify the page is at least minimally visible
  if (!pageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Conditional rendering for authentication state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">Admin Login</h1>
            <p className="text-gray-600 text-sm">Please authenticate to access the admin panel</p>
          </div>

          {loginError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50/50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 outline-none shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Return to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main authenticated UI rendering
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
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
        <div className="max-w-7xl mx-auto">
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

      {/* User Records Container with fixed headers */}
      <div className="user-records-container">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {loading ? (
              <div className="px-6 py-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : error ? (
              <div className="px-6 py-4">
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                  <button
                    onClick={fetchUsers}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="table-container">
                {/* Fixed header table */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky-header">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Language</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                    </tr>
                  </thead>
                </table>
                
                {/* Scrollable body */}
                <div className="scrollable-body">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* User rows */}
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {user.language || 'en'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.online ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Online
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Offline
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                className="text-blue-600 hover:text-blue-900 mr-4"
                                onClick={() => alert(`View details for ${user.username}`)}
                              >
                                View
                              </button>
                              <button 
                                className="text-purple-600 hover:text-purple-900 mr-4"
                                onClick={() => openPasswordChangeModal(user)}
                              >
                                Change Password
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteUser(user.username)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Render modals */}
      {renderAddUserModal()}
      {renderUserPasswordChangeModal()}
      {renderAdminPasswordChangeModal()}
    </div>
  );
};

// Wrap the export in the error boundary
export default function AdminPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AdminPage />
    </ErrorBoundary>
  );
}