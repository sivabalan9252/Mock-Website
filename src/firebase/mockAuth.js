/**
 * Mock Authentication for Local Development
 * Provides static user authentication without Firebase
 */

// Read Intercom test identity from environment (with fallbacks for local dev)
const INTERCOM_TEST_EMAIL = (process.env.REACT_APP_INTERCOM_TEST_EMAIL || 'sivabalan9252@gmail.com').toLowerCase();
const INTERCOM_TEST_USER_ID = process.env.REACT_APP_INTERCOM_TEST_USER_ID || 'sg0009';

// Static user credentials for development
const MOCK_USER = {
  email: INTERCOM_TEST_EMAIL,
  password: 'Spizor@2024',
  uid: INTERCOM_TEST_USER_ID, // Intercom user_id
  name: 'Siva Balan',
  displayName: 'Siva Balan'
};

// Store current mock user in memory
let currentMockUser = null;

/**
 * Mock sign in with email and password
 */
export const mockSignInWithEmailAndPassword = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    currentMockUser = {
      uid: MOCK_USER.uid,
      email: MOCK_USER.email,
      displayName: MOCK_USER.name,
      emailVerified: true
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('mockUser', JSON.stringify(currentMockUser));
    
    console.log('✅ Mock Auth: User signed in successfully', currentMockUser.email);
    return { user: currentMockUser };
  } else {
    const error = new Error('Invalid email or password');
    error.code = 'auth/wrong-password';
    throw error;
  }
};

/**
 * Mock sign up with email and password
 */
export const mockCreateUserWithEmailAndPassword = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For mock mode, we'll only allow the predefined user
  if (email === MOCK_USER.email) {
    currentMockUser = {
      uid: MOCK_USER.uid,
      email: MOCK_USER.email,
      displayName: MOCK_USER.name,
      emailVerified: true
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('mockUser', JSON.stringify(currentMockUser));
    
    console.log('✅ Mock Auth: User created successfully', currentMockUser.email);
    return currentMockUser;
  } else {
    const error = new Error('Email already in use (mock mode - use sivabalan9252@gmail.com)');
    error.code = 'auth/email-already-in-use';
    throw error;
  }
};

/**
 * Mock sign out
 */
export const mockSignOut = async () => {
  currentMockUser = null;
  localStorage.removeItem('mockUser');
  console.log('✅ Mock Auth: User signed out');
};

/**
 * Mock auth state observer
 */
export const mockOnAuthStateChanged = (callback) => {
  // Check localStorage for persisted user
  try {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      currentMockUser = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error('Mock Auth: Error loading stored user', err);
  }
  
  // Call callback immediately with current user
  setTimeout(() => callback(currentMockUser), 100);
  
  // Return unsubscribe function
  return () => {
    console.log('Mock Auth: Unsubscribed from auth state changes');
  };
};

/**
 * Mock password reset
 */
export const mockSendPasswordResetEmail = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('✅ Mock Auth: Password reset email sent to', email);
};

const mockAuthExports = {
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockSignOut,
  mockOnAuthStateChanged,
  mockSendPasswordResetEmail,
  MOCK_USER
};

export default mockAuthExports;
