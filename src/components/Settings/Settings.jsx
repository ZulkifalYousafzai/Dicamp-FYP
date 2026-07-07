import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole, logoutUser } from '../../services/authService';
import { auth } from '../../services/firebase';
import { useTheme } from '../../context/ThemeContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import './Settings.css';

function Settings({ onLogout }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: '',
    uid: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Preferences state - stored in localStorage to persist
  const [preferences, setPreferences] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true' || false,
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false', // default true
    dashboardLayout: localStorage.getItem('dashboardLayout') || 'expanded',
    defaultView: localStorage.getItem('defaultView') || 'evaluated'
  });

  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const role = await getUserRole(user.uid);
          setUserInfo({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: role || 'judge',
            uid: user.uid
          });
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  // ✅ Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('darkMode', preferences.darkMode);
    localStorage.setItem('emailNotifications', preferences.emailNotifications);
    localStorage.setItem('dashboardLayout', preferences.dashboardLayout);
    localStorage.setItem('defaultView', preferences.defaultView);
    
    // ✅ Apply dark mode class to body
    if (preferences.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [preferences]);

  // ✅ Toggle handlers
  const handleToggleDarkMode = () => {
    setPreferences({ ...preferences, darkMode: !preferences.darkMode });
  };

  const handleToggleNotifications = () => {
    setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications });
  };

  const handleLayoutChange = (e) => {
    setPreferences({ ...preferences, dashboardLayout: e.target.value });
  };

  const handleDefaultViewChange = (e) => {
    setPreferences({ ...preferences, defaultView: e.target.value });
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Current password is incorrect!' });
      } else if (error.code === 'auth/too-many-requests') {
        setMessage({ type: 'error', text: 'Too many failed attempts. Please try again later.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logoutUser();
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loader"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={`settings-container ${preferences.darkMode ? 'dark' : ''}`}>
      <aside className="settings-sidebar">
        <div className="sidebar-header">
          <h2>⚙️ Settings</h2>
          <p>Manage your account</p>
        </div>

        <nav className="settings-nav">
          <button 
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="nav-icon">🔒</span>
            <span>Security</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span className="nav-icon">🎨</span>
            <span>Preferences</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="nav-icon">ℹ️</span>
            <span>About</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="settings-nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="settings-main">
        {activeTab === 'profile' && (
          <div className="settings-content">
            <h1>Profile Settings</h1>
            <p className="settings-subtitle">View and manage your profile information</p>

            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="profile-info">
                <div className="info-group">
                  <label>Display Name</label>
                  <p className="info-value">{userInfo.name}</p>
                </div>
                <div className="info-group">
                  <label>Email Address</label>
                  <p className="info-value">{userInfo.email}</p>
                </div>
                <div className="info-group">
                  <label>Role</label>
                  <p className="info-value">
                    <span className={`role-badge ${userInfo.role}`}>
                      {userInfo.role === 'admin' ? 'Administrator' : 'Judge'}
                    </span>
                  </p>
                </div>
                <div className="info-group">
                  <label>User ID</label>
                  <p className="info-value code">{userInfo.uid}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-content">
            <h1>Security Settings</h1>
            <p className="settings-subtitle">Change your password and manage security</p>

            <div className="security-card">
              <h3>Change Password</h3>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                    required
                  />
                </div>

                <button type="submit" className="update-password-btn">
                  🔒 Update Password
                </button>
              </form>

              <div className="security-tips">
                <h4>💡 Password Tips</h4>
                <ul>
                  <li>Use at least 6 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Add numbers and special characters</li>
                  <li>Avoid using common words or personal info</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="settings-content">
            <h1>Preferences</h1>
            <p className="settings-subtitle">Customize your dashboard experience</p>

            <div className="preferences-card">
              {/* ✅ Dark Mode Toggle - NOW WORKS GLOBALLY */}
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Dark Mode</h4>
                  <p>Switch between light and dark theme for the entire dashboard</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* ✅ Email Notifications Toggle - Working */}
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Email Notifications</h4>
                  <p>Receive email updates about new evaluations</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.emailNotifications}
                    onChange={handleToggleNotifications}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* ✅ Dashboard Layout - Working */}
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Dashboard Layout</h4>
                  <p>Compact or expanded view</p>
                </div>
                <select 
                  className="preference-select"
                  value={preferences.dashboardLayout}
                  onChange={handleLayoutChange}
                >
                  <option value="compact">Compact</option>
                  <option value="expanded">Expanded</option>
                </select>
              </div>

              {/* ✅ Default View - Working */}
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Default View</h4>
                  <p>Which tab to show first</p>
                </div>
                <select 
                  className="preference-select"
                  value={preferences.defaultView}
                  onChange={handleDefaultViewChange}
                >
                  <option value="pending">Pending Projects</option>
                  <option value="evaluated">Evaluated Projects</option>
                  <option value="all">All Projects</option>
                </select>
              </div>

              {/* ✅ Show current preferences status */}
              <div className="preference-status">
                <p>⚡ Preferences are saved automatically</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="settings-content">
            <h1>About</h1>
            <p className="settings-subtitle">Information about the FYP Evaluation System</p>

            <div className="about-card">
              <div className="about-header">
                <div className="about-logo">🎓</div>
                <div>
                  <h2>FYP Evaluation System</h2>
                  <p className="version-text">Version 2.4.1</p>
                </div>
              </div>

              <div className="about-body">
                <div className="about-section">
                  <h4>📋 About</h4>
                  <p>
                    The FYP Evaluation System is a comprehensive platform designed to streamline 
                    the final year project evaluation process at Edwardes College. It provides a 
                    seamless experience for administrators, judges, and students.
                  </p>
                </div>

                <div className="about-section">
                  <h4>✨ Features</h4>
                  <ul>
                    <li>✅ Admin project management</li>
                    <li>✅ Judge evaluation system</li>
                    <li>✅ Real-time scoring and feedback</li>
                    <li>✅ Comprehensive reporting</li>
                    <li>✅ Secure authentication</li>
                  </ul>
                </div>

                <div className="about-section">
                  <h4>🛠️ Technologies</h4>
                  <div className="tech-tags">
                    <span className="tech-tag">React</span>
                    <span className="tech-tag">Firebase</span>
                    <span className="tech-tag">Firestore</span>
                    <span className="tech-tag">React Router</span>
                  </div>
                </div>

                <div className="about-section">
                  <h4>📧 Contact</h4>
                  <p>For support or inquiries: <a href="mailto:support@dicamp.edu">support@dicamp.edu</a></p>
                </div>

                <div className="about-footer">
                  <p>© 2024 Dicamp Project Evaluation System. Institutional Excellence.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Settings;