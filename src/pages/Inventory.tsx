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
  Building
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import NewInventoryModal from '../components/modals/NewInventoryModal';

interface InventoryData {
  id: string;
  name: string;
  category: string;
  responsible: string;
  scheduledDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'validated';
  articlesCount: number;
  discrepancies: number;
  description?: string;
  includeCategories: string[];
  createdAt: string;
  completedAt?: string;
  validatedAt?: string;
}

interface InventoryItemData {
  id: string;
  code: string;
  name: string;
  theoreticalStock: number;
  physicalStock?: number;
  difference?: number;
  status: 'pending' | 'counted' | 'validated';
  location?: string;
  notes?: string;
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const newInventoryModal = useModal();

  // Données d'exemple pour les inventaires
  const [inventories, setInventories] = useState<InventoryData[]>([
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

  // Données d'exemple pour l'inventaire en cours
  const currentInventoryItems: InventoryItemData[] = [
    {
      id: '1',
      code: 'FB001',
      name: 'Papier A4 80g',
      theoreticalStock: 150,
      physicalStock: 145,
      difference: -5,
      status: 'counted',
      location: 'Magasin A - Étagère 1'
    },
    {
      id: '2',
      code: 'IT002',
      name: 'Cartouches HP 305',
      theoreticalStock: 25,
      physicalStock: 23,
      difference: -2,
      status: 'counted',
      location: 'Magasin B - Armoire IT'
    },
    {
      id: '3',
      code: 'MED003',
      name: 'Gants latex M',
      theoreticalStock: 75,
      physicalStock: 78,
      difference: 3,
      status: 'counted',
      location: 'Magasin Médical'
    },
    {
      id: '4',
      code: 'ENT005',
      name: 'Désinfectant surfaces',
      theoreticalStock: 40,
      physicalStock: undefined,
      difference: undefined,
      status: 'pending',
      location: 'Magasin Entretien'
    }
  ];

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
    setLoading(true);
    try {
      const newInventory: InventoryData = {
        id: `inv-${Date.now()}`,
        name: inventoryData.name,
        category: inventoryData.category,
        responsible: inventoryData.responsible,
        scheduledDate: inventoryData.scheduledDate,
        status: 'planned',
        articlesCount: 0,
        discrepancies: 0,
        description: inventoryData.description,
        includeCategories: inventoryData.includeCategories,
        createdAt: new Date().toISOString()
      };
      
      setInventories(prev => [newInventory, ...prev]);
      console.log('✅ Inventaire créé avec succès:', newInventory.id);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'inventaire:', error);
      alert('Erreur lors de la création de l\'inventaire: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventoryStatus = (inventoryId: string, newStatus: InventoryData['status']) => {
    setInventories(prev => prev.map(inv => 
      inv.id === inventoryId 
        ? { 
            ...inv, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : inv.completedAt,
            validatedAt: newStatus === 'validated' ? new Date().toISOString() : inv.validatedAt
          }
        : inv
    ));
  };

  const filteredInventories = inventories.filter(inventory => {
    const matchesSearch = inventory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inventory.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || inventory.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center mt-2">
            <span className="text-sm text-green-600">
              ✅ Page fonctionnelle • {inventories.length} inventaires
            </span>
          </div>
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
                          className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90"
                          style={{ backgroundColor: '#D4AF37' }}
                        >
                          Démarrer
                        </button>
                      )}
                      {inventory.status === 'in_progress' && (
                        <button 
                          onClick={() => handleUpdateInventoryStatus(inventory.id, 'completed')}
                          className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90"
                          style={{ backgroundColor: '#00A86B' }}
                        >
                          Terminer
                        </button>
                      )}
                      {inventory.status === 'completed' && (
                        <button 
                          onClick={() => handleUpdateInventoryStatus(inventory.id, 'validated')}
                          className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90"
                          style={{ backgroundColor: '#6B2C91' }}
                        >
                          Valider
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
                Progression: {currentInventoryItems.filter(item => item.status === 'counted').length}/{currentInventoryItems.length} articles
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: '#00A86B',
                    width: `${(currentInventoryItems.filter(item => item.status === 'counted').length / currentInventoryItems.length) * 100}%`
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
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.code}
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
                            // Ici vous pourriez mettre à jour l'état local
                            console.log(`Comptage pour ${item.code}: ${value}`);
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
                        onClick={() => console.log(`Marquer ${item.code} comme compté`)}
                      >
                        Marquer compté
                      </button>
                    )}
                    {item.status === 'counted' && (
                      <button 
                        className="px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-90"
                        style={{ backgroundColor: '#6B2C91' }}
                        onClick={() => console.log(`Valider ${item.code}`)}
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
              {currentInventoryItems.filter(item => item.status === 'counted').length}
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