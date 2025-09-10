import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Building, 
  Bell,
  Shield,
  Database,
  Globe
} from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Organisation
    organizationName: 'Institut National de Santé Publique et Communautaire',
    organizationAcronym: 'INSPC',
    address: 'Befelatanana, Antananarivo, Madagascar',
    phone: '+261 XX XX XX XX XX',
    
    // Stock
    lowStockThreshold: 20,
    currency: 'FCFA',
    
    // Notifications
    emailNotifications: {
      stockLow: true,
      stockOut: true,
      expiring: true,
      movements: false,
      inventory: true
    },
    
    // Système
    sessionDuration: 480,
    maxLoginAttempts: 5,
    backupFrequency: 'daily'
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    console.log('Sauvegarde des paramètres:', settings);
    
    // Simuler la sauvegarde
    setTimeout(() => {
      setSaving(false);
      alert('Paramètres sauvegardés avec succès !');
    }, 1000);
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      setSettings({
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
        sessionDuration: 480,
        maxLoginAttempts: 5,
        backupFrequency: 'daily'
      });
      console.log('Paramètres réinitialisés');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Paramètres
          </h1>
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
            <Database className="w-5 h-5 mr-2" />
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

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#6B2C91' }}>
            <Shield className="w-5 h-5 mr-2" />
            Paramètres Système
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de session (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="1440"
                value={settings.sessionDuration}
                onChange={(e) => setSettings({ ...settings, sessionDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentatives de connexion max
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence de sauvegarde
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: '#6B2C91' }}>
            <Globe className="w-5 h-5 mr-2" />
            Informations Application
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                v1.0.0
              </div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#00A86B' }}>
                Stable
              </div>
              <div className="text-sm text-gray-600">État</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                2024
              </div>
              <div className="text-sm text-gray-600">Année</div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Institut National de Santé Publique et Communautaire - Befelatanana
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Application de Gestion de Stock développée pour l'INSPC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;