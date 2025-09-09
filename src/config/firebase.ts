// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
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

// 🔍 DIAGNOSTIC Firebase Config
console.log('🔍 DIAGNOSTIC Firebase Config:');
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Auth Domain:', firebaseConfig.authDomain);
console.log('- App initialized:', app.name);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🚀 OPTIMISATION FIREBASE - Configuration pour de meilleurs timeouts
try {
  // Forcer le long polling pour des connexions plus stables
  if (typeof window !== 'undefined' && (db as any)._delegate) {
    (db as any)._delegate._databaseId.settings = {
      ...(db as any)._delegate._databaseId.settings,
      experimentalForceLongPolling: true,
      cacheSizeBytes: 40000000, // 40MB cache
      experimentalTabSynchronization: true
    };
  }
} catch (error) {
  console.warn('Impossible d\'optimiser les paramètres Firestore:', error);
}

// Test de connexion Firebase au démarrage
auth.onAuthStateChanged((user) => {
  console.log('🔍 Auth State Changed:', user ? `Connecté: ${user.uid}` : 'Déconnecté');
});

// Enable offline persistence avec gestion d'erreur améliorée
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
}).then(() => {
  console.log('✅ Firebase persistence activée');
});

export default app;