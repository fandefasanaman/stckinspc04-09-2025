// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB07WXC39_F8HcWDdJALCcoQQBV6fkTsQ8",
  authDomain: "stock-inspc.firebaseapp.com",
  projectId: "stock-inspc",
  storageBucket: "stock-inspc.firebasestorage.app",
  messagingSenderId: "362164706962",
  appId: "1:362164706962:web:9432c8116db61f35aa104b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('Firebase persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.warn('Firebase persistence not supported by this browser');
  } else {
    console.error('Firebase persistence error:', err);
  }
});

export default app;