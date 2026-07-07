import './Login.css';
import { useState } from 'react';
import { loginUser } from '../../services/authService';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState('admin');
  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

   const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const result = await loginUser(email, password);
    console.log("Login result:", result);
    console.log("User role from Firebase:", result.user.role);
    console.log("Selected role:", activeRole);
    
    // ✅ Check if role matches
    if (result.user.role !== activeRole) {
      console.log("❌ Role mismatch!");
      setError(`This account is registered as ${result.user.role}. Please select the correct role.`);
      setLoading(false);
      return; // ✅ Stop here - don't proceed
    }
    
    console.log("✅ Role match! Logging in...");
    onLogin(result.user.role);
    
  } catch (error) {
    console.error("Login error:", error);
    setError(error.message);
    setLoading(false);
  }
};
  return (
    <div className="login-container">
      <div className="login-wrapper">
        
        <div className="login-left">
          <div className="university-logo">
            <div className="logo-icon"><img src="../public/images/image.png" alt="" /></div>
            <h2>Edwardes College</h2>
            <p>Dicamp FYP</p>
          </div>
          
          <div className="project-title">
            <h1>PROJECT EVALUATION SYSTEM</h1>
          </div>

          <div className="footer-text">
            <p>© 2024 Dicamp Project Evaluation System. Institutional Excellence.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-header">
            <h2>{activeRole === 'admin' ? 'Admin Login' : 'Judge Login'}</h2>
            <div className="role-buttons">
              <button className="role-btn active"  className={`role-btn ${activeRole === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleChange('admin')}>Dean/Admin</button>
              <button className="role-btn" className={`role-btn ${activeRole === 'judge' ? 'active' : ''}`}
                onClick={() => handleRoleChange('judge')}>Judge</button>
            </div>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="e.g. admin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required

              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              Login
            </button>

            <div className="login-footer">
              <span className="version">System Version 2.4.1</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;