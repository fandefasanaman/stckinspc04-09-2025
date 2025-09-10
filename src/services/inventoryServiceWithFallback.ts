import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
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
    console.log('- User email:', auth.currentUser?.email);
    console.log('- Données inventaire:', inventoryData);
    console.log('- DB config:', db.app.options);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');
    
    const newInventory = {
      ...inventoryData,
      createdAt: new Date().toISOString()
    };

    try {
      console.log('🚀 Tentative d\'écriture Firebase pour inventaire...');
      // Essayer d'abord Firebase
      const docRef = await addDoc(collection(db, this.inventoriesCollection), newInventory);
      console.log('✅ Inventaire créé avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de l\'inventaire:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      console.error('- Stack:', (error as any).stack);
      
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
      // Essayer d'abord Firebase
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
      
      // Essayer d'abord Firebase avec transaction pour supprimer aussi les items
      await runTransaction(db, async (transaction) => {
        // Supprimer l'inventaire
        const inventoryRef = doc(db, this.inventoriesCollection, id);
        transaction.delete(inventoryRef);
        
        // Note: Les items d'inventaire seront supprimés par les règles de cascade ou séparément
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
      // Essayer d'abord Firebase
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
      // Essayer d'abord Firebase
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

  // Démarrer un inventaire avec fallback
  static async startInventory(id: string, startedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de démarrage Firebase pour inventaire:', id);
      await this.updateInventory(id, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        startedBy
      });
      console.log('✅ Inventaire démarré avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors du démarrage de l\'inventaire:', error);
      
      // Fallback: sauvegarder localement
      const existingInventory = this.localInventories.get(id);
      if (existingInventory) {
        const updatedInventory = {
          ...existingInventory,
          status: 'in_progress' as const,
          startedAt: new Date().toISOString(),
          startedBy
        };
        this.localInventories.set(id, updatedInventory);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('start', { id, startedBy });
    }
  }

  // Terminer un inventaire avec fallback
  static async completeInventory(id: string, completedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de finalisation Firebase pour inventaire:', id);
      await this.updateInventory(id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        completedBy
      });
      console.log('✅ Inventaire finalisé avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la finalisation de l\'inventaire:', error);
      
      // Fallback: sauvegarder localement
      const existingInventory = this.localInventories.get(id);
      if (existingInventory) {
        const updatedInventory = {
          ...existingInventory,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          completedBy
        };
        this.localInventories.set(id, updatedInventory);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('complete', { id, completedBy });
    }
  }

  // Valider un inventaire avec fallback
  static async validateInventory(id: string, validatedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de validation Firebase pour inventaire:', id);
      await this.updateInventory(id, {
        status: 'validated',
        validatedAt: new Date().toISOString(),
        validatedBy
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
          validatedAt: new Date().toISOString(),
          validatedBy
        };
        this.localInventories.set(id, updatedInventory);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('validate', { id, validatedBy });
    }
  }

  // Compter un article dans l'inventaire avec fallback
  static async countInventoryItem(itemId: string, physicalStock: number, countedBy: string, notes?: string): Promise<void> {
    const updateData = {
      physicalStock,
      difference: undefined as number | undefined,
      status: 'counted' as const,
      countedBy,
      countedAt: new Date().toISOString(),
      notes
    };

    try {
      console.log('🚀 Tentative de comptage Firebase pour élément d\'inventaire:', itemId);
      
      // Calculer la différence en récupérant d'abord l'élément
      const itemRef = doc(db, this.inventoryItemsCollection, itemId);
      const itemDoc = await getDoc(itemRef);
      
      if (itemDoc.exists()) {
        const item = itemDoc.data() as InventoryItem;
        updateData.difference = physicalStock - item.theoreticalStock;
      }
      
      await updateDoc(itemRef, updateData);
      console.log('✅ Élément d\'inventaire compté avec succès dans Firebase:', itemId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors du comptage de l\'élément d\'inventaire:', error);
      
      // Fallback: sauvegarder localement
      const existingItem = this.localInventoryItems.get(itemId);
      if (existingItem) {
        updateData.difference = physicalStock - existingItem.theoreticalStock;
        const updatedItem = { ...existingItem, ...updateData };
        this.localInventoryItems.set(itemId, updatedItem);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('countItem', { itemId, ...updateData });
    }
  }

  // Générer les éléments d'inventaire à partir des articles avec fallback
  static async generateInventoryItems(inventoryId: string, articleIds: string[]): Promise<void> {
    try {
      console.log('🚀 Tentative de génération Firebase pour éléments d\'inventaire:', inventoryId);
      
      // Récupérer les articles pour créer les éléments d'inventaire
      const articlesPromises = articleIds.map(async (articleId) => {
        const articleRef = doc(db, 'articles', articleId);
        const articleDoc = await getDoc(articleRef);
        return articleDoc.exists() ? { id: articleDoc.id, ...articleDoc.data() } : null;
      });
      
      const articles = (await Promise.all(articlesPromises)).filter(Boolean);
      
      // Créer les éléments d'inventaire
      const itemsPromises = articles.map(async (article: any) => {
        const itemData: Omit<InventoryItem, 'id'> = {
          inventoryId,
          articleId: article.id,
          articleCode: article.code,
          articleName: article.name,
          theoreticalStock: article.currentStock,
          status: 'pending',
          location: article.location
        };
        
        return await addDoc(collection(db, this.inventoryItemsCollection), itemData);
      });
      
      await Promise.all(itemsPromises);
      
      // Mettre à jour le nombre d'articles dans l'inventaire
      await this.updateInventory(inventoryId, {
        articlesCount: articles.length
      });
      
      console.log('✅ Éléments d\'inventaire générés avec succès dans Firebase:', articles.length);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la génération des éléments d\'inventaire:', error);
      
      // Fallback: créer localement (version simplifiée)
      articleIds.forEach((articleId, index) => {
        const localItemId = `local-item-${inventoryId}-${index}-${Date.now()}`;
        const itemData: InventoryItem = {
          id: localItemId,
          inventoryId,
          articleId,
          articleCode: `ART${index + 1}`,
          articleName: `Article ${index + 1}`,
          theoreticalStock: 0,
          status: 'pending'
        };
        
        this.localInventoryItems.set(localItemId, itemData);
      });
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('generateItems', { inventoryId, articleIds });
    }
  }

  // Calculer les statistiques d'un inventaire avec fallback
  static async calculateInventoryStats(inventoryId: string): Promise<{
    totalItems: number;
    countedItems: number;
    discrepancies: number;
    totalDifference: number;
  }> {
    try {
      console.log('🚀 Calcul des statistiques Firebase pour inventaire:', inventoryId);
      const items = await this.getInventoryItems(inventoryId);
      
      const stats = {
        totalItems: items.length,
        countedItems: items.filter(item => item.status === 'counted' || item.status === 'validated').length,
        discrepancies: items.filter(item => item.difference !== undefined && item.difference !== 0).length,
        totalDifference: items.reduce((sum, item) => sum + (item.difference || 0), 0)
      };
      
      console.log('✅ Statistiques calculées avec succès:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques d\'inventaire:', error);
      
      // Fallback: calculer avec les données locales
      const localItems = Array.from(this.localInventoryItems.values())
        .filter(item => item.inventoryId === inventoryId);
      
      return {
        totalItems: localItems.length,
        countedItems: localItems.filter(item => item.status === 'counted' || item.status === 'validated').length,
        discrepancies: localItems.filter(item => item.difference !== undefined && item.difference !== 0).length,
        totalDifference: localItems.reduce((sum, item) => sum + (item.difference || 0), 0)
      };
    }
  }

  // Obtenir les éléments d'un inventaire avec fallback
  static async getInventoryItems(inventoryId: string): Promise<InventoryItem[]> {
    try {
      console.log('🚀 Tentative de récupération Firebase pour éléments d\'inventaire:', inventoryId);
      const q = query(
        collection(db, this.inventoryItemsCollection),
        where('inventoryId', '==', inventoryId),
        orderBy('articleCode', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
      
      console.log('✅ Éléments d\'inventaire récupérés avec succès de Firebase:', items.length);
      return items;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la récupération des éléments d\'inventaire:', error);
      
      // Fallback: retourner les éléments locaux pour cet inventaire
      const localItems = Array.from(this.localInventoryItems.values())
        .filter(item => item.inventoryId === inventoryId);
      console.log('💾 Utilisation des éléments d\'inventaire locaux:', localItems.length);
      return localItems;
    }
  }

  // Appliquer les ajustements de stock après validation avec fallback
  static async applyStockAdjustments(inventoryId: string, appliedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative d\'application des ajustements Firebase pour inventaire:', inventoryId);
      
      await runTransaction(db, async (transaction) => {
        // Récupérer tous les éléments d'inventaire avec des différences
        const itemsQuery = query(
          collection(db, this.inventoryItemsCollection),
          where('inventoryId', '==', inventoryId),
          where('status', '==', 'counted')
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        
        // Appliquer les ajustements pour chaque élément avec différence
        itemsSnapshot.docs.forEach(itemDoc => {
          const item = itemDoc.data() as InventoryItem;
          
          if (item.difference !== undefined && item.difference !== 0 && item.physicalStock !== undefined) {
            // Mettre à jour le stock de l'article
            const articleRef = doc(db, 'articles', item.articleId);
            transaction.update(articleRef, {
              currentStock: item.physicalStock,
              lastEntry: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            // Marquer l'élément comme validé
            transaction.update(itemDoc.ref, {
              status: 'validated',
              validatedAt: new Date().toISOString(),
              validatedBy: appliedBy
            });
          }
        });
        
        // Marquer l'inventaire comme validé
        const inventoryRef = doc(db, this.inventoriesCollection, inventoryId);
        transaction.update(inventoryRef, {
          status: 'validated',
          validatedAt: new Date().toISOString(),
          validatedBy: appliedBy
        });
      });
      
      console.log('✅ Ajustements appliqués avec succès dans Firebase pour inventaire:', inventoryId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de l\'application des ajustements:', error);
      
      // Fallback: marquer localement
      const existingInventory = this.localInventories.get(inventoryId);
      if (existingInventory) {
        const updatedInventory = {
          ...existingInventory,
          status: 'validated' as const,
          validatedAt: new Date().toISOString(),
          validatedBy: appliedBy
        };
        this.localInventories.set(inventoryId, updatedInventory);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('applyAdjustments', { inventoryId, appliedBy });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    // Sauvegarder les opérations en attente dans localStorage
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
          case 'start':
            await updateDoc(doc(db, this.inventoriesCollection, op.data.id), {
              status: 'in_progress',
              startedAt: new Date().toISOString(),
              startedBy: op.data.startedBy
            });
            break;
          case 'complete':
            await updateDoc(doc(db, this.inventoriesCollection, op.data.id), {
              status: 'completed',
              completedAt: new Date().toISOString(),
              completedBy: op.data.completedBy
            });
            break;
          case 'createItem':
            await addDoc(collection(db, this.inventoryItemsCollection), op.data);
            break;
          case 'updateItem':
            const { id: itemUpdateId, ...itemUpdateData } = op.data;
            await updateDoc(doc(db, this.inventoryItemsCollection, itemUpdateId), itemUpdateData);
            break;
          case 'countItem':
            const { itemId: countItemId, ...countData } = op.data;
            await updateDoc(doc(db, this.inventoryItemsCollection, countItemId), countData);
            break;
          case 'generateItems':
            await this.generateInventoryItems(op.data.inventoryId, op.data.articleIds);
            break;
          case 'applyAdjustments':
            await this.applyStockAdjustments(op.data.inventoryId, op.data.appliedBy);
            break;
          case 'validate':
            await updateDoc(doc(db, this.inventoriesCollection, op.data.id), {
              status: 'validated',
              validatedAt: new Date().toISOString(),
              validatedBy: op.data.validatedBy
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