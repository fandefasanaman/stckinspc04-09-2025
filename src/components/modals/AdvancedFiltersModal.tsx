import React, { useState } from 'react';
import { X, Filter, Search, Calendar } from 'lucide-react';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    categories: [] as string[],
    services: [] as string[],
    users: [] as string[],
    stockStatus: 'all',
    movementType: 'all',
    minQuantity: '',
    maxQuantity: ''
  });

  const categories = [
    'Fournitures Bureau',
    'Consommables IT',
    'Consommables Médicaux',
    'Produits Entretien'
  ];

  const services = [
    'Service Pédagogique et Scientifique',
    'Service Financier',
    'Service Administratif',
    'Service Documentation',
    'Direction Formation et Recherche',
    'Direction des Affaires Administratives',
    'Direction Générale'
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFilters({ ...filters, categories: [...filters.categories, category] });
    } else {
      setFilters({ ...filters, categories: filters.categories.filter(c => c !== category) });
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFilters({ ...filters, services: [...filters.services, service] });
    } else {
      setFilters({ ...filters, services: filters.services.filter(s => s !== service) });
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      categories: [],
      services: [],
      users: [],
      stockStatus: 'all',
      movementType: 'all',
      minQuantity: '',
      maxQuantity: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Filter className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
              Filtres Avancés
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Période</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Catégories</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.services.includes(service)}
                      onChange={(e) => handleServiceChange(service, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statut Stock</h3>
              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="all">Tous les statuts</option>
                <option value="normal">Stock normal</option>
                <option value="low">Stock faible</option>
                <option value="out">Rupture de stock</option>
              </select>
            </div>

            {/* Movement Type */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Type de Mouvement</h3>
              <select
                value={filters.movementType}
                onChange={(e) => setFilters({ ...filters, movementType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="all">Tous les mouvements</option>
                <option value="entry">Entrées uniquement</option>
                <option value="exit">Sorties uniquement</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#6B2C91' }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Appliquer Filtres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFiltersModal;