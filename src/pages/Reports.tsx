import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Package,
  ArrowUp,
  ArrowDown,
  Building,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { ExportService } from '../services/exportService';
import { ReportGeneratorService } from '../services/reportGeneratorService';
import { Article, Movement, User } from '../types';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    period: 'month',
    format: 'pdf'
  });
  const [reportStats, setReportStats] = useState({
    totalArticles: 0,
    entriesThisMonth: 0,
    exitsThisMonth: 0,
    activeServices: 0
  });

  const { userData } = useAuth();

  // Récupérer les vraies données depuis Firestore
  const { 
    data: articles, 
    loading: articlesLoading, 
    error: articlesError,
    isOffline,
    isUsingFallback,
    retryConnection
  } = useFirestoreWithFallback<Article>('articles');

  const { 
    data: movements, 
    loading: movementsLoading 
  } = useFirestoreWithFallback<Movement>('movements');

  const { 
    data: users 
  } = useFirestoreWithFallback<User>('users');

  // Fonction pour afficher les messages temporaires
  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage(message);
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Handler pour appliquer les filtres
  const handleApplyFilters = () => {
    setLoading(true);
    console.log('🔧 Application des filtres:', { period: selectedPeriod, format: selectedFormat });
    
    try {
      // Simuler un traitement
      setTimeout(() => {
        setAppliedFilters({
          period: selectedPeriod,
          format: selectedFormat
        });
        setLoading(false);
        showMessage(`Filtres appliqués: ${periods.find(p => p.value === selectedPeriod)?.label} en format ${formats.find(f => f.value === selectedFormat)?.label}`, 'success');
        
        // Recalculer les statistiques avec les nouveaux filtres
        calculateFilteredStats();
      }, 1000);
    } catch (error) {
      setLoading(false);
      showMessage('Erreur lors de l\'application des filtres', 'error');
    }
  };

  // Calculer les statistiques filtrées
  const calculateFilteredStats = () => {
    const filteredMovements = ExportService.filterData(movements, { period: appliedFilters.period });
    
    const stats = {
      totalArticles: articles.length,
      entriesThisMonth: filteredMovements.filter(m => m.type === 'entry').length,
      exitsThisMonth: filteredMovements.filter(m => m.type === 'exit').length,
      activeServices: new Set(users.filter(u => u.status === 'active').map(u => u.service)).size
    };
    
    setReportStats(stats);
    console.log('📊 Statistiques filtrées recalculées:', stats);
  };

  // Handler pour exporter les données
  const handleExportData = async () => {
    if (!userData) {
      showMessage('Utilisateur non authentifié', 'error');
      return;
    }
    
    setExportLoading(true);
    console.log('📤 Début export des données...');
    
    try {
      // Filtrer les données selon les filtres appliqués
      const filteredMovements = ExportService.filterData(movements, { period: appliedFilters.period });
      
      const exportData = {
        articles,
        movements: filteredMovements,
        users,
        inventories: [], // Sera ajouté quand les inventaires seront disponibles
        metadata: {
          exportDate: new Date().toISOString(),
          exportedBy: userData.name,
          filters: appliedFilters,
          totalRecords: articles.length + filteredMovements.length + users.length
        }
      };
      
      // Exporter selon le format sélectionné
      ExportService.exportCompleteData(exportData, appliedFilters.format as 'csv' | 'excel' | 'json');
      
      setExportLoading(false);
      showMessage(`Export réussi: ${exportData.metadata.totalRecords} enregistrements exportés en format ${appliedFilters.format.toUpperCase()}`, 'success');
      
    } catch (error: any) {
      setExportLoading(false);
      console.error('❌ Erreur lors de l\'export:', error);
      showMessage('Erreur lors de l\'export des données: ' + error.message, 'error');
    }
  };

  // Handler pour générer un rapport spécifique
  const handleGenerateReport = async (reportType: string) => {
    if (!userData) {
      showMessage('Utilisateur non authentifié', 'error');
      return;
    }
    
    setLoading(true);
    console.log(`📊 Génération du rapport ${reportType}...`);
    
    try {
      let reportData;
      
      switch (reportType) {
        case 'stock':
          reportData = ReportGeneratorService.generateStockReport(
            articles,
            appliedFilters.period,
            appliedFilters.format,
            userData.name
          );
          break;
          
        case 'movements':
          reportData = ReportGeneratorService.generateMovementsReport(
            movements,
            appliedFilters.period,
            appliedFilters.format,
            userData.name
          );
          break;
          
        case 'consumption':
          reportData = ReportGeneratorService.generateConsumptionReport(
            movements,
            articles,
            appliedFilters.period,
            appliedFilters.format,
            userData.name
          );
          break;
          
        default:
          throw new Error(`Type de rapport non supporté: ${reportType}`);
      }
      
      setLoading(false);
      showMessage(`Rapport ${reportData.title} généré avec succès en format ${appliedFilters.format.toUpperCase()}`, 'success');
      
      console.log('✅ Rapport généré:', reportData.summary);
      
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Erreur lors de la génération du rapport:', error);
      showMessage('Erreur lors de la génération du rapport: ' + error.message, 'error');
    }
  };
  // Calculer les vraies statistiques
  useEffect(() => {
    if (articles.length > 0 || movements.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filtrer les mouvements du mois en cours
      const thisMonthMovements = movements.filter(movement => {
        const movementDate = new Date(movement.createdAt);
        return movementDate.getMonth() === currentMonth && 
               movementDate.getFullYear() === currentYear;
      });

      // Calculer les statistiques réelles
      const stats = {
        totalArticles: articles.length,
        entriesThisMonth: thisMonthMovements.filter(m => m.type === 'entry').length,
        exitsThisMonth: thisMonthMovements.filter(m => m.type === 'exit').length,
        activeServices: new Set(users.filter(u => u.status === 'active').map(u => u.service)).size
      };

      setReportStats(stats);
      console.log('📊 Statistiques calculées:', stats);
    }
  }, [articles, movements, users, appliedFilters]);

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  const reportTypes = [
    {
      id: 'stock',
      title: 'Rapport de Stock',
      description: 'État actuel des stocks par catégorie',
      icon: Package,
      color: '#6B2C91'
    },
    {
      id: 'movements',
      title: 'Mouvements',
      description: 'Historique des entrées et sorties',
      icon: TrendingUp,
      color: '#00A86B'
    },
    {
      id: 'consumption',
      title: 'Consommation',
      description: 'Analyse de consommation par service',
      icon: Building,
      color: '#D4AF37'
    }
  ];


  // Calculer les mouvements récents réels
  const getRecentMovements = () => {
    return movements
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const recentMovements = getRecentMovements();

  if (articlesLoading || movementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: '#6B2C91' }}></div>
          <p className="text-lg font-medium" style={{ color: '#6B2C91' }}>
            Chargement des données pour les rapports...
          </p>
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
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
              )}
              <span className={`text-sm ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                {isOffline ? 'Mode hors ligne' : `Données en temps réel`}
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
            Générez des rapports détaillés sur votre gestion de stock
          </p>
        </div>
        <button 
          onClick={handleExportData}
          disabled={exportLoading}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#00A86B' }}
        >
          {exportLoading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {exportLoading ? 'Export en cours...' : 'Exporter Données'}
        </button>
      </div>

      {/* Messages de feedback */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}
      {/* Message d'erreur si nécessaire */}
      {articlesError && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                {articlesError} • Rapports basés sur {articles.length} articles et {movements.length} mouvements
              </p>
              {isUsingFallback && (
                <p className="text-xs text-blue-600 mt-1">
                  ✅ Données disponibles • Synchronisation automatique en arrière-plan
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - VRAIES DONNÉES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#6B2C9120' }}
            >
              <Package className="w-6 h-6" style={{ color: '#6B2C91' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                {reportStats.totalArticles}
              </p>
              <p className="text-sm text-gray-600">Total Articles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#00A86B20' }}
            >
              <ArrowUp className="w-6 h-6" style={{ color: '#00A86B' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#00A86B' }}>
                {reportStats.entriesThisMonth}
              </p>
              <p className="text-sm text-gray-600">Entrées ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#DC143C20' }}
            >
              <ArrowDown className="w-6 h-6" style={{ color: '#DC143C' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#DC143C' }}>
                {reportStats.exitsThisMonth}
              </p>
              <p className="text-sm text-gray-600">Sorties ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#D4AF3720' }}
            >
              <Building className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                {reportStats.activeServices}
              </p>
              <p className="text-sm text-gray-600">Services actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B2C91' }}>
          Configuration des Rapports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
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
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {formats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleApplyFilters}
              disabled={loading}
              className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#6B2C91' }}
            >
              {loading ? (
                <Loader className="w-4 h-4 inline mr-2 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4 inline mr-2" />
              )}
              {loading ? 'Application...' : 'Appliquer Filtres'}
            </button>
          </div>
        </div>
        
        {/* Affichage des filtres appliqués */}
        {(appliedFilters.period !== 'month' || appliedFilters.format !== 'pdf') && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filtres actifs:</strong> {periods.find(p => p.value === appliedFilters.period)?.label} • Format: {formats.find(f => f.value === appliedFilters.format)?.label}
            </p>
          </div>
        )}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: `${report.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {report.description}
              </p>
              <button 
                onClick={() => handleGenerateReport(report.id)}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: report.color }}
              >
                {loading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Génération...' : 'Générer'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Real Data Table - Mouvements Récents RÉELS */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Mouvements Récents - Données Réelles {appliedFilters.period !== 'month' && `(${periods.find(p => p.value === appliedFilters.period)?.label})`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {recentMovements.length} mouvements récents • Filtres: {periods.find(p => p.value === appliedFilters.period)?.label}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMovements.length > 0 ? recentMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      movement.type === 'entry' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type === 'entry' ? (
                        <ArrowUp className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDown className="w-3 h-3 mr-1" />
                      )}
                      {movement.type === 'entry' ? 'Entrée' : 'Sortie'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {movement.articleName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.articleCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#6B2C91' }}>
                    {movement.quantity} {movement.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      movement.status === 'validated' 
                        ? 'bg-green-100 text-green-800'
                        : movement.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.status === 'validated' ? 'Validé' : 
                       movement.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun mouvement récent dans la base de données</p>
                    <p className="text-xs mt-1">Les mouvements apparaîtront ici une fois créés</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyse par Catégorie - VRAIES DONNÉES */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Analyse par Catégorie - Données Réelles {appliedFilters.period !== 'month' && `(${periods.find(p => p.value === appliedFilters.period)?.label})`}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from(new Set(articles.map(a => a.category))).map((category) => {
              const categoryArticles = articles.filter(a => a.category === category);
              const filteredMovements = ExportService.filterData(movements, { period: appliedFilters.period });
              const categoryMovements = filteredMovements.filter(m => {
                const article = articles.find(a => a.id === m.articleId);
                return article?.category === category;
              });
              
              return (
                <div key={category} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Articles:</span>
                      <span className="font-medium" style={{ color: '#6B2C91' }}>
                        {categoryArticles.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mouvements:</span>
                      <span className="font-medium" style={{ color: '#00A86B' }}>
                        {categoryMovements.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock faible:</span>
                      <span className="font-medium" style={{ color: '#DC143C' }}>
                        {categoryArticles.filter(a => a.status === 'low' || a.status === 'out').length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analyse par Service - VRAIES DONNÉES */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Activité par Service - Données Réelles {appliedFilters.period !== 'month' && `(${periods.find(p => p.value === appliedFilters.period)?.label})`}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(ExportService.filterData(movements, { period: appliedFilters.period }).map(m => m.service).filter(Boolean))).slice(0, 6).map((service) => {
              const filteredMovements = ExportService.filterData(movements, { period: appliedFilters.period });
              const serviceMovements = movements.filter(m => m.service === service);
              const serviceExits = serviceMovements.filter(m => m.type === 'exit');
              const totalQuantity = serviceExits.reduce((sum, m) => sum + m.quantity, 0);
              
              return (
                <div key={service} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: '#6B2C9120' }}
                    >
                      <Building className="w-5 h-5" style={{ color: '#6B2C91' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {serviceMovements.length} mouvements
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: '#6B2C91' }}>
                      {serviceMovements.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalQuantity} unités sorties
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {ExportService.filterData(movements, { period: appliedFilters.period }).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune activité de service enregistrée</p>
              <p className="text-xs mt-1">
                {movements.length > 0 
                  ? `Aucune activité pour la période sélectionnée (${periods.find(p => p.value === appliedFilters.period)?.label})`
                  : 'Les données apparaîtront après les premiers mouvements'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Résumé des actions disponibles */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Actions Rapides
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleGenerateReport('stock')}
              disabled={loading}
              className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <Package className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
              <div className="text-left">
                <p className="font-medium" style={{ color: '#6B2C91' }}>Rapport Stock Rapide</p>
                <p className="text-xs text-gray-600">État actuel des stocks</p>
              </div>
            </button>
            
            <button
              onClick={() => handleGenerateReport('movements')}
              disabled={loading}
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <TrendingUp className="w-6 h-6 mr-3" style={{ color: '#00A86B' }} />
              <div className="text-left">
                <p className="font-medium" style={{ color: '#00A86B' }}>Mouvements Rapide</p>
                <p className="text-xs text-gray-600">Historique des mouvements</p>
              </div>
            </button>
            
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="flex items-center justify-center p-4 border-2 border-dashed border-yellow-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <Download className="w-6 h-6 mr-3" style={{ color: '#D4AF37' }} />
              <div className="text-left">
                <p className="font-medium" style={{ color: '#D4AF37' }}>Export Rapide</p>
                <p className="text-xs text-gray-600">Toutes les données</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;