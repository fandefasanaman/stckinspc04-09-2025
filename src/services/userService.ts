import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export class UserService {
  private static collectionName = 'users';

  // Obtenir tous les utilisateurs
  static async getUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error('Impossible de récupérer les utilisateurs');
    }
  }

  // Obtenir un utilisateur par ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new Error('Impossible de récupérer l\'utilisateur');
    }
  }

  // Obtenir les utilisateurs par service
  static async getUsersByService(service: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('service', '==', service),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par service:', error);
      throw new Error('Impossible de récupérer les utilisateurs par service');
    }
  }

  // Obtenir les utilisateurs par rôle
  static async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('role', '==', role),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
      throw new Error('Impossible de récupérer les utilisateurs par rôle');
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new Error('Impossible de mettre à jour l\'utilisateur');
    }
  }

  // Désactiver un utilisateur
  static async deactivateUser(id: string): Promise<void> {
    try {
      await this.updateUser(id, { status: 'inactive' });
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
      throw new Error('Impossible de désactiver l\'utilisateur');
    }
  }

  // Activer un utilisateur
  static async activateUser(id: string): Promise<void> {
    try {
      await this.updateUser(id, { status: 'active' });
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'utilisateur:', error);
      throw new Error('Impossible d\'activer l\'utilisateur');
    }
  }

  // Supprimer un utilisateur (attention: supprime aussi l'authentification)
  static async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw new Error('Impossible de supprimer l\'utilisateur');
    }
  }

  // Obtenir les utilisateurs actifs
  static async getActiveUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs actifs:', error);
      throw new Error('Impossible de récupérer les utilisateurs actifs');
    }
  }

  // Écouter les changements en temps réel
  static onUsersChange(callback: (users: User[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      callback(users);
    });
  }
}