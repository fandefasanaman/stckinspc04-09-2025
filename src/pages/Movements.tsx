import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Calendar,
  User,
  Building,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { MovementServiceWithFallback } from '../services/movementServiceWithFallback';
import { StockEntryModal } from '../components/modals/StockEntryModal';
import StockExitModal from '../components/modals/StockExitModal';
import { Movement } from '../types';

const Movements: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(false);
  const stockEntryModal = useModal();
  const stockExitModal = useModal();
  const { userData } = useAuth();

  // Vérifier si l'utilisateur est un validateur
  const isValidator = userData?.role === 'validator';
  const canCreateMovements = !isValidator;

  // Utiliser le hook avec fallback pour récupérer les mouvements
  const { 
    data: movements, 
    loading: movementsLoading, 
    error, 
    isOffline, 
    isUsingFallback, 
    loadingMessage,
    retryConnection 
  } = useFirestoreWithFallback<Movement>('movements', [], [
    // Données de fallback pour les mouvements
    {
      id: 'fallback-mov-1',
      type: 'exit',
      articleId: 'fallback-1',
      articleCode: 'FB001',
      articleName: 'Papier A4 80g',
      quantity: 15,
      unit: 'paquet',
      userId: 'user-1',
      userName: 'Marie Kouassi',
      service: 'Service Administratif',
      beneficiary: 'Secrétariat',
      reason: 'Consommables bureau',
      status: 'validated',
      date: '2024-01-23',
      time: '14:30',
      createdAt: '2024-01-23T14:30:00.000Z'
    },
    {
      id: 'fallback-mov-2',
      type: 'entry',
      articleId: 'fallback-2',
      articleCode: 'IT002',
      articleName: 'Cartouches HP 305',
      quantity: 25,
      unit: 'unité',
      userId: 'user-2',
      userName: 'Jean Koffi',
      service: 'Service IT',
      supplier: 'DISTRIMAD',
      status: 'validated',
      date: '2024-01-22',
      time: '10:15',
      createdAt: '2024-01-22T10:15:00.000Z'
    }
  ]);

  const movementTypes = [
    { value: 'all', label: 'Tous les mouvements' },
    { value: 'entry', label: 'Entrées' },
    { value: 'exit', label: 'Sorties' }
  ];

  const services = [
    { value: 'all', label: 'Tous les services' },
    { value: 'Service Pédagogique et Scientifique', label: 'Service Pédagogique et Scientifique' },
    { value: 'Service Financier', label: 'Service Financier' },
    { value: 'Service Administratif', label: 'Service Administratif' },
    { value: 'Service Documentation', label: 'Service Documentation' },
    { value: 'Direction Formation et Recherche', label: 'Direction Formation et Recherche' },
    { value: 'Direction des Affaires Administratives', label: 'Direction des Affaires Administratives' },
    { value: 'Direction Générale', label: 'Direction Générale' },
    { value: 'Unité d\'Échographie', label: 'Unité d\'Échographie' },
    { value: 'Unité d\'Acupuncture', label: 'Unité d\'Acupuncture' }
  ];

  const getMovementIcon = (type: string) => {
    return type === 'entry' ? ArrowUp : ArrowDown;
  };

  const getMovementColor = (type: string) => {
    return type === 'entry' ? '#00A86B' : '#DC143C';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Validé
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.articleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.articleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    const matchesService = selectedService === 'all' || movement.service === selectedService;
    return matchesSearch && matchesType && matchesService;
  });

  const handleStockEntry = async (entryData: any) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      await MovementServiceWithFallback.createStockEntry({
        articleId: entryData.articleId,
        quantity: parseInt(entryData.quantity),
        supplier: entryData.supplier,
        reference: entryData.reference,
        notes: entryData.notes,
        userId: userData.id,
        userName: userData.name,
        service: userData.service
      });
      
      // Le hook useFirestore se mettra à jour automatiquement
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'entrée:', error);
      alert('Erreur lors de la création de l\'entrée: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockExit = async (exitData: any) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      await MovementServiceWithFallback.createStockExit({
        articleId: exitData.articleId,
        quantity: parseInt(exitData.quantity),
        service: exitData.service,
        beneficiary: exitData.beneficiary,
        reason: exitData.reason,
        reference: exitData.reference,
        notes: exitData.notes,
        userId: userData.id,
        userName: userData.name,
        service: exitData.service
      });
      
      // Le hook useFirestore se mettra à jour automatiquement
    } catch (error: any) {
      console.error('Erreur lors de la création de la sortie:', error);
      alert('Erreur lors de la création de la sortie: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateMovement = async (movementId: string) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      await MovementServiceWithFallback.validateMovement(movementId, userData.id);
      console.log('✅ Mouvement validé avec succès:', movementId);
    } catch (error: any) {
      console.error('Erreur lors de la validation du mouvement:', error);
      alert('Erreur lors de la validation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectMovement = async (movementId: string) => {
    if (!userData || !confirm('Êtes-vous sûr de vouloir rejeter ce mouvement ?')) return;
    
    setLoading(true);
    try {
      await MovementServiceWithFallback.rejectMovement(movementId, userData.id);
      console.log('✅ Mouvement rejeté avec succès:', movementId);
    } catch (error: any) {
      console.error('Erreur lors du rejet du mouvement:', error);
      alert('Erreur lors du rejet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (movementsLoading) {
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

  if (error && movements.length === 0) {
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
            Mouvements de Stock
          </h1>
          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={() => console.log('🔍 Diagnostic mouvements:', { movements: movements.length, isOffline, isUsingFallback })}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              📊 Info Système
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Suivez toutes les entrées et sorties de stock
          </p>
          
          {/* 🚀 INDICATEUR DE STATUT AMÉLIORÉ */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
              )}
              <span className={`text-sm ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                {isOffline ? 'Mode hors ligne' : `Connecté (${movements.length} mouvements)`}
              </span>
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Données locales ({movements.length})
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
            
            {loadingMessage && (
              <div className="flex items-center">
                <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full mr-2"></div>
                <span className="text-xs text-blue-600">{loadingMessage}</span>
              </div>
            )}
          </div>
        </div>
        {canCreateMovements && (
          <div className="flex space-x-3">
            <button 
              onClick={stockEntryModal.openModal}
              disabled={loading}
              className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00A86B' }}
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              {loading ? 'Traitement...' : 'Entrée Stock'}
            </button>
            <button 
              onClick={stockExitModal.openModal}
              disabled={loading}
              className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#DC143C' }}
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              {loading ? 'Traitement...' : 'Sortie Stock'}
            </button>
          </div>
        )}
        {isValidator && (
          <div className="flex items-center px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-sm text-orange-700 font-medium">
              Mode Validateur - Lecture seule avec validation des sorties
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* 🚀 MESSAGE D'ÉTAT AMÉLIORÉ */}
        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <ArrowUp className="w-5 h-5 text-blue-500 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  {error} • {movements.length} mouvements disponibles
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#6B2C91' } as any}
          >
            {movementTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#6B2C91' } as any}
          >
            {services.map(service => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button 
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            style={{ color: '#6B2C91' }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
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
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.map((movement) => {
                const Icon = getMovementIcon(movement.type);
                const color = getMovementColor(movement.type);
                
                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ color }}
                        >
                          {movement.type === 'entry' ? 'Entrée' : 'Sortie'}
                        </span>
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <strong>{movement.quantity}</strong> {movement.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{movement.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: '#00A86B' }}
                          >
                            {movement.service && movement.service !== 'Service non défini' 
                              ? movement.service 
                              : 'Service non défini'
                            }
                          </span>
                          {movement.service && movement.service !== 'Service non défini' && (
                            <div className="text-xs text-gray-500">
                              Service validé
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{movement.date}</div>
                          <div className="text-xs text-gray-500">{movement.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(movement.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {movements.filter(m => m.type === 'entry').length}
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
                {movements.filter(m => m.type === 'exit').length}
              </p>
              <p className="text-sm text-gray-600">Sorties ce mois</p>
            </div>
          </div>
        </div>

        {!isValidator && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                style={{ backgroundColor: '#6B2C9120' }}
              >
                <Calendar className="w-6 h-6" style={{ color: '#6B2C91' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                  {movements.length}
                </p>
                <p className="text-sm text-gray-600">Total mouvements</p>
              </div>
            </div>
          </div>
        )}
        {isValidator && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                style={{ backgroundColor: '#00A86B20' }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: '#00A86B' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#00A86B' }}>
                  {movements.filter(m => m.type === 'exit' && m.status === 'validated').length}
                </p>
                <p className="text-sm text-gray-600">Sorties validées</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section spéciale pour les validateurs */}
      {isValidator && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#FF6B35' }}>
                Sorties en Attente de Validation
              </h3>
              <span 
                className="px-3 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: '#FF6B35' }}
              >
                {movements.filter(m => m.type === 'exit' && m.status === 'pending').length} en attente
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: '#FF6B35' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Demandeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.filter(m => m.type === 'exit' && m.status === 'pending').map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <strong>{movement.quantity}</strong> {movement.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{movement.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm" style={{ color: '#00A86B' }}>
                          {movement.service}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{movement.date}</div>
                          <div className="text-xs text-gray-500">{movement.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleValidateMovement(movement.id)}
                          disabled={loading}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#00A86B' }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valider
                        </button>
                        <button 
                          onClick={() => handleRejectMovement(movement.id)}
                          disabled={loading}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#DC143C' }}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {movements.filter(m => m.type === 'exit' && m.status === 'pending').length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune sortie en attente de validation</p>
                <p className="text-xs mt-1">Toutes les sorties ont été traitées</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tableau principal des mouvements */}
      {!isValidator && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: '#6B2C91' }}>
                <tr>
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
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => {
                  const Icon = getMovementIcon(movement.type);
                  const color = getMovementColor(movement.type);
                  
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <span 
                            className="text-sm font-medium"
                            style={{ color }}
                          >
                            {movement.type === 'entry' ? 'Entrée' : 'Sortie'}
                          </span>
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <strong>{movement.quantity}</strong> {movement.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">{movement.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <span 
                              className="text-sm font-medium"
                              style={{ color: '#00A86B' }}
                            >
                              {movement.service && movement.service !== 'Service non défini' 
                                ? movement.service 
                                : 'Service non défini'
                              }
                            </span>
                            {movement.service && movement.service !== 'Service non défini' && (
                              <div className="text-xs text-gray-500">
                                Service validé
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">{movement.date}</div>
                            <div className="text-xs text-gray-500">{movement.time}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(movement.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals - Seulement pour les non-validateurs */}
      {canCreateMovements && (
        <>
          <StockEntryModal
            isOpen={stockEntryModal.isOpen}
            onClose={stockEntryModal.closeModal}
            onSave={handleStockEntry}
            disabled={loading}
          />
          <StockExitModal
            isOpen={stockExitModal.isOpen}
            onClose={stockExitModal.closeModal}
            onSave={handleStockExit}
          />
        </>
      )}
    </div>
  );
};

export default Movements;