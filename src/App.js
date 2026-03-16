import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './hooks/useAuth';

import { loadIntercom, bootIntercomWithJWT, shutdownIntercom } from './utils/loadIntercom';

const INTERCOM_APP_ID = process.env.REACT_APP_INTERCOM_APP_ID || 'v77sghen';

function AppContent() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Load the Intercom script once on mount
  useEffect(() => {
    loadIntercom(INTERCOM_APP_ID);
  }, []);

  // When auth state changes, boot Intercom accordingly
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch JWT from our API and boot Intercom securely
      const bootWithJWT = async () => {
        try {
          const normalizedEmail = (user.email || '').toLowerCase().trim();
          const userId = user.uid || normalizedEmail;

          const response = await fetch('/api/intercom-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              email: normalizedEmail,
            }),
          });

          if (response.ok) {
            const { token } = await response.json();
            bootIntercomWithJWT(
              {
                user_id: userId,
                email: normalizedEmail,
                name: user.displayName || 'User',
                created_at: Math.floor(Date.now() / 1000),
              },
              token
            );
          } else {
            console.error('Intercom: Failed to fetch JWT token');
          }
        } catch (err) {
          console.error('Intercom: Error fetching JWT', err);
        }
      };
      bootWithJWT();
    } else {
      // User logged out — shutdown and reboot as anonymous
      shutdownIntercom();
    }
  }, [isAuthenticated, user]);

  // Update Intercom on route change
  useEffect(() => {
    if (window.Intercom && typeof window.Intercom === 'function') {
      window.Intercom('update');
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
