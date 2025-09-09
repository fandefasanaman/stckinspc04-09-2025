import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Package
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { InventoryService } from '../services/inventoryService';
import NewInventoryModal from '../components/modals/NewInventoryModal';
import { Inventory as InventoryType, InventoryItem } from '../types';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const newInventoryModal = useModal();
  const { userData } = useAuth();

  // Utiliser le hook useFirestore pour récupérer les inventaires en temps réel
  const { data: inventories, loading: inventoriesLoading, error } = useFirestore<InventoryType>('inventories');

  const inventoryStatuses = [
    { value: 'all', label: 'Tous les inventaires' },
    { value: 'planned', label: 'Planifié' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'validated', label: 'Validé' }
  ];

  const currentInventoryItems = [
    {
      id: 1,
      code: 'FB001',
      name: 'Papier A4 80g',
      theoreticalStock: 150,
      physicalStock: 145,
      difference: -5,
      status: 'counted',
      location: 'Magasin A - Étagère 1'
    },
    {
      id: 2,
      code: 'IT002',
      name: 'Cartouches HP 305',
      theoreticalStock: 25,
      physicalStock: 23,
      difference: -2,
      status: 'counted',
      location: 'Magasin B - Armoire IT'
    },
    {
      id: 3,
      code: 'MED003',
      name: 'Gants latex M',
      theoreticalStock: 75,
      physicalStock: 78,
      difference: 3,
      status: 'counted',
      location: 'Magasin Médical'
    },
    {
      id: 4,
      code: 'ENT005',
      name: 'Désinfectant surfaces',
      theoreticalStock: 40,
      physicalStock: null,
      difference: null,
      status: 'pending',
      location: 'Magasin Entretien'
    }
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
      default:
        return null;
    }
  };

  const getDifferenceDisplay = (difference: number | null) => {
    if (difference === null) return '-';
    
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
      await InventoryService.createInventory({
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
      
      // Le hook useFirestore se mettra à jour automatiquement
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'inventaire:', error);
      alert('Erreur lors de la création de l\'inventaire: ' + error.message);
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#6B2C91' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600">Impossible de charger les inventaires</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Gestion des Inventaires
          </h1>
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
              <p className="text-sm text-gray-600">Inventaires</p>
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

      {/* Inventories List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
              Historique des Inventaires
            </h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                />
              </div>
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Inventaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventories.map((inventory) => (
                <tr key={inventory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {inventory.name}
                      </div>
                      <div className="text-sm" style={{ color: '#00A86B' }}>
                        {inventory.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inventory.scheduledDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inventory.responsible}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inventory.articlesCount}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Inventory Details */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Inventaire en Cours - IT Janvier
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Responsable: Jean Koffi | Démarré le: 08/01/2024
          </p>
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
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.theoreticalStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.physicalStock ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getDifferenceDisplay(item.difference)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getItemStatusBadge(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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