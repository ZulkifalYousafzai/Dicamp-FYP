import { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import AdminDashboard from './components/adminDashboard/AdminDashboard';
import JudgeDashboard from './components/JudgeDashboard/JudgeDashboard';
import { getCurrentUser, logoutUser, getUserRole } from './services/authService';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log(" Checking authentication state...");
        const user = await getCurrentUser();
        console.log("Current user:", user);
        
        if (user) {
          console.log(" User found, getting role for UID:", user.uid);
          const role = await getUserRole(user.uid);
          console.log(" Retrieved role:", role);
          
          if (role === 'admin') {
            console.log(" Admin role found");
            setUserRole('admin');
            setIsLoggedIn(true);
          } else if (role === 'judge') {
            console.log(" Judge role found");
            setUserRole('judge');
            setIsLoggedIn(true);
          } else {
            console.log(" Invalid role, logging out...");
            await logoutUser();
            setIsLoggedIn(false);
            setUserRole(null);
          }
        } else {
          console.log(" No user found");
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error(" Auth check error:", error);
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleLogin = (role) => {
    console.log(" Login successful, setting role:", role);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      setUserRole(null);
    } catch (error) {
      console.error("Logout error:", error);
      alert('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider>
      <div className="App">
        {userRole === 'admin' ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : userRole === 'judge' ? (
          <JudgeDashboard onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;