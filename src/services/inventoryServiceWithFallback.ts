import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Inventory, InventoryItem } from '../types';
import { auth } from '../config/firebase';

export class InventoryServiceWithFallback {
  private static inventoriesCollection = 'inventories';
  private static inventoryItemsCollection = 'inventory_items';
  private static localInventories = new Map<string, Inventory>();
  private static localInventoryItems = new Map<string, InventoryItem>();

  // Créer un nouvel inventaire avec fallback
  static async createInventory(inventoryData: Omit<Inventory, 'id' | 'createdAt'>): Promise<string> {
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC InventoryService.createInventory:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- Données inventaire:', inventoryData);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    const newInventory = {
      ...inventoryData,
      createdAt: new Date().toISOString()
    };

    try {
      console.log('🚀 Tentative d\'écriture Firebase pour inventaire...');
      const docRef = await addDoc(collection(db, this.inventoriesCollection), newInventory);
      console.log('✅ Inventaire créé avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de l\'inventaire:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      
      // Fallback: sauvegarder localement
      const localId = `local-inventory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const inventoryWithId = { ...newInventory, id: localId };
      
      this.localInventories.set(localId, inventoryWithId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('create', inventoryWithId);
      
      console.log('💾 Inventaire sauvegardé localement avec ID:', localId);
      
      return localId;
    }
  }

  // Mettre à jour un inventaire avec fallback
  static async updateInventory(id: string, updates: Partial<Inventory>): Promise<void> {
    try {
      console.log('🚀 Tentative de mise à jour Firebase pour inventaire:', id);
      const docRef = doc(db, this.inventoriesCollection, id);
      await updateDoc(docRef, updates);
      console.log('✅ Inventaire mis à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la mise à jour de l\'inventaire, sauvegarde locale:', error);
      
      // Fallback: sauvegarder localement
      const existingInventory = this.localInventories.get(id);
      if (existingInventory) {
        const updatedInventory = { ...existingInventory, ...updates };
        this.localInventories.set(id, updatedInventory);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('update', { id, ...updates });
    }
  }

  // Supprimer un inventaire avec fallback
  static async deleteInventory(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative de suppression Firebase pour inventaire:', id);
      
      // Utiliser une transaction pour supprimer l'inventaire et ses éléments
      await runTransaction(db, async (transaction) => {
        // Supprimer l'inventaire
        const inventoryRef = doc(db, this.inventoriesCollection, id);
        transaction.delete(inventoryRef);
        
        // Note: Les éléments d'inventaire seront supprimés par une requête séparée
        // car les transactions ne supportent pas les requêtes complexes
      });
      
      console.log('✅ Inventaire supprimé avec succès de Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la suppression de l\'inventaire, marquage local:', error);
      
      // Fallback: marquer comme supprimé localement
      const existingInventory = this.localInventories.get(id);
      if (existingInventory) {
        this.localInventories.delete(id);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('delete', { id });
    }
  }

  // Créer un élément d'inventaire avec fallback
  static async createInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<string> {
    try {
      console.log('🚀 Tentative d\'écriture Firebase pour élément d\'inventaire...');
      const docRef = await addDoc(collection(db, this.inventoryItemsCollection), itemData);
      console.log('✅ Élément d\'inventaire créé avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de l\'élément d\'inventaire:', error);
      
      // Fallback: sauvegarder localement
      const localId = `local-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const itemWithId = { ...itemData, id: localId };
      
      this.localInventoryItems.set(localId, itemWithId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('createItem', itemWithId);
      
      console.log('💾 Élément d\'inventaire sauvegardé localement avec ID:', localId);
      
      return localId;
    }
  }

  // Mettre à jour un élément d'inventaire avec fallback
  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const updateData = {
      ...updates,
      countedAt: updates.physicalStock !== undefined ? new Date().toISOString() : undefined
    };

    try {
      console.log('🚀 Tentative de mise à jour Firebase pour élément d\'inventaire:', id);
      const docRef = doc(db, this.inventoryItemsCollection, id);
      await updateDoc(docRef, updateData);
      console.log('✅ Élément d\'inventaire mis à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la mise à jour de l\'élément d\'inventaire, sauvegarde locale:', error);
      
      // Fallback: sauvegarder localement
      const existingItem = this.localInventoryItems.get(id);
      if (existingItem) {
        const updatedItem = { ...existingItem, ...updateData };
        this.localInventoryItems.set(id, updatedItem);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('updateItem', { id, ...updateData });
    }
  }

  // Valider un inventaire avec fallback
  static async validateInventory(id: string, validatedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de validation Firebase pour inventaire:', id);
      await this.updateInventory(id, {
        status: 'validated',
        validatedAt: new Date().toISOString()
      });
      console.log('✅ Inventaire validé avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la validation de l\'inventaire:', error);
      
      // Fallback: sauvegarder localement
      const existingInventory = this.localInventories.get(id);
      if (existingInventory) {
        const updatedInventory = {
          ...existingInventory,
          status: 'validated' as const,
          validatedAt: new Date().toISOString()
        };
        this.localInventories.set(id, updatedInventory);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('validate', { id, validatedBy });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    const pendingOps = JSON.parse(localStorage.getItem('pendingInventoryOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingInventoryOps', JSON.stringify(pendingOps));
    
    console.log(`Opération inventaire ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingInventoryOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations d'inventaire en attente...`);
    
    const successfulOps: number[] = [];
    
    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      
      try {
        switch (op.operation) {
          case 'create':
            await addDoc(collection(db, this.inventoriesCollection), op.data);
            break;
          case 'update':
            const { id: updateId, ...updateData } = op.data;
            await updateDoc(doc(db, this.inventoriesCollection, updateId), updateData);
            break;
          case 'delete':
            await deleteDoc(doc(db, this.inventoriesCollection, op.data.id));
            break;
          case 'createItem':
            await addDoc(collection(db, this.inventoryItemsCollection), op.data);
            break;
          case 'updateItem':
            const { id: itemUpdateId, ...itemUpdateData } = op.data;
            await updateDoc(doc(db, this.inventoryItemsCollection, itemUpdateId), itemUpdateData);
            break;
          case 'validate':
            await updateDoc(doc(db, this.inventoriesCollection, op.data.id), {
              status: 'validated',
              validatedAt: new Date().toISOString()
            });
            break;
        }
        
        successfulOps.push(i);
        console.log(`Opération inventaire ${op.operation} synchronisée avec succès`);
      } catch (error) {
        console.warn(`Échec de synchronisation pour l'opération inventaire ${op.operation}:`, error);
      }
    }
    
    // Supprimer les opérations réussies
    if (successfulOps.length > 0) {
      const remainingOps = pendingOps.filter((_, index) => !successfulOps.includes(index));
      localStorage.setItem('pendingInventoryOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations d'inventaire synchronisées avec succès`);
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

  // Obtenir les inventaires locaux (pour le fallback)
  static getLocalInventories(): Inventory[] {
    return Array.from(this.localInventories.values());
  }

  // Obtenir les éléments d'inventaire locaux (pour le fallback)
  static getLocalInventoryItems(): InventoryItem[] {
    return Array.from(this.localInventoryItems.values());
  }
}