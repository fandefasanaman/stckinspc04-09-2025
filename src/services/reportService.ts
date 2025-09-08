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

export interface ReportConfig {
  id: string;
  name: string;
  type: 'stock_status' | 'movements' | 'consumption' | 'inventory' | 'alerts';
  period: string;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDetails: boolean;
  services: string[];
  categories: string[];
  createdBy: string;
  createdAt: string;
  lastGenerated?: string;
}

export class ReportService {
  private static collectionName = 'reports';

  // Obtenir toutes les configurations de rapports
  static async getReportConfigs(): Promise<ReportConfig[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReportConfig));
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations de rapports:', error);
      throw new Error('Impossible de récupérer les configurations de rapports');
    }
  }

  // Obtenir une configuration de rapport par ID
  static async getReportConfigById(id: string): Promise<ReportConfig | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ReportConfig;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration de rapport:', error);
      throw new Error('Impossible de récupérer la configuration de rapport');
    }
  }

  // Créer une nouvelle configuration de rapport
  static async createReportConfig(configData: Omit<ReportConfig, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newConfig = {
        ...configData,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), newConfig);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la configuration de rapport:', error);
      throw new Error('Impossible de créer la configuration de rapport');
    }
  }

  // Mettre à jour une configuration de rapport
  static async updateReportConfig(id: string, updates: Partial<ReportConfig>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration de rapport:', error);
      throw new Error('Impossible de mettre à jour la configuration de rapport');
    }
  }

  // Supprimer une configuration de rapport
  static async deleteReportConfig(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration de rapport:', error);
      throw new Error('Impossible de supprimer la configuration de rapport');
    }
  }

  // Marquer un rapport comme généré
  static async markReportGenerated(id: string): Promise<void> {
    try {
      await this.updateReportConfig(id, {
        lastGenerated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de génération:', error);
      throw new Error('Impossible de mettre à jour le statut de génération');
    }
  }

  // Obtenir les configurations par utilisateur
  static async getReportConfigsByUser(userId: string): Promise<ReportConfig[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReportConfig));
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations par utilisateur:', error);
      throw new Error('Impossible de récupérer les configurations par utilisateur');
    }
  }

  // Écouter les changements en temps réel
  static onReportConfigsChange(callback: (configs: ReportConfig[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const configs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ReportConfig));
      callback(configs);
    });
  }
}