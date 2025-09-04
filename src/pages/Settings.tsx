import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building2,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  Upload,
  Globe
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import ReportGeneratorModal from '../components/modals/ReportGeneratorModal';
import AdvancedFiltersModal from '../components/modals/AdvancedFiltersModal';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const reportGeneratorModal = useModal();
  const advancedFiltersModal = useModal();

  const handleReportGeneration = (reportConfig: any) => {
    console.log('Génération rapport:', reportConfig);
    // Logique pour générer le rapport
  };

  const handleAdvancedFilters = (filtersData: any) => {
    console.log('Filtres avancés:', filtersData);
    // Logique pour appliquer les filtres
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'backup', label: 'Sauvegarde', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'system', label: 'Système', icon: Globe }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations de l'Organisation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'organisation
                  </label>
                  <input
                    type="text"
                    defaultValue="Institut National de Santé Publique et Communautaire"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sigle
                  </label>
                  <input
                    type="text"
                    defaultValue="INSPC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Abidjan, Côte d'Ivoire"
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
                    defaultValue="+225 XX XX XX XX XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Paramètres de Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d'alerte stock faible (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="20"
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    defaultValue="FCFA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  >
                    <option value="FCFA">Franc CFA (FCFA)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notifications par Email
              </h3>
              <div className="space-y-4">
                {[
                  { id: 'stock_low', label: 'Stock faible', description: 'Alerte quand un article atteint le seuil minimum' },
                  { id: 'stock_out', label: 'Rupture de stock', description: 'Alerte en cas de rupture de stock' },
                  { id: 'expiry', label: 'Produits périmés', description: 'Alerte pour les produits proches de la péremption' },
                  { id: 'movements', label: 'Mouvements importants', description: 'Notification des gros mouvements de stock' },
                  { id: 'inventory', label: 'Inventaires', description: 'Notifications liées aux inventaires' }
                ].map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.label}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {notification.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Fréquence des Rapports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rapport quotidien
                  </label>
                  <select
                    defaultValue="enabled"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  >
                    <option value="enabled">Activé</option>
                    <option value="disabled">Désactivé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rapport hebdomadaire
                  </label>
                  <select
                    defaultValue="monday"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  >
                    <option value="monday">Lundi</option>
                    <option value="friday">Vendredi</option>
                    <option value="disabled">Désactivé</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Politique de Mot de Passe
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longueur minimale
                    </label>
                    <input
                      type="number"
                      defaultValue="8"
                      min="6"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration (jours)
                    </label>
                    <input
                      type="number"
                      defaultValue="90"
                      min="30"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    'Exiger des majuscules',
                    'Exiger des minuscules',
                    'Exiger des chiffres',
                    'Exiger des caractères spéciaux'
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                        style={{ '--tw-ring-color': '#6B2C91' } as any}
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {requirement}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sessions et Connexions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de session (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="480"
                    min="30"
                    max="1440"
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
                    defaultValue="5"
                    min="3"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sauvegarde Automatique
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence
                  </label>
                  <select
                    defaultValue="daily"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de sauvegarde
                  </label>
                  <input
                    type="time"
                    defaultValue="02:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Historique des Sauvegardes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15 02:00', size: '2.3 MB', status: 'Réussie' },
                    { date: '2024-01-14 02:00', size: '2.1 MB', status: 'Réussie' },
                    { date: '2024-01-13 02:00', size: '2.0 MB', status: 'Réussie' }
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{backup.date}</p>
                        <p className="text-xs text-gray-500">Taille: {backup.size}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {backup.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Contenu de l'onglet en cours de développement</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Paramètres Système
          </h1>
          <p className="mt-1" style={{ color: '#5A4A42' }}>
            Configuration et personnalisation de l'application
          </p>
        </div>
        <button 
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#2D8A47' }}
        >
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </button>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors
                      ${activeTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    style={activeTab === tab.id ? { backgroundColor: '#6B2C91' } : {}}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          className="flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          <Save className="w-5 h-5 mr-2" />
          Enregistrer les Modifications
        </button>
      </div>
    </div>
  );
};

export default Settings;