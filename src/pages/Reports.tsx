import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  Filter,
  PieChart,
  LineChart,
  Building
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { ReportServiceWithFallback, ReportConfig } from '../services/reportServiceWithFallback';
import ReportGeneratorModal from '../components/modals/ReportGeneratorModal';
import AdvancedFiltersModal from '../components/modals/AdvancedFiltersModal';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(false);
  const reportGeneratorModal = useModal();
  const advancedFiltersModal = useModal();
  const { userData } = useAuth();

  // Utiliser le hook avec fallback pour récupérer les configurations de rapports
  const { 
    data: reportConfigs, 
    loading: reportsLoading, 
    error, 
    isOffline, 
    isUsingFallback, 
    loadingMessage,
    retryConnection 
  } = useFirestoreWithFallback<ReportConfig>('reports');

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  const services = [
    { value: 'all', label: 'Tous les services' },
    { value: 'sps', label: 'Service Pédagogique et Scientifique' },
    { value: 'sf', label: 'Service Financier' },
    { value: 'sa', label: 'Service Administratif' },
    { value: 'sdoc', label: 'Service Documentation' },
    { value: 'dfr', label: 'Direction Formation et Recherche' },
    { value: 'daaf', label: 'Direction des Affaires Administratives' },
    { value: 'dg', label: 'Direction Générale' }
  ];

  const reportCards = [
    {
      title: 'Rapport des Sorties',
      description: 'Analyse détaillée des sorties par période et service',
      icon: TrendingUp,
      color: '#6B2C91',
      data: '1,247 sorties',
      change: '+12%'
    },
    {
      title: 'Consommation par Service',
      description: 'Répartition des consommations par département',
      icon: Building,
      color: '#00A86B',
      data: '8 services actifs',
      change: '+5%'
    },
    {
      title: 'Analyse Temporelle',
      description: 'Évolution des stocks et tendances',
      icon: LineChart,
      color: '#D4AF37',
      data: '24 mois analysés',
      change: '+8%'
    },
    {
      title: 'Répartition par Catégorie',
      description: 'Distribution des articles par catégorie',
      icon: PieChart,
      color: '#DC143C',
      data: '4 catégories',
      change: '0%'
    }
  ];

  const topConsumingServices = [
    {
      service: 'Service Pédagogique et Scientifique',
      percentage: 35,
      items: 156,
      trend: '+15%'
    },
    {
      service: 'Direction Formation et Recherche',
      percentage: 25,
      items: 98,
      trend: '+8%'
    },
    {
      service: 'Service Administratif',
      percentage: 19,
      items: 134,
      trend: '+12%'
    },
    {
      service: 'Unité d\'Échographie',
      percentage: 13,
      items: 67,
      trend: '+22%'
    },
    {
      service: 'Direction Générale',
      percentage: 8,
      items: 45,
      trend: '+5%'
    }
  ];

  const categoryAnalysis = [
    {
      category: 'Fournitures Bureau',
      percentage: 42,
      items: 245
    },
    {
      category: 'Consommables Médicaux',
      percentage: 28,
      items: 189
    },
    {
      category: 'Consommables IT',
      percentage: 22,
      items: 156
    },
    {
      category: 'Produits Entretien',
      percentage: 8,
      items: 98
    }
  ];

  const monthlyTrends = [
    { month: 'Oct 2023', entries: 45, exits: 189 },
    { month: 'Nov 2023', entries: 52, exits: 234 },
    { month: 'Déc 2023', entries: 38, exits: 198 },
    { month: 'Jan 2024', entries: 67, exits: 267 }
  ];

  const handleReportGeneration = async (reportConfigData: any) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      await ReportServiceWithFallback.createReportConfig({
        name: `Rapport ${reportConfigData.type} - ${new Date().toLocaleDateString()}`,
        type: reportConfigData.type,
        period: reportConfigData.period,
        format: reportConfigData.format,
        includeCharts: reportConfigData.includeCharts,
        includeDetails: reportConfigData.includeDetails,
        services: reportConfigData.services,
        categories: reportConfigData.categories,
        createdBy: userData.id
      });
      
      // Ici vous pourriez ajouter la logique de génération réelle du rapport
      alert('Configuration de rapport sauvegardée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedFilters = (filtersData: any) => {
    console.log('Filtres avancés:', filtersData);
    // Logique pour appliquer les filtres
  };

  const handleExport = () => {
    console.log('Export des données');
    // Logique pour exporter les données
  };

  if (reportsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: '#6B2C91' }}></div>
          <p className="text-lg font-medium" style={{ color: '#6B2C91' }}>
            {loadingMessage}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connexion à Firebase en cours...
          </p>
        </div>
      </div>
    );
  }

  if (error && reportConfigs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
            Rapports et Analyses
          </h1>
          {/* 🚀 INDICATEUR DE STATUT AMÉLIORÉ */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center">
              {isOffline ? (
                <span className="text-sm text-red-600">Mode hors ligne</span>
              ) : (
                <span className="text-sm text-green-600">Connecté ({reportConfigs.length} rapports)</span>
              )}
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Données locales ({reportConfigs.length})
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
            Analyses détaillées et tableaux de bord décisionnels
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={advancedFiltersModal.openModal}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            style={{ color: '#6B2C91' }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres Avancés
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#00A86B' }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button 
            onClick={reportGeneratorModal.openModal}
            disabled={loading}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#6B2C91' }}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Générer Rapport'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* 🚀 MESSAGE D'ÉTAT AMÉLIORÉ */}
        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  {error} • {reportConfigs.length} rapports disponibles
                </p>
                {isUsingFallback && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✅ Vous pouvez continuer à travailler • Synchronisation automatique en arrière-plan
                  </p>
                )}
              </div>
              {(isOffline || isUsingFallback) && (
                <button
                  onClick={retryConnection}
                  className="ml-2 px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
                >
                  Réessayer
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période d'analyse
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service/Direction
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {services.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#6B2C91' }}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Générer Rapport
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: card.color }}
                >
                  {card.change}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {card.description}
              </p>
              <p className="text-lg font-bold" style={{ color: card.color }}>
                {card.data}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consuming Services */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
              Services les Plus Consommateurs
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Classement par valeur de consommation ce mois
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topConsumingServices.map((service, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: index < 3 ? '#D4AF37' : '#6B2C91' }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {service.service}
                      </p>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: '#6B2C91' }}>{service.items} articles</p>
                        <p className="text-xs text-green-600">
                          {service.trend}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{service.items} articles</span>
                        <span>{service.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: '#6B2C91',
                            width: `${service.percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
              Analyse par Catégorie
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Répartition des sorties par catégorie d'articles
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {categoryAnalysis.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {category.category}
                    </h4>
                    <span className="text-sm font-bold" style={{ color: '#6B2C91' }}>
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="h-3 rounded-full"
                      style={{ 
                        backgroundColor: '#00A86B',
                        width: `${category.percentage}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{category.items} articles</span>
                    <span>{category.percentage}% du total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
                Évolution Mensuelle
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tendances des entrées et sorties sur les 4 derniers mois
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#00A86B' }}></div>
                <span className="text-xs text-gray-600">Entrées</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#DC143C' }}></div>
                <span className="text-xs text-gray-600">Sorties</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Mois
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Entrées
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Sorties
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    Valeur Totale
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((trend, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {trend.month}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#00A86B20', color: '#00A86B' }}
                      >
                        {trend.entries}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#DC143C20', color: '#DC143C' }}
                      >
                        {trend.exits}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold" style={{ color: '#6B2C91' }}>Total: {trend.entries + trend.exits}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Saved Report Configurations */}
      {reportConfigs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
              Configurations de Rapports Sauvegardées
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configurations de rapports créées précédemment
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportConfigs.slice(0, 6).map((config) => (
                <div key={config.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{config.name}</h4>
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ backgroundColor: '#6B2C9120', color: '#6B2C91' }}
                    >
                      {config.format.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Type: {config.type} | Période: {config.period}
                  </p>
                  <p className="text-xs text-gray-500">
                    Créé le {new Date(config.createdAt).toLocaleDateString()}
                  </p>
                  {config.lastGenerated && (
                    <p className="text-xs text-green-600 mt-1">
                      Dernière génération: {new Date(config.lastGenerated).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportGeneratorModal
        isOpen={reportGeneratorModal.isOpen}
        onClose={reportGeneratorModal.closeModal}
        onGenerate={handleReportGeneration}
      />
      <AdvancedFiltersModal
        isOpen={advancedFiltersModal.isOpen}
        onClose={advancedFiltersModal.closeModal}
        onApply={handleAdvancedFilters}
      />
    </div>
  );
};

export default Reports;