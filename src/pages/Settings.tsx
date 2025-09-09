import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Building, 
  Shield, 
  Bell,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsServiceWithFallback, AppSettings } from '../services/settingsServiceWithFallback';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const { userData } = useAuth();

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Essayer de charger depuis Firebase d'abord
      const localSettings = SettingsServiceWithFallback.getLocalSettings();
      if (localSettings) {
        setSettings(localSettings);
        setIsUsingFallback(true);
        console.log('💾 Paramètres chargés depuis le cache local');
      } else {
        // Créer des paramètres par défaut si aucun n'existe
        const defaultSettings: AppSettings = {
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
          sessionDuration: 480,
          maxLoginAttempts: 5,
          backupFrequency: 'daily',
          backupTime: '02:00',
          updatedAt: new Date().toISOString(),
          updatedBy: userData?.id || 'system'
        };
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des paramètres:', err);
      setError('Impossible de charger les paramètres');
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !userData) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await SettingsServiceWithFallback.updateSettings(settings, userData.id);
      console.log('✅ Paramètres sauvegardés avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      setError('Erreur lors de la sauvegarde: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!userData || !confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await SettingsServiceWithFallback.resetToDefaults(userData.id);
      await loadSettings(); // Recharger les paramètres
      console.log('✅ Paramètres réinitialisés avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la réinitialisation des paramètres:', err);
      setError('Erreur lors de la réinitialisation: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const retryConnection = () => {
    setIsOffline(false);
    setIsUsingFallback(false);
    loadSettings();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: '#6B2C91' }}></div>
          <p className="text-lg font-medium" style={{ color: '#6B2C91' }}>
            Chargement des paramètres...
          </p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">Impossible de charger les paramètres</p>
          <button
            onClick={retryConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Paramètres
          </h1>
          {/* 🚀 INDICATEUR DE STATUT AMÉLIORÉ */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
              )}
              <span className={`text-sm ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                {isOffline ? 'Mode hors ligne' : 'Connecté'}
              </span>
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Données locales
                </span>
                <button
                  onClick={retryConnection}
                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                  title="Réessayer la connexion"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Configuration de l'application
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleReset}
            disabled={saving}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#6B2C91' }}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Organization Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#6B2C91' }}>
            <Building className="w-5 h-5 mr-2" />
            Informations Organisation
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'organisation
              </label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acronyme
              </label>
              <input
                type="text"
                value={settings.organizationAcronym}
                onChange={(e) => setSettings({ ...settings, organizationAcronym: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#6B2C91' }}>
            <SettingsIcon className="w-5 h-5 mr-2" />
            Paramètres de Stock
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil de stock faible (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#6B2C91' }}>
            <Bell className="w-5 h-5 mr-2" />
            Notifications Email
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    emailNotifications: {
                      ...settings.emailNotifications,
                      [key]: e.target.checked
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {key === 'stockLow' && 'Stock faible'}
                  {key === 'stockOut' && 'Rupture de stock'}
                  {key === 'expiring' && 'Produits expirants'}
                  {key === 'movements' && 'Mouvements de stock'}
                  {key === 'inventory' && 'Inventaires'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;