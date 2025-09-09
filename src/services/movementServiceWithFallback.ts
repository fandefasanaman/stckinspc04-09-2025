import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Movement, Article } from '../types';
import { auth } from '../config/firebase';

export class MovementServiceWithFallback {
  private static movementsCollection = 'movements';
  private static articlesCollection = 'articles';
  private static localMovements = new Map<string, Movement>();

  // Créer une entrée de stock avec fallback
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
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC MovementService.createStockEntry:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- Données entrée:', entryData);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    try {
      console.log('🚀 Tentative d\'écriture Firebase pour entrée de stock...');
      
      // Essayer d'abord Firebase avec transaction
      const movementId = await runTransaction(db, async (transaction) => {
        // Récupérer l'article
        const articleRef = doc(db, this.articlesCollection, entryData.articleId);
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

        const movementRef = doc(collection(db, this.movementsCollection));
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

      console.log('✅ Entrée de stock créée avec succès dans Firebase:', movementId);
      return movementId;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de l\'entrée:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      
      // Fallback: sauvegarder localement
      const localId = `local-entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const movementData = {
        id: localId,
        type: 'entry' as const,
        articleId: entryData.articleId,
        articleCode: 'UNKNOWN', // Sera mis à jour lors de la sync
        articleName: 'Article inconnu',
        quantity: entryData.quantity,
        unit: 'unité',
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
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };
      
      this.localMovements.set(localId, movementData);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('createStockEntry', entryData);
      
      console.log('💾 Entrée de stock sauvegardée localement avec ID:', localId);
      
      return localId;
    }
  }

  // Créer une sortie de stock avec fallback
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
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC MovementService.createStockExit:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- Données sortie:', exitData);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    try {
      console.log('🚀 Tentative d\'écriture Firebase pour sortie de stock...');
      
      // Essayer d'abord Firebase avec transaction
      const movementId = await runTransaction(db, async (transaction) => {
        // Récupérer l'article
        const articleRef = doc(db, this.articlesCollection, exitData.articleId);
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

        const movementRef = doc(collection(db, this.movementsCollection));
        transaction.set(movementRef, movement);

        // Mettre à jour le stock de l'article
        transaction.update(articleRef, {
          currentStock: newStock,
          status,
          updatedAt: new Date().toISOString()
        });

        return movementRef.id;
      });

      console.log('✅ Sortie de stock créée avec succès dans Firebase:', movementId);
      return movementId;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de la sortie:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      
      // Fallback: sauvegarder localement
      const localId = `local-exit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const movementData = {
        id: localId,
        type: 'exit' as const,
        articleId: exitData.articleId,
        articleCode: 'UNKNOWN', // Sera mis à jour lors de la sync
        articleName: 'Article inconnu',
        quantity: exitData.quantity,
        unit: 'unité',
        userId: exitData.userId,
        userName: exitData.userName,
        service: exitData.service,
        beneficiary: exitData.beneficiary,
        reason: exitData.reason,
        reference: exitData.reference,
        notes: exitData.notes,
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };
      
      this.localMovements.set(localId, movementData);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('createStockExit', exitData);
      
      console.log('💾 Sortie de stock sauvegardée localement avec ID:', localId);
      
      return localId;
    }
  }

  // Valider un mouvement avec fallback
  static async validateMovement(movementId: string, validatedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de validation Firebase pour mouvement:', movementId);
      
      const docRef = doc(db, this.movementsCollection, movementId);
      await updateDoc(docRef, {
        status: 'validated',
        validatedBy,
        validatedAt: new Date().toISOString()
      });
      
      console.log('✅ Mouvement validé avec succès dans Firebase:', movementId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la validation:', error);
      
      // Fallback: sauvegarder localement
      const existingMovement = this.localMovements.get(movementId);
      if (existingMovement) {
        const updatedMovement = {
          ...existingMovement,
          status: 'validated' as const,
          validatedBy,
          validatedAt: new Date().toISOString()
        };
        this.localMovements.set(movementId, updatedMovement);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('validateMovement', { movementId, validatedBy });
    }
  }

  // Rejeter un mouvement avec fallback
  static async rejectMovement(movementId: string, rejectedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de rejet Firebase pour mouvement:', movementId);
      
      const docRef = doc(db, this.movementsCollection, movementId);
      await updateDoc(docRef, {
        status: 'rejected',
        validatedBy: rejectedBy,
        validatedAt: new Date().toISOString()
      });
      
      console.log('✅ Mouvement rejeté avec succès dans Firebase:', movementId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors du rejet:', error);
      
      // Fallback: sauvegarder localement
      const existingMovement = this.localMovements.get(movementId);
      if (existingMovement) {
        const updatedMovement = {
          ...existingMovement,
          status: 'rejected' as const,
          validatedBy: rejectedBy,
          validatedAt: new Date().toISOString()
        };
        this.localMovements.set(movementId, updatedMovement);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('rejectMovement', { movementId, rejectedBy });
    }
  }

  // Supprimer un mouvement avec fallback
  static async deleteMovement(movementId: string): Promise<void> {
    try {
      console.log('🚀 Tentative de suppression Firebase pour mouvement:', movementId);
      
      const docRef = doc(db, this.movementsCollection, movementId);
      await deleteDoc(docRef);
      
      console.log('✅ Mouvement supprimé avec succès de Firebase:', movementId);
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la suppression:', error);
      
      // Fallback: marquer comme supprimé localement
      const existingMovement = this.localMovements.get(movementId);
      if (existingMovement) {
        this.localMovements.delete(movementId);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('deleteMovement', { movementId });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    // Sauvegarder les opérations en attente dans localStorage
    const pendingOps = JSON.parse(localStorage.getItem('pendingMovementOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingMovementOps', JSON.stringify(pendingOps));
    
    console.log(`Opération ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingMovementOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations de mouvements en attente...`);
    
    const successfulOps: number[] = [];
    
    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      
      try {
        switch (op.operation) {
          case 'createStockEntry':
            await this.createStockEntry(op.data);
            break;
          case 'createStockExit':
            await this.createStockExit(op.data);
            break;
          case 'validateMovement':
            await updateDoc(doc(db, this.movementsCollection, op.data.movementId), {
              status: 'validated',
              validatedBy: op.data.validatedBy,
              validatedAt: new Date().toISOString()
            });
            break;
          case 'rejectMovement':
            await updateDoc(doc(db, this.movementsCollection, op.data.movementId), {
              status: 'rejected',
              validatedBy: op.data.rejectedBy,
              validatedAt: new Date().toISOString()
            });
            break;
          case 'deleteMovement':
            await deleteDoc(doc(db, this.movementsCollection, op.data.movementId));
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
      localStorage.setItem('pendingMovementOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations de mouvements synchronisées avec succès`);
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

  // Obtenir les mouvements locaux (pour le fallback)
  static getLocalMovements(): Movement[] {
    return Array.from(this.localMovements.values());
  }
}