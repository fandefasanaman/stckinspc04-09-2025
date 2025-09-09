import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

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

export class ReportServiceWithFallback {
  private static collectionName = 'reports';
  private static localReports = new Map<string, ReportConfig>();

  // Créer une nouvelle configuration de rapport avec fallback
  static async createReportConfig(configData: Omit<ReportConfig, 'id' | 'createdAt'>): Promise<string> {
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC ReportService.createReportConfig:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- Données rapport:', configData);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    const newConfig = {
      ...configData,
      createdAt: new Date().toISOString()
    };

    try {
      console.log('🚀 Tentative d\'écriture Firebase pour configuration de rapport...');
      const docRef = await addDoc(collection(db, this.collectionName), newConfig);
      console.log('✅ Configuration de rapport créée avec succès dans Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création de la configuration de rapport:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      
      // Fallback: sauvegarder localement
      const localId = `local-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const configWithId = { ...newConfig, id: localId };
      
      this.localReports.set(localId, configWithId);
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('create', configWithId);
      
      console.log('💾 Configuration de rapport sauvegardée localement avec ID:', localId);
      
      return localId;
    }
  }

  // Mettre à jour une configuration de rapport avec fallback
  static async updateReportConfig(id: string, updates: Partial<ReportConfig>): Promise<void> {
    try {
      console.log('🚀 Tentative de mise à jour Firebase pour configuration de rapport:', id);
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updates);
      console.log('✅ Configuration de rapport mise à jour avec succès dans Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la mise à jour de la configuration de rapport, sauvegarde locale:', error);
      
      // Fallback: sauvegarder localement
      const existingConfig = this.localReports.get(id);
      if (existingConfig) {
        const updatedConfig = { ...existingConfig, ...updates };
        this.localReports.set(id, updatedConfig);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('update', { id, ...updates });
    }
  }

  // Supprimer une configuration de rapport avec fallback
  static async deleteReportConfig(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative de suppression Firebase pour configuration de rapport:', id);
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      console.log('✅ Configuration de rapport supprimée avec succès de Firebase:', id);
    } catch (error) {
      console.warn('❌ Erreur Firebase lors de la suppression de la configuration de rapport, marquage local:', error);
      
      // Fallback: marquer comme supprimé localement
      const existingConfig = this.localReports.get(id);
      if (existingConfig) {
        this.localReports.delete(id);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('delete', { id });
    }
  }

  // Marquer un rapport comme généré avec fallback
  static async markReportGenerated(id: string): Promise<void> {
    try {
      console.log('🚀 Tentative de marquage Firebase pour rapport généré:', id);
      await this.updateReportConfig(id, {
        lastGenerated: new Date().toISOString()
      });
      console.log('✅ Rapport marqué comme généré avec succès dans Firebase:', id);
    } catch (error) {
      console.error('❌ Erreur Firebase lors du marquage du rapport comme généré:', error);
      
      // Fallback: sauvegarder localement
      const existingConfig = this.localReports.get(id);
      if (existingConfig) {
        const updatedConfig = {
          ...existingConfig,
          lastGenerated: new Date().toISOString()
        };
        this.localReports.set(id, updatedConfig);
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('markGenerated', { id });
    }
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    const pendingOps = JSON.parse(localStorage.getItem('pendingReportOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingReportOps', JSON.stringify(pendingOps));
    
    console.log(`Opération rapport ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingReportOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations de rapport en attente...`);
    
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
          case 'delete':
            await deleteDoc(doc(db, this.collectionName, op.data.id));
            break;
          case 'markGenerated':
            await updateDoc(doc(db, this.collectionName, op.data.id), {
              lastGenerated: new Date().toISOString()
            });
            break;
        }
        
        successfulOps.push(i);
        console.log(`Opération rapport ${op.operation} synchronisée avec succès`);
      } catch (error) {
        console.warn(`Échec de synchronisation pour l'opération rapport ${op.operation}:`, error);
      }
    }
    
    // Supprimer les opérations réussies
    if (successfulOps.length > 0) {
      const remainingOps = pendingOps.filter((_, index) => !successfulOps.includes(index));
      localStorage.setItem('pendingReportOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations de rapport synchronisées avec succès`);
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

  // Obtenir les configurations de rapport locales (pour le fallback)
  static getLocalReportConfigs(): ReportConfig[] {
    return Array.from(this.localReports.values());
  }
}