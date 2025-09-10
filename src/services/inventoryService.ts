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
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Inventory, InventoryItem } from '../types';

export class InventoryService {
  private static inventoriesCollection = 'inventories';
  private static inventoryItemsCollection = 'inventory_items';

  // Obtenir tous les inventaires
  static async getInventories(): Promise<Inventory[]> {
    try {
      const q = query(
        collection(db, this.inventoriesCollection),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Inventory));
    } catch (error) {
      console.error('Erreur lors de la récupération des inventaires:', error);
      throw new Error('Impossible de récupérer les inventaires');
    }
  }

  // Obtenir un inventaire par ID
  static async getInventoryById(id: string): Promise<Inventory | null> {
    try {
      const docRef = doc(db, this.inventoriesCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Inventory;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'inventaire:', error);
      throw new Error('Impossible de récupérer l\'inventaire');
    }
  }

  // Créer un nouvel inventaire
  static async createInventory(inventoryData: Omit<Inventory, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newInventory = {
        ...inventoryData,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.inventoriesCollection), newInventory);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'inventaire:', error);
      throw new Error('Impossible de créer l\'inventaire');
    }
  }

  // Mettre à jour un inventaire
  static async updateInventory(id: string, updates: Partial<Inventory>): Promise<void> {
    try {
      const docRef = doc(db, this.inventoriesCollection, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'inventaire:', error);
      throw new Error('Impossible de mettre à jour l\'inventaire');
    }
  }

  // Supprimer un inventaire
  static async deleteInventory(id: string): Promise<void> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Supprimer tous les éléments d'inventaire associés
        const itemsQuery = query(
          collection(db, this.inventoryItemsCollection),
          where('inventoryId', '==', id)
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        
        itemsSnapshot.docs.forEach(itemDoc => {
          transaction.delete(itemDoc.ref);
        });

        // Supprimer l'inventaire
        const inventoryRef = doc(db, this.inventoriesCollection, id);
        transaction.delete(inventoryRef);
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'inventaire:', error);
      throw new Error('Impossible de supprimer l\'inventaire');
    }
  }

  // Obtenir les éléments d'un inventaire
  static async getInventoryItems(inventoryId: string): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, this.inventoryItemsCollection),
        where('inventoryId', '==', inventoryId),
        orderBy('articleCode', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
    } catch (error) {
      console.error('Erreur lors de la récupération des éléments d\'inventaire:', error);
      throw new Error('Impossible de récupérer les éléments d\'inventaire');
    }
  }

  // Créer un élément d'inventaire
  static async createInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.inventoryItemsCollection), itemData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'élément d\'inventaire:', error);
      throw new Error('Impossible de créer l\'élément d\'inventaire');
    }
  }

  // Mettre à jour un élément d'inventaire
  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      const docRef = doc(db, this.inventoryItemsCollection, id);
      await updateDoc(docRef, {
        ...updates,
        countedAt: updates.physicalStock !== undefined ? new Date().toISOString() : undefined
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élément d\'inventaire:', error);
      throw new Error('Impossible de mettre à jour l\'élément d\'inventaire');
    }
  }

  // Valider un inventaire
  static async validateInventory(id: string, validatedBy: string): Promise<void> {
    try {
      await this.updateInventory(id, {
        status: 'validated',
        validatedAt: new Date().toISOString(),
        validatedBy
      });
    } catch (error) {
      console.error('Erreur lors de la validation de l\'inventaire:', error);
      throw new Error('Impossible de valider l\'inventaire');
    }
  }

  // Démarrer un inventaire
  static async startInventory(id: string, startedBy: string): Promise<void> {
    try {
      await this.updateInventory(id, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        startedBy
      });
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'inventaire:', error);
      throw new Error('Impossible de démarrer l\'inventaire');
    }
  }

  // Terminer un inventaire
  static async completeInventory(id: string, completedBy: string): Promise<void> {
    try {
      await this.updateInventory(id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        completedBy
      });
    } catch (error) {
      console.error('Erreur lors de la finalisation de l\'inventaire:', error);
      throw new Error('Impossible de finaliser l\'inventaire');
    }
  }

  // Compter un article dans l'inventaire
  static async countInventoryItem(itemId: string, physicalStock: number, countedBy: string, notes?: string): Promise<void> {
    try {
      // Récupérer l'élément pour calculer la différence
      const itemDoc = await getDoc(doc(db, this.inventoryItemsCollection, itemId));
      if (!itemDoc.exists()) {
        throw new Error('Élément d\'inventaire non trouvé');
      }
      
      const item = itemDoc.data() as InventoryItem;
      const difference = physicalStock - item.theoreticalStock;
      
      await this.updateInventoryItem(itemId, {
        physicalStock,
        difference,
        status: 'counted',
        countedBy,
        countedAt: new Date().toISOString(),
        notes
      });
    } catch (error) {
      console.error('Erreur lors du comptage de l\'élément:', error);
      throw new Error('Impossible de compter l\'élément');
    }
  }

  // Générer les éléments d'inventaire à partir des articles
  static async generateInventoryItems(inventoryId: string, articleIds: string[]): Promise<void> {
    try {
      const itemsPromises = articleIds.map(async (articleId) => {
        // Récupérer l'article
        const articleDoc = await getDoc(doc(db, 'articles', articleId));
        if (!articleDoc.exists()) return null;
        
        const article = articleDoc.data();
        
        const itemData: Omit<InventoryItem, 'id'> = {
          inventoryId,
          articleId,
          articleCode: article.code,
          articleName: article.name,
          theoreticalStock: article.currentStock,
          status: 'pending',
          location: article.location
        };
        
        return await this.createInventoryItem(itemData);
      });
      
      const results = await Promise.all(itemsPromises);
      const successfulItems = results.filter(Boolean);
      
      // Mettre à jour le nombre d'articles dans l'inventaire
      await this.updateInventory(inventoryId, {
        articlesCount: successfulItems.length
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération des éléments d\'inventaire:', error);
      throw new Error('Impossible de générer les éléments d\'inventaire');
    }
  }

  // Calculer les statistiques d'un inventaire
  static async calculateInventoryStats(inventoryId: string): Promise<{
    totalItems: number;
    countedItems: number;
    discrepancies: number;
    totalDifference: number;
  }> {
    try {
      const items = await this.getInventoryItems(inventoryId);
      
      return {
        totalItems: items.length,
        countedItems: items.filter(item => item.status === 'counted' || item.status === 'validated').length,
        discrepancies: items.filter(item => item.difference !== undefined && item.difference !== 0).length,
        totalDifference: items.reduce((sum, item) => sum + (item.difference || 0), 0)
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw new Error('Impossible de calculer les statistiques');
    }
  }

  // Appliquer les ajustements de stock après validation
  static async applyStockAdjustments(inventoryId: string, appliedBy: string): Promise<void> {
    try {
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
            
            // Déterminer le nouveau statut de stock
            let stockStatus: 'normal' | 'low' | 'out' = 'normal';
            if (item.physicalStock === 0) {
              stockStatus = 'out';
            } else {
              // On ne peut pas déterminer le statut sans connaître minStock
              // Il faudrait récupérer l'article complet
              stockStatus = 'normal';
            }
            
            transaction.update(articleRef, {
              currentStock: item.physicalStock,
              status: stockStatus,
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
    } catch (error) {
      console.error('Erreur lors de l\'application des ajustements:', error);
      throw new Error('Impossible d\'appliquer les ajustements');
    }
  }

  // Écouter les changements en temps réel
  static onInventoriesChange(callback: (inventories: Inventory[]) => void) {
    const q = query(
      collection(db, this.inventoriesCollection),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const inventories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Inventory));
      callback(inventories);
    });
  }

  // Écouter les changements des éléments d'inventaire
  static onInventoryItemsChange(inventoryId: string, callback: (items: InventoryItem[]) => void) {
    const q = query(
      collection(db, this.inventoryItemsCollection),
      where('inventoryId', '==', inventoryId),
      orderBy('articleCode', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
      callback(items);
    });
  }
}