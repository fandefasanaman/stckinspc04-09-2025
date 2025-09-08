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
        validatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la validation de l\'inventaire:', error);
      throw new Error('Impossible de valider l\'inventaire');
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