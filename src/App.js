import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './hooks/useAuth';

import IntercomUtils from './utils/IntercomUtils';
import { loadIntercom } from './utils/loadIntercom';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Load the Intercom script with the app ID.
    // The script will automatically initialize itself using window.intercomSettings.
    loadIntercom(process.env.REACT_APP_INTERCOM_APP_ID);
  }, []);

  // Update Last Page URL on route change
  useEffect(() => {
    if (window.IntercomUtils) {
      // We only want to update the Last Page URL when a chat is initiated
      // This will be handled by the onShow and onMessageSent event handlers
      // set up in the IntercomUtils
      console.debug('Route changed to:', location.pathname);
    }
  }, [location]);

  // Make IntercomUtils available globally
  useEffect(() => {
    window.identifyIntercomUser = IntercomUtils.identifyUser.bind(IntercomUtils);
  }, []);

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
