import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMzON1UfDModd455j7CmRkzGVzBAom1lc",
  authDomain: "mock-website-db214.firebaseapp.com",
  projectId: "mock-website-db214",
  storageBucket: "mock-website-db214.firebasestorage.app",
  messagingSenderId: "626958642346",
  appId: "1:626958642346:web:f351f2827ed684d85774d3"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export default firebaseApp;
