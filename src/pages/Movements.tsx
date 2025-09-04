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
  Download
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import StockEntryModal from '../components/modals/StockEntryModal';
import StockExitModal from '../components/modals/StockExitModal';

const Movements: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const stockEntryModal = useModal();
  const stockExitModal = useModal();

  const movementTypes = [
    { value: 'all', label: 'Tous les mouvements' },
    { value: 'entry', label: 'Entrées' },
    { value: 'exit', label: 'Sorties' }
  ];

  const services = [
    { value: 'all', label: 'Tous les services' },
    { value: 'sps', label: 'Service Pédagogique et Scientifique' },
    { value: 'sf', label: 'Service Financier' },
    { value: 'sa', label: 'Service Administratif' },
    { value: 'sdoc', label: 'Service Documentation' },
    { value: 'dfr', label: 'Direction Formation et Recherche' },
    { value: 'daaf', label: 'Direction des Affaires Administratives' },
    { value: 'dg', label: 'Direction Générale' },
    { value: 'echo', label: 'Unité d\'Échographie' },
    { value: 'acup', label: 'Unité d\'Acupuncture' }
  ];

  const movements = [
    {
      id: 1,
      type: 'entry',
      date: '2024-01-15',
      time: '10:30',
      article: 'Papier A4 80g',
      code: 'FB001',
      quantity: 50,
      unit: 'paquets',
      user: 'Marie Kouassi',
      service: 'Service Administratif',
      reference: 'BR-2024-001',
      supplier: 'PAPETERIE MODERNE',
      status: 'validated'
    },
    {
      id: 2,
      type: 'exit',
      date: '2024-01-15',
      time: '09:15',
      article: 'Cartouches HP 305',
      code: 'IT002',
      quantity: 3,
      unit: 'unités',
      user: 'Jean Koffi',
      service: 'Service Pédagogique et Scientifique',
      reference: 'BS-2024-045',
      beneficiary: 'Secrétariat SPS',
      reason: 'Remplacement cartouches imprimante',
      status: 'validated'
    },
    {
      id: 3,
      type: 'entry',
      date: '2024-01-14',
      time: '16:45',
      article: 'Gants latex M',
      code: 'MED003',
      quantity: 100,
      unit: 'boîtes',
      user: 'Dr. Aya Traoré',
      service: 'Unité d\'Échographie',
      reference: 'BR-2024-002',
      supplier: 'MEDICAL PLUS',
      status: 'validated'
    },
    {
      id: 4,
      type: 'exit',
      date: '2024-01-14',
      time: '14:20',
      article: 'Stylos bille bleu',
      code: 'FB002',
      quantity: 20,
      unit: 'unités',
      user: 'Paul Diabaté',
      service: 'Direction Générale',
      reference: 'BS-2024-046',
      beneficiary: 'Secrétariat DG',
      reason: 'Fournitures bureau mensuel',
      status: 'pending'
    },
    {
      id: 5,
      type: 'exit',
      date: '2024-01-14',
      time: '11:30',
      article: 'Désinfectant surfaces',
      code: 'ENT005',
      quantity: 5,
      unit: 'litres',
      user: 'Fatou Bamba',
      service: 'Service Documentation',
      reference: 'BS-2024-047',
      beneficiary: 'Équipe nettoyage',
      reason: 'Nettoyage locaux',
      status: 'validated'
    }
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
    const matchesSearch = movement.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    const matchesService = selectedService === 'all' || 
                          movement.service.toLowerCase().includes(selectedService);
    return matchesSearch && matchesType && matchesService;
  });

  const handleStockEntry = (entryData: any) => {
    console.log('Nouvelle entrée:', entryData);
    // Logique pour enregistrer l'entrée
  };

  const handleStockExit = (exitData: any) => {
    console.log('Nouvelle sortie:', exitData);
    // Logique pour enregistrer la sortie
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Mouvements de Stock
          </h1>
          <p className="mt-1" style={{ color: '#5A4A42' }}>
            Suivez toutes les entrées et sorties de stock
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={stockEntryModal.openModal}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#2D8A47' }}
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Entrée Stock
          </button>
          <button 
            onClick={stockExitModal.openModal}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#6B2C91' }}
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            Sortie Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
                          {movement.article}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.code}
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
                        <span className="text-sm text-gray-900">{movement.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span 
                          className="text-sm font-medium"
                          style={{ color: '#00A86B' }}
                        >
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
      </div>

      {/* Modals */}
      <StockEntryModal
        isOpen={stockEntryModal.isOpen}
        onClose={stockEntryModal.closeModal}
        onSave={handleStockEntry}
      />
      <StockExitModal
        isOpen={stockExitModal.isOpen}
        onClose={stockExitModal.closeModal}
        onSave={handleStockExit}
      />
    </div>
  );
};

export default Movements;