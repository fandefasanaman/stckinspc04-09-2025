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
import { StockLocation } from '../types';

export class LocationService {
  private static collectionName = 'locations';

  // Obtenir tous les emplacements
  static async getLocations(): Promise<StockLocation[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockLocation));
    } catch (error) {
      console.error('Erreur lors de la récupération des emplacements:', error);
      throw new Error('Impossible de récupérer les emplacements');
    }
  }

  // Obtenir un emplacement par ID
  static async getLocationById(id: string): Promise<StockLocation | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as StockLocation;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'emplacement:', error);
      throw new Error('Impossible de récupérer l\'emplacement');
    }
  }

  // Créer un nouvel emplacement
  static async createLocation(locationData: Omit<StockLocation, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newLocation = {
        ...locationData,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), newLocation);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'emplacement:', error);
      throw new Error('Impossible de créer l\'emplacement');
    }
  }

  // Mettre à jour un emplacement
  static async updateLocation(id: string, updates: Partial<StockLocation>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'emplacement:', error);
      throw new Error('Impossible de mettre à jour l\'emplacement');
    }
  }

  // Supprimer un emplacement
  static async deleteLocation(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emplacement:', error);
      throw new Error('Impossible de supprimer l\'emplacement');
    }
  }

  // Obtenir les emplacements actifs
  static async getActiveLocations(): Promise<StockLocation[]> {
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
      } as StockLocation));
    } catch (error) {
      console.error('Erreur lors de la récupération des emplacements actifs:', error);
      throw new Error('Impossible de récupérer les emplacements actifs');
    }
  }

  // Écouter les changements en temps réel
  static onLocationsChange(callback: (locations: StockLocation[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const locations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockLocation));
      callback(locations);
    });
  }
}