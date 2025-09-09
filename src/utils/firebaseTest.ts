// 🔧 Utilitaires de test Firebase pour diagnostic
import { auth, db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

export class FirebaseTestUtils {
  
  // Test complet de Firebase
  static async runFullDiagnostic(): Promise<void> {
    console.log('🔍 === DIAGNOSTIC FIREBASE COMPLET ===');
    
    // 1. Test de configuration
    console.log('1️⃣ Configuration Firebase:');
    console.log('- Project ID:', db.app.options.projectId);
    console.log('- Auth Domain:', db.app.options.authDomain);
    console.log('- App Name:', db.app.name);
    
    // 2. Test de réseau
    console.log('2️⃣ État réseau:');
    console.log('- Navigator online:', navigator.onLine);
    console.log('- User agent:', navigator.userAgent);
    
    // 3. Test d'authentification
    console.log('3️⃣ Test authentification:');
    await this.testAuthentication();
    
    // 4. Test Firestore
    console.log('4️⃣ Test Firestore:');
    await this.testFirestore();
    
    console.log('🔍 === FIN DIAGNOSTIC ===');
  }
  
  // Test d'authentification
  static async testAuthentication(): Promise<void> {
    try {
      console.log('🧪 Test authentification anonyme...');
      
      // Déconnexion d'abord si connecté
      if (auth.currentUser) {
        await signOut(auth);
        console.log('- Déconnexion effectuée');
      }
      
      // Connexion anonyme
      const result = await signInAnonymously(auth);
      console.log('✅ Authentification anonyme réussie');
      console.log('- User ID:', result.user.uid);
      console.log('- Anonymous:', result.user.isAnonymous);
      
    } catch (error: any) {
      console.error('❌ Erreur authentification:', error.code, error.message);
      console.error('- Détails:', error);
    }
  }
  
  // Test Firestore
  static async testFirestore(): Promise<void> {
    try {
      console.log('🧪 Test écriture Firestore...');
      
      // Test d'écriture
      const testData = {
        message: 'Test diagnostic',
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: auth.currentUser?.uid || 'anonymous'
      };
      
      const docRef = await addDoc(collection(db, 'diagnostic_test'), testData);
      console.log('✅ Écriture Firestore réussie');
      console.log('- Document ID:', docRef.id);
      
      // Test de lecture
      console.log('🧪 Test lecture Firestore...');
      const querySnapshot = await getDocs(collection(db, 'diagnostic_test'));
      console.log('✅ Lecture Firestore réussie');
      console.log('- Documents trouvés:', querySnapshot.size);
      
    } catch (error: any) {
      console.error('❌ Erreur Firestore:', error.code, error.message);
      console.error('- Détails:', error);
      
      // Test avec règles permissives
      await this.testWithPermissiveRules();
    }
  }
  
  // Test avec des règles ultra-permissives
  static async testWithPermissiveRules(): Promise<void> {
    console.log('🧪 Test avec collection publique...');
    try {
      const publicData = {
        message: 'Test public',
        timestamp: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'public_test'), publicData);
      console.log('✅ Écriture collection publique réussie:', docRef.id);
      
    } catch (error: any) {
      console.error('❌ Même les règles publiques échouent:', error.code, error.message);
    }
  }
  
  // Test de règles Firestore spécifiques
  static async testFirestoreRules(): Promise<void> {
    console.log('🧪 Test des règles Firestore...');
    
    const testCollections = ['articles', 'users', 'movements', 'test'];
    
    for (const collectionName of testCollections) {
      try {
        console.log(`- Test collection: ${collectionName}`);
        
        // Test lecture
        const readSnapshot = await getDocs(collection(db, collectionName));
        console.log(`  ✅ Lecture OK (${readSnapshot.size} docs)`);
        
        // Test écriture
        const testDoc = {
          test: true,
          timestamp: new Date(),
          userId: auth.currentUser?.uid
        };
        
        const writeRef = await addDoc(collection(db, collectionName), testDoc);
        console.log(`  ✅ Écriture OK (${writeRef.id})`);
        
      } catch (error: any) {
        console.error(`  ❌ Erreur ${collectionName}:`, error.code);
      }
    }
  }
  
  // Afficher les informations système
  static logSystemInfo(): void {
    console.log('🔍 === INFORMATIONS SYSTÈME ===');
    console.log('- URL:', window.location.href);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Online:', navigator.onLine);
    console.log('- Cookies enabled:', navigator.cookieEnabled);
    console.log('- Language:', navigator.language);
    console.log('- Platform:', navigator.platform);
    console.log('- Local Storage available:', typeof Storage !== 'undefined');
    console.log('- IndexedDB available:', typeof indexedDB !== 'undefined');
  }
}

// Fonction globale pour diagnostic rapide
(window as any).firebaseTest = FirebaseTestUtils;