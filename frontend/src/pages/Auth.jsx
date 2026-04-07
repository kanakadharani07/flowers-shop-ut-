import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Auth = () => {
  const { login, register, googleLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Successfully logged in!");
      } else {
        await register(name, email, password, role);
        toast.success("Account created successfully!");
      }
      navigate('/');
    } catch (err) {
      let friendlyMessage = err.message || 'Authentication failed. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        friendlyMessage = "Account not found. Please click 'Register' to create a new account!";
      } else if (err.code === 'auth/email-already-in-use') {
         friendlyMessage = "Email already in use. Please sign in instead.";
      } else if (err.code === 'auth/weak-password') {
         friendlyMessage = "Password is too weak. Please use at least 6 characters.";
      }
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      toast.success("Successfully logged in with Google!");
      navigate('/');
    } catch (err) {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper" style={{ marginTop: '0', maxWidth: '30rem' }}>
        <div className="auth-card">
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '9999px', padding: '0.25rem', width: '100%' }}>
              <button 
                type="button" 
                onClick={() => setIsLogin(true)} 
                style={{ flex: 1, padding: '0.5rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.3s', backgroundColor: isLogin ? 'white' : 'transparent', color: isLogin ? '#ec4899' : '#6b7280', boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => setIsLogin(false)} 
                style={{ flex: 1, padding: '0.5rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.3s', backgroundColor: !isLogin ? 'white' : 'transparent', color: !isLogin ? '#ec4899' : '#6b7280', boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', border: 'none', cursor: 'pointer' }}
              >
                Register
              </button>
            </div>
          </div>

          <h2 className="auth-title font-serif" style={{ marginTop: 0 }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
            {isLogin ? "Sign in to access your wishlist and cart." : "Join Flowers Hope to spread joy!"}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <div className="auth-field">
                <label>Full Name</label>
                <div>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="auth-input" placeholder="e.g. John Doe" />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label>Email address</label>
              <div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" />
              </div>
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label>Join As</label>
                <div>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="auth-input">
                    <option value="user">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" disabled={loading} className="auth-btn" style={{ padding: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>

            <div className="auth-divider">
              <span className="auth-divider-text">Or continue with</span>
            </div>

            <div>
              <button type="button" onClick={handleGoogleLogin} disabled={loading} className="google-btn" style={{ padding: '0.75rem' }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                Sign in with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
