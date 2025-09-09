import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';
import { auth } from '../config/firebase';
import { AuthService } from './authService';

export class UserServiceWithFallback {
  private static collectionName = 'users';
  private static localUsers = new Map<string, User>();

  // Créer un nouvel utilisateur avec fallback
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string): Promise<string> {
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC UserService.createUser:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- Données utilisateur:', userData);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    try {
      console.log('🚀 Tentative de création Firebase pour utilisateur...');
      const newUser = await AuthService.createUser(userData, password);
      console.log('✅ Utilisateur créé avec succès dans Firebase:', newUser.id);
      return newUser.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de l\'utilisateur:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      
      // Fallback: sauvegarder localement
      const localId = `local-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const userWithId = { 
        ...userData, 
        id: localId,
        createdAt: new Date().toISOString(),
        status: 'active' as const
      };
      
      this.localUsers.set(localId, userWithId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('create', { userData, password });
      
      console.log('💾 Utilisateur sauvegardé localement avec ID:', localId);
      
      return localId;
    }
  }

  // Mettre à jour un utilisateur avec fallback
  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      console.log('🚀 Tentative de mise à jour Firebase pour utilisateur:', id);
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updates);
      console.log('✅ Utilisateur mis à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la mise à jour de l\'utilisateur, sauvegarde locale:', error);
      
      // Fallback: sauvegarder localement
      const existingUser = this.localUsers.get(id);
      if (existingUser) {
        const updatedUser = { ...existingUser, ...updates };
        this.localUsers.set(id, updatedUser);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('update', { id, ...updates });
    }
  }

  // Désactiver un utilisateur avec fallback
  static async deactivateUser(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative de désactivation Firebase pour utilisateur:', id);
      await this.updateUser(id, { status: 'inactive' });
      console.log('✅ Utilisateur désactivé avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la désactivation de l\'utilisateur:', error);
      
      // Fallback: sauvegarder localement
      const existingUser = this.localUsers.get(id);
      if (existingUser) {
        const updatedUser = { ...existingUser, status: 'inactive' as const };
        this.localUsers.set(id, updatedUser);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('deactivate', { id });
    }
  }

  // Activer un utilisateur avec fallback
  static async activateUser(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative d\'activation Firebase pour utilisateur:', id);
      await this.updateUser(id, { status: 'active' });
      console.log('✅ Utilisateur activé avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de l\'activation de l\'utilisateur:', error);
      
      // Fallback: sauvegarder localement
      const existingUser = this.localUsers.get(id);
      if (existingUser) {
        const updatedUser = { ...existingUser, status: 'active' as const };
        this.localUsers.set(id, updatedUser);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('activate', { id });
    }
  }

  // Supprimer un utilisateur avec fallback
  static async deleteUser(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative de suppression Firebase pour utilisateur:', id);
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      console.log('✅ Utilisateur supprimé avec succès de Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la suppression de l\'utilisateur, marquage local:', error);
      
      // Fallback: marquer comme supprimé localement
      const existingUser = this.localUsers.get(id);
      if (existingUser) {
        this.localUsers.delete(id);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('delete', { id });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    const pendingOps = JSON.parse(localStorage.getItem('pendingUserOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingUserOps', JSON.stringify(pendingOps));
    
    console.log(`Opération utilisateur ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingUserOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations d'utilisateur en attente...`);
    
    const successfulOps: number[] = [];
    
    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      
      try {
        switch (op.operation) {
          case 'create':
            await AuthService.createUser(op.data.userData, op.data.password);
            break;
          case 'update':
            const { id: updateId, ...updateData } = op.data;
            await updateDoc(doc(db, this.collectionName, updateId), updateData);
            break;
          case 'deactivate':
            await updateDoc(doc(db, this.collectionName, op.data.id), { status: 'inactive' });
            break;
          case 'activate':
            await updateDoc(doc(db, this.collectionName, op.data.id), { status: 'active' });
            break;
          case 'delete':
            await deleteDoc(doc(db, this.collectionName, op.data.id));
            break;
        }
        
        successfulOps.push(i);
        console.log(`Opération utilisateur ${op.operation} synchronisée avec succès`);
      } catch (error) {
        console.warn(`Échec de synchronisation pour l'opération utilisateur ${op.operation}:`, error);
      }
    }
    
    // Supprimer les opérations réussies
    if (successfulOps.length > 0) {
      const remainingOps = pendingOps.filter((_, index) => !successfulOps.includes(index));
      localStorage.setItem('pendingUserOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations d'utilisateur synchronisées avec succès`);
    }
  }

  // Vérifier et synchroniser automatiquement
  static startAutoSync() {
    // Synchroniser immédiatement
    this.syncPendingOperations().catch(console.error);
    
    // Puis toutes les 30 secondes
    setInterval(() => {
      this.syncPendingOperations().catch(console.error);
    }, 30000);
  }

  // Obtenir les utilisateurs locaux (pour le fallback)
  static getLocalUsers(): User[] {
    return Array.from(this.localUsers.values());
  }
}