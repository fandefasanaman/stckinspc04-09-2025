import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Movement, Article } from '../types';
import { ArticleService } from './articleService';

export class MovementService {
  private static collectionName = 'movements';

  // Obtenir tous les mouvements
  static async getMovements(limitCount?: number): Promise<Movement[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movement));
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      throw new Error('Impossible de récupérer les mouvements');
    }
  }

  // Obtenir les mouvements récents
  static async getRecentMovements(limitCount: number = 10): Promise<Movement[]> {
    return this.getMovements(limitCount);
  }

  // Obtenir les mouvements par type
  static async getMovementsByType(type: 'entry' | 'exit'): Promise<Movement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movement));
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements par type:', error);
      throw new Error('Impossible de récupérer les mouvements');
    }
  }

  // Obtenir les mouvements par service
  static async getMovementsByService(service: string): Promise<Movement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('service', '==', service),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movement));
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements par service:', error);
      throw new Error('Impossible de récupérer les mouvements');
    }
  }

  // Créer une entrée de stock
  static async createStockEntry(entryData: {
    articleId: string;
    quantity: number;
    supplierId?: string;
    deliveryNote?: string;
    receivedDate?: string;
    batchNumber?: string;
    expiryDate?: string;
    qualityCheck?: 'pending' | 'passed' | 'failed';
    qualityNotes?: string;
    location?: string;
    reference?: string;
    notes?: string;
    userId: string;
    userName: string;
    service: string;
  }): Promise<string> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Récupérer l'article
        const articleRef = doc(db, 'articles', entryData.articleId);
        const articleDoc = await transaction.get(articleRef);
        
        if (!articleDoc.exists()) {
          throw new Error('Article non trouvé');
        }

        const article = articleDoc.data() as Article;
        const newStock = article.currentStock + entryData.quantity;

        // Déterminer le nouveau statut
        let status: 'normal' | 'low' | 'out' = 'normal';
        if (newStock === 0) {
          status = 'out';
        } else if (newStock <= article.minStock) {
          status = 'low';
        }

        // Créer le mouvement
        const movement: Omit<Movement, 'id'> = {
          type: 'entry',
          articleId: entryData.articleId,
          articleCode: article.code,
          articleName: article.name,
          quantity: entryData.quantity,
          unit: article.unit,
          userId: entryData.userId,
          userName: entryData.userName,
          service: entryData.service,
          supplierId: entryData.supplierId,
          deliveryNote: entryData.deliveryNote,
          receivedDate: entryData.receivedDate,
          batchNumber: entryData.batchNumber,
          expiryDate: entryData.expiryDate,
          qualityCheck: entryData.qualityCheck || 'pending',
          qualityNotes: entryData.qualityNotes,
          location: entryData.location,
          reference: entryData.reference,
          notes: entryData.notes,
          status: entryData.qualityCheck === 'failed' ? 'pending' : 'validated',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          validatedBy: entryData.userId,
          validatedAt: new Date().toISOString()
        };

        const movementRef = doc(collection(db, this.collectionName));
        transaction.set(movementRef, movement);

        // Mettre à jour le stock de l'article
        transaction.update(articleRef, {
          currentStock: newStock,
          status,
          batchNumber: entryData.batchNumber,
          expiryDate: entryData.expiryDate,
          location: entryData.location,
          lastEntry: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        return movementRef.id;
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'entrée:', error);
      throw new Error(error.message || 'Impossible de créer l\'entrée de stock');
    }
  }

  // Créer une sortie de stock
  static async createStockExit(exitData: {
    articleId: string;
    quantity: number;
    beneficiary: string;
    reason: string;
    reference?: string;
    notes?: string;
    userId: string;
    userName: string;
    service: string;
  }): Promise<string> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Récupérer l'article
        const articleRef = doc(db, 'articles', exitData.articleId);
        const articleDoc = await transaction.get(articleRef);
        
        if (!articleDoc.exists()) {
          throw new Error('Article non trouvé');
        }

        const article = articleDoc.data() as Article;
        
        // Vérifier si le stock est suffisant
        if (article.currentStock < exitData.quantity) {
          throw new Error('Stock insuffisant pour cette sortie');
        }

        const newStock = article.currentStock - exitData.quantity;

        // Déterminer le nouveau statut
        let status: 'normal' | 'low' | 'out' = 'normal';
        if (newStock === 0) {
          status = 'out';
        } else if (newStock <= article.minStock) {
          status = 'low';
        }

        // Créer le mouvement
        const movement: Omit<Movement, 'id'> = {
          type: 'exit',
          articleId: exitData.articleId,
          articleCode: article.code,
          articleName: article.name,
          quantity: exitData.quantity,
          unit: article.unit,
          userId: exitData.userId,
          userName: exitData.userName,
          service: exitData.service,
          beneficiary: exitData.beneficiary,
          reason: exitData.reason,
          reference: exitData.reference,
          notes: exitData.notes,
          status: 'pending', // Les sorties nécessitent une validation
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString()
        };

        const movementRef = doc(collection(db, this.collectionName));
        transaction.set(movementRef, movement);

        // Mettre à jour le stock de l'article
        transaction.update(articleRef, {
          currentStock: newStock,
          status,
          updatedAt: new Date().toISOString()
        });

        return movementRef.id;
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de la sortie:', error);
      throw new Error(error.message || 'Impossible de créer la sortie de stock');
    }
  }

  // Valider un mouvement
  static async validateMovement(movementId: string, validatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, movementId);
      await updateDoc(docRef, {
        status: 'validated',
        validatedBy,
        validatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la validation du mouvement:', error);
      throw new Error('Impossible de valider le mouvement');
    }
  }

  // Rejeter un mouvement
  static async rejectMovement(movementId: string, rejectedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, movementId);
      await updateDoc(docRef, {
        status: 'rejected',
        validatedBy: rejectedBy,
        validatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors du rejet du mouvement:', error);
      throw new Error('Impossible de rejeter le mouvement');
    }
  }

  // Écouter les changements en temps réel
  static onMovementsChange(callback: (movements: Movement[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const movements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Movement));
      callback(movements);
    });
  }
}