import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Package,
  User,
  Building,
  Wifi,
  WifiOff,
  RefreshCw,
  Play,
  Square,
  CheckSquare
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { InventoryServiceWithFallback } from '../services/inventoryServiceWithFallback';
import NewInventoryModal from '../components/modals/NewInventoryModal';
import { Inventory as InventoryType, InventoryItem } from '../types';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const newInventoryModal = useModal();
  const { userData } = useAuth();

  // Utiliser le hook avec fallback pour récupérer les inventaires
  const { 
    data: inventories, 
    loading: inventoriesLoading, 
    error, 
    isOffline, 
    isUsingFallback, 
    loadingMessage,
    retryConnection 
  } = useFirestoreWithFallback<InventoryType>('inventories', [], [
    // Données de fallback pour les inventaires
    {
      id: 'inv-1',
      name: 'Inventaire Trimestriel Q1 2024',
      category: 'Général',
      responsible: 'Marie Kouassi',
      scheduledDate: '2024-01-15',
      status: 'completed',
      articlesCount: 45,
      discrepancies: 3,
      description: 'Inventaire trimestriel complet',
      includeCategories: ['Fournitures Bureau', 'Consommables IT'],
      createdAt: '2024-01-10T08:00:00.000Z',
      completedAt: '2024-01-15T17:30:00.000Z'
    },
    {
      id: 'inv-2',
      name: 'Inventaire Médical Janvier',
      category: 'Consommables Médicaux',
      responsible: 'Dr. Jean Koffi',
      scheduledDate: '2024-01-20',
      status: 'in_progress',
      articlesCount: 28,
      discrepancies: 0,
      description: 'Inventaire des consommables médicaux',
      includeCategories: ['Consommables Médicaux'],
      createdAt: '2024-01-18T09:00:00.000Z'
    },
    {
      id: 'inv-3',
      name: 'Inventaire Bureau Février',
      category: 'Fournitures Bureau',
      responsible: 'Paul Diabaté',
      scheduledDate: '2024-02-01',
      status: 'planned',
      articlesCount: 32,
      discrepancies: 0,
      description: 'Inventaire des fournitures de bureau',
      includeCategories: ['Fournitures Bureau'],
      createdAt: '2024-01-25T10:00:00.000Z'
    }
  ]);

  // Récupérer les éléments de l'inventaire sélectionné
  const { 
    data: inventoryItems 
  } = useFirestoreWithFallback<InventoryItem>('inventory_items', [], [
    // Données de fallback pour les éléments d'inventaire
    {
      id: '1',
      inventoryId: 'inv-2',
      articleId: 'fallback-1',
      articleCode: 'FB001',
      articleName: 'Papier A4 80g',
      theoreticalStock: 150,
      physicalStock: 145,
      difference: -5,
      status: 'counted',
      location: 'Magasin A - Étagère 1'
    },
    {
      id: '2',
      inventoryId: 'inv-2',
      articleId: 'fallback-2',
      articleCode: 'IT002',
      articleName: 'Cartouches HP 305',
      theoreticalStock: 25,
      physicalStock: 23,
      difference: -2,
      status: 'counted',
      location: 'Magasin B - Armoire IT'
    }
  ]);

  // Filtrer les éléments pour l'inventaire en cours
  const currentInventoryItems = inventoryItems.filter(item => 
    item.inventoryId === (selectedInventoryId || 'inv-2')
  );

  const inventoryStatuses = [
    { value: 'all', label: 'Tous les inventaires' },
    { value: 'planned', label: 'Planifié' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'validated', label: 'Validé' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Calendar className="w-3 h-3 mr-1" />
            Planifié
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terminé
          </span>
        );
      case 'validated':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClipboardList className="w-3 h-3 mr-1" />
            En cours
          </span>
        );
      default:
        return null;
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'counted':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Compté
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case 'validated':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Validé
          </span>
        );
      default:
        return null;
    }
  };

  const getDifferenceDisplay = (difference: number | undefined) => {
    if (difference === undefined || difference === null) return '-';
    
    const color = difference > 0 ? '#00A86B' : difference < 0 ? '#DC143C' : '#6B2C91';
    const sign = difference > 0 ? '+' : '';
    
    return (
      <span style={{ color }} className="font-medium">
        {sign}{difference}
      </span>
    );
  };

  const handleNewInventory = async (inventoryData: any) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const inventoryId = await InventoryServiceWithFallback.createInventory({
        name: inventoryData.name,
        category: inventoryData.category,
        responsible: inventoryData.responsible,
        scheduledDate: inventoryData.scheduledDate,
        status: 'planned',
        articlesCount: 0,
        discrepancies: 0,
        description: inventoryData.description,
        includeCategories: inventoryData.includeCategories
      });
      
      console.log('✅ Inventaire créé avec succès:', inventoryId);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'inventaire:', error);
      alert('Erreur lors de la création de l\'inventaire: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventoryStatus = async (inventoryId: string, newStatus: InventoryType['status']) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      switch (newStatus) {
        case 'in_progress':
          await InventoryServiceWithFallback.startInventory(inventoryId, userData.id);
          break;
        case 'completed':
          await InventoryServiceWithFallback.completeInventory(inventoryId, userData.id);
          break;
        case 'validated':
          await InventoryServiceWithFallback.validateInventory(inventoryId, userData.id);
          break;
        default:
          await InventoryServiceWithFallback.updateInventory(inventoryId, { status: newStatus });
      }
      
      console.log('✅ Statut d\'inventaire mis à jour avec succès:', inventoryId, newStatus);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountItem = async (itemId: string, physicalStock: number, notes?: string) => {
    if (!userData) return;
    
    try {
      await InventoryServiceWithFallback.countInventoryItem(itemId, physicalStock, userData.id, notes);
      console.log('✅ Article compté avec succès:', itemId);
    } catch (error: any) {
      console.error('Erreur lors du comptage:', error);
      alert('Erreur lors du comptage: ' + error.message);
    }
  };

  const handleApplyAdjustments = async (inventoryId: string) => {
    if (!userData || !confirm('Êtes-vous sûr de vouloir appliquer tous les ajustements de stock ?')) return;
    
    setLoading(true);
    try {
      await InventoryServiceWithFallback.applyStockAdjustments(inventoryId, userData.id);
      console.log('✅ Ajustements appliqués avec succès:', inventoryId);
      alert('Ajustements de stock appliqués avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'application des ajustements:', error);
      alert('Erreur lors de l\'application des ajustements: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventories = inventories.filter(inventory => {
    const matchesSearch = inventory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inventory.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || inventory.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (inventoriesLoading) {
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

  if (error && inventories.length === 0) {
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
            Gestion des Inventaires
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
                {isOffline ? 'Mode hors ligne' : `Connecté (${inventories.length} inventaires)`}
              </span>
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Données locales ({inventories.length})
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
            Planifiez et suivez vos inventaires physiques
          </p>
        </div>
        <button 
          onClick={newInventoryModal.openModal}
          disabled={loading}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Création...' : 'Nouvel Inventaire'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#6B2C9120' }}
            >
              <ClipboardList className="w-6 h-6" style={{ color: '#6B2C91' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                {inventories.length}
              </p>
              <p className="text-sm text-gray-600">Total Inventaires</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#D4AF3720' }}
            >
              <Calendar className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                {inventories.filter(i => i.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">En cours</p>
            </div>
          </div>
        </div>

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
                {inventories.filter(i => i.status === 'validated').length}
              </p>
              <p className="text-sm text-gray-600">Validés</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#DC143C20' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: '#DC143C' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#DC143C' }}>
                {inventories.reduce((sum, i) => sum + i.discrepancies, 0)}
              </p>
              <p className="text-sm text-gray-600">Écarts totaux</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* 🚀 MESSAGE D'ÉTAT AMÉLIORÉ */}
        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <ClipboardList className="w-5 h-5 text-blue-500 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  {error} • {inventories.length} inventaires disponibles
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
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un inventaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {inventoryStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventories List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Liste des Inventaires
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Inventaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date Prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Écarts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventories.map((inventory) => (
                <tr key={inventory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: '#6B2C9120' }}
                      >
                        <ClipboardList className="w-5 h-5" style={{ color: '#6B2C91' }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inventory.name}
                        </div>
                        <div className="text-sm" style={{ color: '#00A86B' }}>
                          {inventory.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(inventory.scheduledDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{inventory.responsible}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium" style={{ color: '#6B2C91' }}>
                      {inventory.articlesCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: inventory.discrepancies > 0 ? '#DC143C' : '#00A86B' }}
                    >
                      {inventory.discrepancies}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inventory.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {inventory.status === 'planned' && (
                        <button 
                          onClick={() => handleUpdateInventoryStatus(inventory.id, 'in_progress')}
                          disabled={loading}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#D4AF37' }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Démarrer
                        </button>
                      )}
                      {inventory.status === 'in_progress' && (
                        <button 
                          onClick={() => handleUpdateInventoryStatus(inventory.id, 'completed')}
                          disabled={loading}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#00A86B' }}
                        >
                          <Square className="w-3 h-3 mr-1" />
                          Terminer
                        </button>
                      )}
                      {inventory.status === 'completed' && (
                        <button 
                          onClick={() => handleUpdateInventoryStatus(inventory.id, 'validated')}
                          disabled={loading}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#6B2C91' }}
                        >
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Valider
                        </button>
                      )}
                      {inventory.status === 'completed' && (
                        <button 
                          onClick={() => handleApplyAdjustments(inventory.id)}
                          disabled={loading}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#DC143C' }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Appliquer Ajustements
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Inventory Details */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
                Inventaire en Cours - Médical Janvier
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Responsable: Dr. Jean Koffi | Démarré le: 18/01/2024
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Progression: {currentInventoryItems.filter(item => item.status === 'counted' || item.status === 'validated').length}/{currentInventoryItems.length} articles
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: '#00A86B',
                    width: `${currentInventoryItems.length > 0 ? (currentInventoryItems.filter(item => item.status === 'counted' || item.status === 'validated').length / currentInventoryItems.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Théorique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Physique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Écart
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentInventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: '#6B2C9120' }}
                      >
                        <Package className="w-5 h-5" style={{ color: '#6B2C91' }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.articleName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.articleCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <strong>{item.theoreticalStock}</strong>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.physicalStock !== undefined ? (
                      <strong>{item.physicalStock}</strong>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        placeholder="Compter..."
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': '#6B2C91' } as any}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            handleCountItem(item.id, value);
                          }
                        }}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getDifferenceDisplay(item.difference)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">{item.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getItemStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {item.status === 'pending' && (
                      <button 
                        className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90"
                        style={{ backgroundColor: '#00A86B' }}
                        onClick={() => {
                          const physicalStock = prompt(`Stock physique pour ${item.articleName}:`, item.theoreticalStock.toString());
                          if (physicalStock && !isNaN(parseInt(physicalStock))) {
                            handleCountItem(item.id, parseInt(physicalStock));
                          }
                        }}
                      >
                        Marquer compté
                      </button>
                    )}
                    {item.status === 'counted' && (
                      <button 
                        className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90"
                        style={{ backgroundColor: '#6B2C91' }}
                        onClick={() => {
                          // Marquer l'élément comme validé
                          InventoryServiceWithFallback.updateInventoryItem(item.id, { 
                            status: 'validated',
                            validatedAt: new Date().toISOString(),
                            validatedBy: userData?.id
                          });
                        }}
                      >
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B2C91' }}>
          Résumé de l'Inventaire en Cours
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
              {currentInventoryItems.length}
            </div>
            <div className="text-sm text-gray-600">Articles à inventorier</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#00A86B' }}>
              {currentInventoryItems.filter(item => item.status === 'counted' || item.status === 'validated').length}
            </div>
            <div className="text-sm text-gray-600">Articles comptés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#DC143C' }}>
              {currentInventoryItems.filter(item => item.difference && item.difference !== 0).length}
            </div>
            <div className="text-sm text-gray-600">Écarts détectés</div>
          </div>
        </div>
        
        {/* Actions rapides pour l'inventaire en cours */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                const inventoryInProgress = inventories.find(inv => inv.status === 'in_progress');
                if (inventoryInProgress) {
                  handleUpdateInventoryStatus(inventoryInProgress.id, 'completed');
                }
              }}
              disabled={loading || !inventories.some(inv => inv.status === 'in_progress')}
              className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#00A86B' }}
            >
              <Square className="w-4 h-4 mr-2" />
              Terminer Inventaire
            </button>
            <button
              onClick={() => {
                const inventoryCompleted = inventories.find(inv => inv.status === 'completed');
                if (inventoryCompleted) {
                  handleApplyAdjustments(inventoryCompleted.id);
                }
              }}
              disabled={loading || !inventories.some(inv => inv.status === 'completed')}
              className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#DC143C' }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Appliquer Ajustements
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewInventoryModal
        isOpen={newInventoryModal.isOpen}
        onClose={newInventoryModal.closeModal}
        onSave={handleNewInventory}
      />
    </div>
  );
};

export default Inventory;