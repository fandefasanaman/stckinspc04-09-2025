import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types';
import { auth } from '../config/firebase';

export class ArticleServiceWithFallback {
  private static collectionName = 'articles';
  private static localArticles = new Map<string, Article>();

  // Créer un nouvel article avec fallback
  static async createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC ArticleService.createArticle:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- User email:', auth.currentUser?.email);
    console.log('- Données article:', articleData);
    console.log('- DB config:', db.app.options);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');
    
    const now = new Date().toISOString();
    const newArticle = {
      ...articleData,
      currentStock: 0,
      status: 'normal' as const,
      createdAt: now,
      updatedAt: now
    };

    try {
      console.log('🚀 Tentative d\'écriture Firebase...');
      // Essayer d'abord Firebase
      const docRef = await addDoc(collection(db, this.collectionName), newArticle);
      console.log('✅ Article créé avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      console.error('- Stack:', (error as any).stack);
      
      // Fallback: sauvegarder localement
      const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const articleWithId = { ...newArticle, id: localId };
      
      this.localArticles.set(localId, articleWithId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('create', articleWithId);
      
      console.log('💾 Article sauvegardé localement avec ID:', localId);
      
      return localId;
    }
  }

  // Mettre à jour un article avec fallback
  static async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      // Essayer d'abord Firebase
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);
      console.log('Article mis à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.warn('Erreur Firebase lors de la mise à jour, sauvegarde locale:', error);
      
      // Fallback: sauvegarder localement
      const existingArticle = this.localArticles.get(id);
      if (existingArticle) {
        const updatedArticle = { ...existingArticle, ...updateData };
        this.localArticles.set(id, updatedArticle);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('update', { id, ...updateData });
    }
  }

  // Mettre à jour le stock avec transaction et fallback
  static async updateStock(id: string, newStock: number): Promise<void> {
    try {
      // Essayer d'abord Firebase avec transaction
      await runTransaction(db, async (transaction) => {
        const articleRef = doc(db, this.collectionName, id);
        const articleDoc = await transaction.get(articleRef);
        
        if (!articleDoc.exists()) {
          throw new Error('Article non trouvé');
        }

        const article = articleDoc.data() as Article;
        
        // Déterminer le nouveau statut
        let status: 'normal' | 'low' | 'out' = 'normal';
        if (newStock === 0) {
          status = 'out';
        } else if (newStock <= article.minStock) {
          status = 'low';
        }

        transaction.update(articleRef, {
          currentStock: newStock,
          status,
          lastEntry: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      console.log('Stock mis à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.warn('Erreur Firebase lors de la mise à jour du stock, sauvegarde locale:', error);
      
      // Fallback: mise à jour locale
      const existingArticle = this.localArticles.get(id);
      if (existingArticle) {
        let status: 'normal' | 'low' | 'out' = 'normal';
        if (newStock === 0) {
          status = 'out';
        } else if (newStock <= existingArticle.minStock) {
          status = 'low';
        }

        const updatedArticle = {
          ...existingArticle,
          currentStock: newStock,
          status,
          lastEntry: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.localArticles.set(id, updatedArticle);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('updateStock', { id, newStock });
    }
  }

  // Supprimer un article avec fallback
  static async deleteArticle(id: string): Promise<void> {
    try {
      // Essayer d'abord Firebase
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      console.log('Article supprimé avec succès de Firebase:', id);
    } catch (error) {
      console.warn('Erreur Firebase lors de la suppression, marquage local:', error);
      
      // Fallback: marquer comme supprimé localement
      const existingArticle = this.localArticles.get(id);
      if (existingArticle) {
        this.localArticles.delete(id);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('delete', { id });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    // Sauvegarder les opérations en attente dans localStorage
    const pendingOps = JSON.parse(localStorage.getItem('pendingArticleOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingArticleOps', JSON.stringify(pendingOps));
    
    console.log(`Opération ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingArticleOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations en attente...`);
    
    const successfulOps: number[] = [];
    
    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      
      try {
        switch (op.operation) {
          case 'create':
            await addDoc(collection(db, this.collectionName), op.data);
            break;
          case 'update':
            const { id: updateId, ...updateData } = op.data;
            await updateDoc(doc(db, this.collectionName, updateId), updateData);
            break;
          case 'updateStock':
            await this.updateStock(op.data.id, op.data.newStock);
            break;
          case 'delete':
            await deleteDoc(doc(db, this.collectionName, op.data.id));
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
      localStorage.setItem('pendingArticleOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations synchronisées avec succès`);
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
}