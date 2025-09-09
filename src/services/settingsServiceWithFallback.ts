import { 
  doc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

export interface AppSettings {
  // Informations organisation
  organizationName: string;
  organizationAcronym: string;
  address: string;
  phone: string;
  
  // Paramètres de stock
  lowStockThreshold: number;
  currency: string;
  
  // Notifications
  emailNotifications: {
    stockLow: boolean;
    stockOut: boolean;
    expiring: boolean;
    movements: boolean;
    inventory: boolean;
  };
  
  // Rapports
  reportFrequency: {
    daily: boolean;
    weekly: 'monday' | 'friday' | 'disabled';
  };
  
  // Sécurité
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  
  // Sessions
  sessionDuration: number;
  maxLoginAttempts: number;
  
  // Sauvegarde
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  backupTime: string;
  
  // Métadonnées
  updatedAt: string;
  updatedBy: string;
}

export class SettingsServiceWithFallback {
  private static collectionName = 'settings';
  private static documentId = 'app_settings';
  private static localSettings: AppSettings | null = null;

  // Mettre à jour les paramètres avec fallback
  static async updateSettings(updates: Partial<AppSettings>, updatedBy: string): Promise<void> {
    // 🔍 DIAGNOSTIC DÉTAILLÉ
    console.log('🔍 DIAGNOSTIC SettingsService.updateSettings:');
    console.log('- User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('- User ID:', auth.currentUser?.uid);
    console.log('- Mises à jour paramètres:', updates);
    console.log('- Network status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    try {
      console.log('🚀 Tentative de mise à jour Firebase pour paramètres...');
      const docRef = doc(db, this.collectionName, this.documentId);
      await updateDoc(docRef, updateData);
      console.log('✅ Paramètres mis à jour avec succès dans Firebase');
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la mise à jour des paramètres:', error);
      console.error('- Code erreur:', (error as any).code);
      console.error('- Message:', (error as any).message);
      
      // Fallback: sauvegarder localement
      if (this.localSettings) {
        this.localSettings = { ...this.localSettings, ...updateData };
      } else {
        // Créer des paramètres par défaut avec les mises à jour
        this.localSettings = { ...this.getDefaultSettings(), ...updateData };
      }
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('update', updateData);
      
      console.log('💾 Paramètres sauvegardés localement');
    }
  }

  // Créer les paramètres par défaut avec fallback
  static async createDefaultSettings(settings: AppSettings): Promise<void> {
    try {
      console.log('🚀 Tentative de création Firebase pour paramètres par défaut...');
      const docRef = doc(db, this.collectionName, this.documentId);
      await setDoc(docRef, settings);
      console.log('✅ Paramètres par défaut créés avec succès dans Firebase');
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la création des paramètres par défaut:', error);
      
      // Fallback: sauvegarder localement
      this.localSettings = settings;
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('create', settings);
      
      console.log('💾 Paramètres par défaut sauvegardés localement');
    }
  }

  // Réinitialiser aux paramètres par défaut avec fallback
  static async resetToDefaults(updatedBy: string): Promise<void> {
    try {
      console.log('🚀 Tentative de réinitialisation Firebase pour paramètres...');
      const defaultSettings = this.getDefaultSettings();
      defaultSettings.updatedBy = updatedBy;
      
      const docRef = doc(db, this.collectionName, this.documentId);
      await setDoc(docRef, defaultSettings);
      console.log('✅ Paramètres réinitialisés avec succès dans Firebase');
    } catch (error) {
      console.error('❌ Erreur Firebase lors de la réinitialisation des paramètres:', error);
      
      // Fallback: sauvegarder localement
      const defaultSettings = this.getDefaultSettings();
      defaultSettings.updatedBy = updatedBy;
      this.localSettings = defaultSettings;
      
      // Programmer une synchronisation ultérieure
      this.scheduleSync('reset', { updatedBy });
      
      console.log('💾 Paramètres réinitialisés localement');
    }
  }

  // Obtenir les paramètres par défaut
  private static getDefaultSettings(): AppSettings {
    return {
      organizationName: 'Institut National de Santé Publique et Communautaire',
      organizationAcronym: 'INSPC',
      address: 'Befelatanana, Antananarivo, Madagascar',
      phone: '+261 XX XX XX XX XX',
      
      lowStockThreshold: 20,
      currency: 'FCFA',
      
      emailNotifications: {
        stockLow: true,
        stockOut: true,
        expiring: true,
        movements: false,
        inventory: true
      },
      
      reportFrequency: {
        daily: true,
        weekly: 'monday'
      },
      
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expirationDays: 90
      },
      
      sessionDuration: 480, // 8 heures en minutes
      maxLoginAttempts: 5,
      
      backupFrequency: 'daily',
      backupTime: '02:00',
      
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };
  }

  // Programmer une synchronisation ultérieure
  private static scheduleSync(operation: string, data: any) {
    const pendingOps = JSON.parse(localStorage.getItem('pendingSettingsOps') || '[]');
    pendingOps.push({
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingSettingsOps', JSON.stringify(pendingOps));
    
    console.log(`Opération paramètres ${operation} programmée pour synchronisation ultérieure`);
  }

  // Synchroniser les opérations en attente
  static async syncPendingOperations(): Promise<void> {
    const pendingOps = JSON.parse(localStorage.getItem('pendingSettingsOps') || '[]');
    
    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Synchronisation de ${pendingOps.length} opérations de paramètres en attente...`);
    
    const successfulOps: number[] = [];
    
    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];
      
      try {
        const docRef = doc(db, this.collectionName, this.documentId);
        
        switch (op.operation) {
          case 'create':
            await setDoc(docRef, op.data);
            break;
          case 'update':
            await updateDoc(docRef, op.data);
            break;
          case 'reset':
            const defaultSettings = this.getDefaultSettings();
            defaultSettings.updatedBy = op.data.updatedBy;
            await setDoc(docRef, defaultSettings);
            break;
        }
        
        successfulOps.push(i);
        console.log(`Opération paramètres ${op.operation} synchronisée avec succès`);
      } catch (error) {
        console.warn(`Échec de synchronisation pour l'opération paramètres ${op.operation}:`, error);
      }
    }
    
    // Supprimer les opérations réussies
    if (successfulOps.length > 0) {
      const remainingOps = pendingOps.filter((_, index) => !successfulOps.includes(index));
      localStorage.setItem('pendingSettingsOps', JSON.stringify(remainingOps));
      console.log(`${successfulOps.length} opérations de paramètres synchronisées avec succès`);
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

  // Obtenir les paramètres locaux (pour le fallback)
  static getLocalSettings(): AppSettings | null {
    return this.localSettings;
  }
}