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

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await import('../services/userService').then(
            ({ UserService }) => UserService.getUserById(user.uid)
          );
          setUserData(userDoc);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, userData: userInfo } = await AuthService.signIn(email, password);
      setCurrentUser(user);
      setUserData(userInfo);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
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