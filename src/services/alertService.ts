import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { StockAlert, Article } from '../types';

export class AlertService {
  private static collectionName = 'alerts';

  // Obtenir toutes les alertes
  static async getAlerts(): Promise<StockAlert[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockAlert));
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw new Error('Impossible de récupérer les alertes');
    }
  }

  // Obtenir les alertes par type
  static async getAlertsByType(type: StockAlert['type']): Promise<StockAlert[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockAlert));
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes par type:', error);
      throw new Error('Impossible de récupérer les alertes');
    }
  }

  // Créer une alerte de stock faible
  static async createLowStockAlert(article: Article): Promise<string> {
    try {
      let priority: StockAlert['priority'] = 'medium';
      
      if (article.currentStock === 0) {
        priority = 'critical';
      } else if (article.currentStock <= article.minStock * 0.5) {
        priority = 'high';
      } else if (article.currentStock <= article.minStock * 0.8) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      const alert: Omit<StockAlert, 'id'> = {
        type: article.currentStock === 0 ? 'out_of_stock' : 'low_stock',
        articleId: article.id,
        articleCode: article.code,
        articleName: article.name,
        currentStock: article.currentStock,
        minStock: article.minStock,
        priority,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), alert);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      throw new Error('Impossible de créer l\'alerte');
    }
  }

  // Créer une alerte de produit expirant
  static async createExpiringAlert(article: Article, expiryDate: string): Promise<string> {
    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let priority: StockAlert['priority'] = 'low';
      if (daysUntilExpiry <= 7) {
        priority = 'critical';
      } else if (daysUntilExpiry <= 30) {
        priority = 'high';
      } else if (daysUntilExpiry <= 60) {
        priority = 'medium';
      }

      const alert: Omit<StockAlert, 'id'> = {
        type: 'expiring',
        articleId: article.id,
        articleCode: article.code,
        articleName: article.name,
        expiryDate,
        priority,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), alert);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte d\'expiration:', error);
      throw new Error('Impossible de créer l\'alerte d\'expiration');
    }
  }

  // Résoudre une alerte
  static async resolveAlert(alertId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, alertId);
      await updateDoc(docRef, {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'alerte:', error);
      throw new Error('Impossible de résoudre l\'alerte');
    }
  }

  // Vérifier et créer les alertes automatiquement
  static async checkAndCreateAlerts(articles: Article[]): Promise<void> {
    try {
      for (const article of articles) {
        // Vérifier si une alerte existe déjà pour cet article
        const existingAlerts = await this.getAlertsByArticle(article.id);
        const hasActiveAlert = existingAlerts.some(alert => alert.status === 'active');

        if (!hasActiveAlert) {
          if (article.currentStock === 0 || article.currentStock <= article.minStock) {
            await this.createLowStockAlert(article);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes:', error);
    }
  }

  // Obtenir les alertes pour un article spécifique
  private static async getAlertsByArticle(articleId: string): Promise<StockAlert[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('articleId', '==', articleId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockAlert));
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes par article:', error);
      return [];
    }
  }

  // Écouter les changements en temps réel
  static onAlertsChange(callback: (alerts: StockAlert[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', 'active'),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockAlert));
      callback(alerts);
    });
  }
}