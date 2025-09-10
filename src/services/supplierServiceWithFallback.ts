import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Supplier } from '../types';
import { auth } from '../config/firebase';

export class SupplierServiceWithFallback {
  private static suppliersCollection = 'suppliers';
  private static localSuppliers = new Map<string, Supplier>();

  // Filtrer les fournisseurs par nom (synchrone)
  static filterSuppliersByName(searchTerm: string, suppliers: Supplier[]): Supplier[] {
    if (!searchTerm.trim()) {
      return suppliers;
    }
    
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Rechercher des fournisseurs par nom avec fallback
  static async searchSuppliersByName(searchTerm: string): Promise<Supplier[]> {
    console.log('🔍 DIAGNOSTIC SupplierService.searchSuppliersByName:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- Terme de recherche:', searchTerm);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    try {
      console.log('🚀 Tentative de recherche Firebase pour fournisseurs...');
      
      const q = query(
        collection(db, this.suppliersCollection),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const suppliers: Supplier[] = [];
      
      querySnapshot.forEach((doc) => {
        suppliers.push({ id: doc.id, ...doc.data() } as Supplier);
      });
      
      console.log('✅ Fournisseurs trouvés dans Firebase:', suppliers.length);
      return suppliers;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la recherche de fournisseurs:', error);
      
      // Fallback: rechercher dans les données locales
      const localSuppliers = Array.from(this.localSuppliers.values());
      const filteredSuppliers = localSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log('💾 Fournisseurs trouvés localement:', filteredSuppliers.length);
      return filteredSuppliers;
    }
  }

  // Obtenir ou créer un fournisseur par nom avec fallback
  static async getOrCreateSupplierByName(name: string): Promise<Supplier> {
    console.log('🔍 DIAGNOSTIC SupplierService.getOrCreateSupplierByName:');
    console.log('- Nom du fournisseur:', name);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    try {
      console.log('🚀 Tentative de recherche/création Firebase pour fournisseur...');
      
      // D'abord, chercher si le fournisseur existe déjà
      const q = query(
        collection(db, this.suppliersCollection),
        where('name', '==', name)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const supplier = { id: doc.id, ...doc.data() } as Supplier;
        console.log('✅ Fournisseur existant trouvé dans Firebase:', supplier.id);
        return supplier;
      }
      
      // Si le fournisseur n'existe pas, le créer
      const newSupplier: Omit<Supplier, 'id'> = {
        name,
        contact: '',
        email: '',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, this.suppliersCollection), newSupplier);
      const supplier = { id: docRef.id, ...newSupplier };
      
      console.log('✅ Nouveau fournisseur créé dans Firebase:', supplier.id);
      return supplier;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la recherche/création de fournisseur:', error);
      
      // Fallback: chercher localement ou créer localement
      const existingSupplier = Array.from(this.localSuppliers.values())
        .find(supplier => supplier.name === name);
      
      if (existingSupplier) {
        console.log('💾 Fournisseur existant trouvé localement:', existingSupplier.id);
        return existingSupplier;
      }
      
      // Créer un nouveau fournisseur local
      const localId = `local-supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newSupplier: Supplier = {
        id: localId,
        name,
        contact: '',
        email: '',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.localSuppliers.set(localId, newSupplier);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('createSupplier', newSupplier);
      
      console.log('💾 Nouveau fournisseur créé localement:', localId);
      return newSupplier;
    }
  }

  // Créer un fournisseur avec fallback
  static async createSupplier(supplierData: Omit<Supplier, 'id'>): Promise<string> {
    console.log('🔍 DIAGNOSTIC SupplierService.createSupplier:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- Données fournisseur:', supplierData);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    try {
      console.log('🚀 Tentative de création Firebase pour fournisseur...');
      
      const docRef = await addDoc(collection(db, this.suppliersCollection), {
        ...supplierData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Fournisseur créé avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création du fournisseur:', error);
      
      // Fallback: sauvegarder localement
      const localId = `local-supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const supplier = {
        id: localId,
        ...supplierData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.localSuppliers.set(localId, supplier);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('createSupplier', supplierData);
      
      console.log('💾 Fournisseur sauvegardé localement avec ID:', localId);
      return localId;
    }
  }

  // Mettre à jour un fournisseur avec fallback
  static async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<void> {
    try {
      console.log('🚀 Tentative de mise à jour Firebase pour fournisseur:', id);
      
      const docRef = doc(db, this.suppliersCollection, id);
      await updateDoc(docRef, {
        ...supplierData,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Fournisseur mis à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la mise à jour du fournisseur:', error);
      
      // Fallback: mettre à jour localement
      const existingSupplier = this.localSuppliers.get(id);
      if (existingSupplier) {
        const updatedSupplier = {
          ...existingSupplier,
          ...supplierData,
          updatedAt: new Date().toISOString()
        };
        this.localSuppliers.set(id, updatedSupplier);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('updateSupplier', { id, supplierData });
    }
  }

  // Supprimer un fournisseur avec fallback
  static async deleteSupplier(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative de suppression Firebase pour fournisseur:', id);
      
      const docRef = doc(db, this.suppliersCollection, id);
      await deleteDoc(docRef);
      
      console.log('✅ Fournisseur supprimé avec succès de Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la suppression du fournisseur:', error);
      
      // Fallback: supprimer localement
      this.localSuppliers.delete(id);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('deleteSupplier', { id });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    // Sauvegarder les opérations en attente dans localStorage
    const pendingOps = JSON.parse(localStorage.getItem('pendingSupplierOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingSupplierOps', JSON.stringify(pendingOps));
    
    console.log(`Opération ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingSupplierOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations de fournisseurs en attente...`);
    
    const successfulOps: number[] = [];
    
    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      
      try {
        switch (op.operation) {
          case 'createSupplier':
            await addDoc(collection(db, this.suppliersCollection), {
              ...op.data,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            break;
          case 'updateSupplier':
            await updateDoc(doc(db, this.suppliersCollection, op.data.id), {
              ...op.data.supplierData,
              updatedAt: new Date().toISOString()
            });
            break;
          case 'deleteSupplier':
            await deleteDoc(doc(db, this.suppliersCollection, op.data.id));
            break;
        }
        
        successfulOps.push(i);
        console.log(`Opération ${op.operation} synchronisée avec succès`);
      } catch (error) {
        console.warn(`Échec de synchronisation pour l'opération ${op.operation}:`, error);
      }
    }
    
    // Supprimer les opérations réussies
    if (successfulOps.length > 0) {
      const remainingOps = pendingOps.filter((_, index) => !successfulOps.includes(index));
      localStorage.setItem('pendingSupplierOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations de fournisseurs synchronisées avec succès`);
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

  // Obtenir les fournisseurs locaux (pour le fallback)
  static getLocalSuppliers(): Supplier[] {
    return Array.from(this.localSuppliers.values());
  }
}