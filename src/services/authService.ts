import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  // Connexion utilisateur
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Récupérer les données utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Mettre à jour la dernière connexion
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        });
        
        return { user, userData };
      } else {
        throw new Error('Données utilisateur non trouvées');
      }
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const user = userCredential.user;
      
      // Créer le document utilisateur dans Firestore
      const newUser: User = {
        ...userData,
        id: user.uid,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      await setDoc(doc(db, 'users', user.uid), newUser);
      
      return newUser;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Déconnexion
  static async signOut() {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  // Observer l'état d'authentification
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Obtenir l'utilisateur actuel
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Messages d'erreur en français
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      default:
        return 'Une erreur est survenue lors de l\'authentification';
    }
  }
}