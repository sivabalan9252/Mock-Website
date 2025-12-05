import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { firebaseApp } from '../firebase/config';
import {
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockSignOut,
  mockOnAuthStateChanged,
  mockSendPasswordResetEmail
} from '../firebase/mockAuth';

// Check if we should use mock authentication
const USE_MOCK_AUTH = process.env.REACT_APP_USE_MOCK_AUTH === 'true';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = USE_MOCK_AUTH ? null : getAuth(firebaseApp);

  useEffect(() => {
    if (USE_MOCK_AUTH) {
      console.log('🔧 Using MOCK Authentication for local development');
      // Use mock auth state observer
      const unsubscribe = mockOnAuthStateChanged((mockUser) => {
        setUser(mockUser);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Set up Firebase auth state observer
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [auth]);

  // Sign up with email/password
  const signup = async (email, password) => {
    try {
      if (USE_MOCK_AUTH) {
        return await mockCreateUserWithEmailAndPassword(email, password);
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  // Sign in with email/password
  const login = async (email, password) => {
    try {
      if (USE_MOCK_AUTH) {
        const result = await mockSignInWithEmailAndPassword(email, password);
        return result.user;
      }
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const logout = () => {
    if (USE_MOCK_AUTH) {
      return mockSignOut();
    }
    return signOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    if (USE_MOCK_AUTH) {
      return mockSendPasswordResetEmail(email);
    }
    return sendPasswordResetEmail(auth, email);
  };

  // Value to be provided to consumers of this context
  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
