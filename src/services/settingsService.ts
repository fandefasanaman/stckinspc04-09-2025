import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

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

export class SettingsService {
  private static collectionName = 'settings';
  private static documentId = 'app_settings';

  // Obtenir les paramètres de l'application
  static async getSettings(): Promise<AppSettings | null> {
    try {
      const docRef = doc(db, this.collectionName, this.documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }
      
      // Créer les paramètres par défaut si ils n'existent pas
      const defaultSettings = this.getDefaultSettings();
      await this.createDefaultSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw new Error('Impossible de récupérer les paramètres');
    }
  }

  // Mettre à jour les paramètres
  static async updateSettings(updates: Partial<AppSettings>, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, this.documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw new Error('Impossible de mettre à jour les paramètres');
    }
  }

  // Créer les paramètres par défaut
  private static async createDefaultSettings(settings: AppSettings): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, this.documentId);
      await setDoc(docRef, settings);
    } catch (error) {
      console.error('Erreur lors de la création des paramètres par défaut:', error);
      throw new Error('Impossible de créer les paramètres par défaut');
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

  // Réinitialiser aux paramètres par défaut
  static async resetToDefaults(updatedBy: string): Promise<void> {
    try {
      const defaultSettings = this.getDefaultSettings();
      defaultSettings.updatedBy = updatedBy;
      
      const docRef = doc(db, this.collectionName, this.documentId);
      await setDoc(docRef, defaultSettings);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des paramètres:', error);
      throw new Error('Impossible de réinitialiser les paramètres');
    }
  }

  // Écouter les changements en temps réel
  static onSettingsChange(callback: (settings: AppSettings | null) => void) {
    const docRef = doc(db, this.collectionName, this.documentId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AppSettings);
      } else {
        callback(null);
      }
    });
  }
}