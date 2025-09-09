import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Supplier } from '../types';

export class SupplierService {
  private static collectionName = 'suppliers';

  // Obtenir tous les fournisseurs
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      throw new Error('Impossible de récupérer les fournisseurs');
    }
  }

  // Obtenir un fournisseur par ID
  static async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Supplier;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du fournisseur:', error);
      throw new Error('Impossible de récupérer le fournisseur');
    }
  }

  // Créer un nouveau fournisseur
  static async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const newSupplier = {
        ...supplierData,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.collectionName), newSupplier);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du fournisseur:', error);
      throw new Error('Impossible de créer le fournisseur');
    }
  }

  // Mettre à jour un fournisseur
  static async updateSupplier(id: string, updates: Partial<Supplier>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      throw new Error('Impossible de mettre à jour le fournisseur');
    }
  }

  // Supprimer un fournisseur
  static async deleteSupplier(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      throw new Error('Impossible de supprimer le fournisseur');
    }
  }

  // Obtenir les fournisseurs actifs
  static async getActiveSuppliers(): Promise<Supplier[]> {
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
      } as Supplier));
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs actifs:', error);
      throw new Error('Impossible de récupérer les fournisseurs actifs');
    }
  }

  // Obtenir les fournisseurs par catégorie
  static async getSuppliersByCategory(category: string): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('categories', 'array-contains', category),
        where('status', '==', 'active'),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs par catégorie:', error);
      throw new Error('Impossible de récupérer les fournisseurs par catégorie');
    }
  }

  // Écouter les changements en temps réel
  static onSuppliersChange(callback: (suppliers: Supplier[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const suppliers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
      callback(suppliers);
    });
  }
}