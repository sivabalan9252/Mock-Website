import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

// Intercom test identity (email + user_id) from environment
const INTERCOM_TEST_EMAIL = process.env.REACT_APP_INTERCOM_TEST_EMAIL
  ? process.env.REACT_APP_INTERCOM_TEST_EMAIL.toLowerCase().trim()
  : 'sivabalan9252@gmail.com';
const INTERCOM_TEST_USER_ID = process.env.REACT_APP_INTERCOM_TEST_USER_ID || 'sg0009';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const redirectPath = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Form validation
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      // Attempt login
      const user = await login(email, password);
      
      // Update Intercom with user information if available
      if (window.identifyIntercomUser) {
        const normalizedEmail = email.toLowerCase().trim();

        // Use env-configured test user_id when email matches, otherwise fallback to uid/email
        const userId = normalizedEmail === INTERCOM_TEST_EMAIL
          ? INTERCOM_TEST_USER_ID
          : (user?.uid || normalizedEmail);
        
        window.identifyIntercomUser({
          email: normalizedEmail,
          user_id: userId,
          name: user?.displayName || 'User',
          created_at: Math.floor(Date.now() / 1000)
        });
        
        console.log('Intercom: User identified on login:', normalizedEmail, 'with user_id:', userId);
      }
      
      // Update Last Page URL in Intercom
      if (window.IntercomUtils && window.IntercomUtils.updateLastPageUrl) {
        window.IntercomUtils.updateLastPageUrl();
      }
      
      // Redirect after successful login
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-6">Log In</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#e53935] focus:border-[#e53935]"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/reset-password" className="text-sm text-[#e53935] hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#e53935] focus:border-[#e53935]"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#e53935] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e53935] ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#e53935] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
