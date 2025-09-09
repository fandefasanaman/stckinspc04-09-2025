import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);

  // Timeout utility function
  const createTimeoutPromise = (ms: number, errorMessage: string) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), ms);
    });
  };

  useEffect(() => {
    // Set a maximum timeout for auth state initialization
    const initTimeout = setTimeout(() => {
      console.warn('Firebase auth initialization timeout - proceeding without authentication');
      setLoading(false);
    }, 15000); // 15 seconds timeout

    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      clearTimeout(initTimeout);
      setCurrentUser(user);
      
      if (user) {
        try {
          // Récupérer les données utilisateur avec timeout
          const userDataPromise = import('../services/userService').then(
            ({ UserService }) => UserService.getUserById(user.uid)
          );
          
          const timeoutPromise = createTimeoutPromise(10000, 'Timeout lors de la récupération des données utilisateur');
          
          const userDoc = await Promise.race([userDataPromise, timeoutPromise]);
          setUserData(userDoc as User | null);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          // En cas d'erreur, créer des données utilisateur basiques
          setUserData({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email || '',
            phone: '',
            role: 'user',
            service: 'Service par défaut',
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(initTimeout);
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (authTimeout) {
      clearTimeout(authTimeout);
    }
    
    setLoading(true);
    try {
      // Créer une promesse avec timeout pour la connexion
      const signInPromise = AuthService.signIn(email, password);
      const timeoutPromise = createTimeoutPromise(15000, 'Timeout de connexion - Vérifiez votre connexion internet');
      
      const { user, userData: userInfo } = await Promise.race([signInPromise, timeoutPromise]);
      setCurrentUser(user);
      setUserData(userInfo);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Ajouter un timeout pour la déconnexion
      const signOutPromise = AuthService.signOut();
      const timeoutPromise = createTimeoutPromise(5000, 'Timeout de déconnexion');
      
      await Promise.race([signOutPromise, timeoutPromise]);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion locale même si Firebase ne répond pas
      setCurrentUser(null);
      setUserData(null);
      throw error;
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => {
    try {
      return await AuthService.createUser(userData, password);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signIn,
    signOut,
    createUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};