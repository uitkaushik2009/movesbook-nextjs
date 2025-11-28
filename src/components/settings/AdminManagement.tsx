'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  UserCog, 
  UserPlus, 
  LogIn, 
  User, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';

type AdminTab = 'super-admin' | 'admin-users';

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState<AdminTab>('super-admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Super Admin State
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [superAdminMode, setSuperAdminMode] = useState<'check' | 'register' | 'login'>('check');
  const [superAdminLoggedIn, setSuperAdminLoggedIn] = useState(false);
  
  // Super Admin Registration
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Super Admin Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  
  // New Admin Form
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

  useEffect(() => {
    checkSuperAdminStatus();
    if (activeTab === 'admin-users') {
      loadAdminUsers();
    }
  }, [activeTab]);

  const checkSuperAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/super-admin/exists');
      const data = await response.json();
      setSuperAdminExists(data.exists);
      setSuperAdminMode(data.exists ? 'login' : 'register');
      
      // Check if logged in
      const storedAdmin = localStorage.getItem('superAdminUser');
      setSuperAdminLoggedIn(!!storedAdmin);
    } catch (error) {
      console.error('Error checking super admin:', error);
      setSuperAdminMode('register');
    }
  };

  const loadAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.admins || []);
      }
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  };

  const handleSuperAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!regUsername || !regEmail || !regPassword) {
      setMessage({ type: 'error', text: 'Username, email, and password are required' });
      return;
    }

    if (regPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/super-admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          name: regName || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Super Admin registered successfully!' });
        localStorage.setItem('superAdminUser', JSON.stringify(data.superAdmin));
        setSuperAdminLoggedIn(true);
        setTimeout(() => {
          checkSuperAdminStatus();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Registration failed'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Error during registration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!loginUsername || !loginPassword) {
      setMessage({ type: 'error', text: 'Username and password are required' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Logged in successfully!' });
        localStorage.setItem('superAdminUser', JSON.stringify(data.superAdmin));
        setSuperAdminLoggedIn(true);
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Login failed'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Error during login' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminLogout = () => {
    localStorage.removeItem('superAdminUser');
    setSuperAdminLoggedIn(false);
    setMessage({ type: 'success', text: 'Logged out successfully' });
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newAdminUsername || !newAdminEmail || !newAdminPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (newAdminPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername,
          email: newAdminEmail,
          password: newAdminPassword,
          name: newAdminName || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Admin user created successfully!' });
        setShowAddAdmin(false);
        setNewAdminUsername('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminName('');
        loadAdminUsers();
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Failed to create admin'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Error creating admin user' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAdminPassword = async (adminId: string) => {
    const newPassword = prompt('Enter new password for this admin (min 6 characters):');
    if (!newPassword) return;

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${adminId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Password reset successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: `❌ ${data.error || 'Failed to reset password'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Error resetting password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Admin user deleted successfully!' });
        loadAdminUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: `❌ ${data.error || 'Failed to delete admin'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Error deleting admin user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-600" />
            Admin Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Super Admin and Admin user accounts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('super-admin')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
            activeTab === 'super-admin'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5" />
          Super Admin
        </button>
        <button
          onClick={() => setActiveTab('admin-users')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
            activeTab === 'admin-users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <UserCog className="w-5 h-5" />
          Admin Users
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Super Admin Tab */}
      {activeTab === 'super-admin' && (
        <div className="space-y-6">
          {superAdminLoggedIn ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Logged In as Super Admin</h3>
                    <p className="text-sm text-green-700">You have full administrative access</p>
                  </div>
                </div>
                <button
                  onClick={handleSuperAdminLogout}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Registration Form */}
              {superAdminMode === 'register' && (
                <form onSubmit={handleSuperAdminRegister} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <UserPlus className="w-5 h-5" />
                      <span className="font-semibold">Create Super Admin Account</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      This is a one-time setup. Create the Super Admin account to manage all admin features.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="superadmin"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password * (min 8 characters)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-5 h-5" />
                    {loading ? 'Creating...' : 'Create Super Admin Account'}
                  </button>
                </form>
              )}

              {/* Login Form */}
              {superAdminMode === 'login' && (
                <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <LogIn className="w-5 h-5" />
                      <span className="font-semibold">Super Admin Login</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Login to manage admin users and system settings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="superadmin or email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-5 h-5" />
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Security Tips */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🔐 Security Tips</h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Use a unique, strong password (12+ characters recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Mix uppercase, lowercase, numbers, and special characters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Never share your Super Admin credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Store password securely (password manager recommended)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Admin Users Tab */}
      {activeTab === 'admin-users' && (
        <div className="space-y-6">
          {/* Add Admin Button */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              Manage admin users who can access the admin panel
            </p>
            <button
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Add Admin User
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddAdmin && (
            <form onSubmit={handleAddAdmin} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Admin User</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="admin1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password * (min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewAdminPassword ? 'text' : 'password'}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full pr-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  <UserPlus className="w-5 h-5" />
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAdmin(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Admin Users List */}
          <div className="space-y-3">
            {adminUsers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No admin users yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Click "Add Admin User" to create one</p>
              </div>
            ) : (
              adminUsers.map((admin) => (
                <div 
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {admin.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{admin.name || admin.username}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">@{admin.username}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResetAdminPassword(admin.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition text-sm font-medium"
                      title="Reset Password"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm font-medium"
                      title="Delete Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

