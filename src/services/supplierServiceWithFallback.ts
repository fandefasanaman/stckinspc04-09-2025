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
  private static initialized = false;

  // Initialiser les fournisseurs par défaut
  static async initializeDefaultSuppliers(): Promise<void> {
    if (this.initialized) return;

    const defaultSuppliers: Omit<Supplier, 'id'>[] = [
      {
        name: 'SODIM ANDRAHARO',
        code: 'SOD001',
        contact: {
          email: 'contact@sodim.mg',
          phone: '+261 20 22 123 45',
          address: 'Andraharo, Antananarivo'
        },
        categories: ['Consommables Médicaux'],
        status: 'active',
        notes: 'Fournisseur principal de médicaments',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'DISTRIMAD',
        code: 'DIS001',
        contact: {
          email: 'commercial@distrimad.mg',
          phone: '+261 20 22 234 56',
          address: 'Antananarivo'
        },
        categories: ['Fournitures Bureau'],
        status: 'active',
        notes: 'Fournitures de bureau et consommables',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'SOCOBIS',
        code: 'SOC001',
        contact: {
          email: 'it@socobis.mg',
          phone: '+261 20 22 345 67',
          address: 'Antananarivo'
        },
        categories: ['Consommables IT'],
        status: 'active',
        notes: 'Matériel informatique et consommables IT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'PHARMADIS MADAGASCAR',
        code: 'PHA001',
        contact: {
          email: 'client@pharmadis.mg',
          phone: '+261 20 22 456 78',
          address: 'Antananarivo'
        },
        categories: ['Consommables Médicaux'],
        status: 'active',
        notes: 'Distribution pharmaceutique',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Sauvegarder localement d'abord
    defaultSuppliers.forEach((supplier, index) => {
      const id = `default-supplier-${index + 1}`;
      this.localSuppliers.set(id, { ...supplier, id });
    });

    try {
      // Essayer de sauvegarder dans Firebase
      for (const supplier of defaultSuppliers) {
        await addDoc(collection(db, this.suppliersCollection), supplier);
      }
      console.log('✅ Fournisseurs par défaut initialisés dans Firebase');
    } catch (error) {
      console.warn('⚠️ Impossible d\'initialiser les fournisseurs dans Firebase, utilisation du fallback local');
    }

    this.initialized = true;
  }

  // Créer un nouveau fournisseur avec fallback
  static async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('🔍 DIAGNOSTIC SupplierService.createSupplier:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- Données fournisseur:', supplierData);

    try {
      const newSupplier = {
        ...supplierData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.suppliersCollection), newSupplier);
      console.log('✅ Fournisseur créé avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création du fournisseur:', error);
      
      // Fallback: sauvegarder localement
      const localId = `local-supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const supplierWithId = {
        ...supplierData,
        id: localId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.localSuppliers.set(localId, supplierWithId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('createSupplier', supplierData);
      
      console.log('💾 Fournisseur sauvegardé localement avec ID:', localId);
      return localId;
    }
  }

  // Mettre à jour un fournisseur
  static async updateSupplier(supplierId: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(db, this.suppliersCollection, supplierId);
      await updateDoc(docRef, updateData);
      console.log('✅ Fournisseur mis à jour avec succès dans Firebase:', supplierId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la mise à jour du fournisseur:', error);
      
      // Fallback: mettre à jour localement
      const existingSupplier = this.localSuppliers.get(supplierId);
      if (existingSupplier) {
        const updatedSupplier = {
          ...existingSupplier,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        this.localSuppliers.set(supplierId, updatedSupplier);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('updateSupplier', { supplierId, updates });
    }
  }

  // Supprimer un fournisseur
  static async deleteSupplier(supplierId: string): Promise<void> {
    try {
      const docRef = doc(db, this.suppliersCollection, supplierId);
      await deleteDoc(docRef);
      console.log('✅ Fournisseur supprimé avec succès de Firebase:', supplierId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la suppression du fournisseur:', error);
      
      // Fallback: supprimer localement
      this.localSuppliers.delete(supplierId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('deleteSupplier', { supplierId });
    }
  }

  // Rechercher des fournisseurs par nom
  static searchSuppliersByName(searchTerm: string, allSuppliers: Supplier[] = []): Supplier[] {
    // Utiliser d'abord les données fournies, sinon les données locales
    const suppliersToSearch = allSuppliers.length > 0 ? allSuppliers : Array.from(this.localSuppliers.values());
    
    if (!searchTerm || searchTerm.trim() === '') {
      return suppliersToSearch.slice(0, 10);
    }

    const term = searchTerm.toLowerCase().trim();
    
    return suppliersToSearch.filter(supplier => 
      supplier.name.toLowerCase().includes(term) ||
      supplier.code.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  // Obtenir ou créer un fournisseur par nom
  static async getOrCreateSupplierByName(supplierName: string): Promise<Supplier> {
    try {
      // Rechercher d'abord dans Firebase
      const q = query(
        collection(db, this.suppliersCollection),
        where('name', '==', supplierName.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Supplier;
      }
      
      // Si pas trouvé, créer un nouveau fournisseur
      const newSupplierId = await this.createSupplier({
        name: supplierName.trim(),
        code: `SUP${Date.now().toString().slice(-6)}`,
        contact: {},
        categories: [],
        status: 'active',
        notes: 'Fournisseur créé automatiquement'
      });
      
      return {
        id: newSupplierId,
        name: supplierName.trim(),
        code: `SUP${Date.now().toString().slice(-6)}`,
        contact: {},
        categories: [],
        status: 'active',
        notes: 'Fournisseur créé automatiquement',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erreur lors de la résolution du fournisseur:', error);
      
      // Fallback: créer localement
      const localId = `local-supplier-${Date.now()}`;
      const supplier: Supplier = {
        id: localId,
        name: supplierName.trim(),
        code: `SUP${Date.now().toString().slice(-6)}`,
        contact: {},
        categories: [],
        status: 'active',
        notes: 'Fournisseur créé automatiquement (local)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.localSuppliers.set(localId, supplier);
      return supplier;
    }
  }

  // Obtenir tous les fournisseurs
  static async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.suppliersCollection));
      const suppliers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
      
      return suppliers;
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération Firebase, utilisation du fallback local');
      
      // Fallback: retourner les fournisseurs locaux
      return Array.from(this.localSuppliers.values());
    }
  }

  // Résoudre un nom de fournisseur en ID
  static async resolveSupplierNameToId(supplierName: string): Promise<string | null> {
    try {
      const suppliers = await this.getAllSuppliers();
      const supplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
      return supplier?.id || null;
    } catch (error) {
      console.error('Erreur lors de la résolution du nom de fournisseur:', error);
      return null;
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
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
            await updateDoc(doc(db, this.suppliersCollection, op.data.supplierId), {
              ...op.data.updates,
              updatedAt: new Date().toISOString()
            });
            break;
          case 'deleteSupplier':
            await deleteDoc(doc(db, this.suppliersCollection, op.data.supplierId));
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

  // Démarrer la synchronisation automatique
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