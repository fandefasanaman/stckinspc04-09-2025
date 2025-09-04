import React, { useState } from 'react';
import { X, ClipboardList, Save, Calendar } from 'lucide-react';

interface NewInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inventory: any) => void;
}

const NewInventoryModal: React.FC<NewInventoryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    responsible: '',
    scheduledDate: '',
    description: '',
    includeCategories: [] as string[]
  });

  const categories = [
    'Général',
    'Fournitures Bureau',
    'Consommables IT',
    'Consommables Médicaux',
    'Produits Entretien',
    'Équipements'
  ];

  const responsibles = [
    'Marie Kouassi',
    'Dr. Aya Traoré',
    'Jean Koffi',
    'Paul Diabaté'
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        includeCategories: [...formData.includeCategories, category]
      });
    } else {
      setFormData({
        ...formData,
        includeCategories: formData.includeCategories.filter(c => c !== category)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: Date.now(),
      status: 'planned',
      createdDate: new Date().toISOString().split('T')[0],
      articlesCount: 0,
      discrepancies: 0,
      adjustmentValue: 0
    });
    setFormData({
      name: '',
      category: '',
      responsible: '',
      scheduledDate: '',
      description: '',
      includeCategories: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ClipboardList className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
              Nouvel Inventaire
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'inventaire *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: Inventaire Trimestriel Q1 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'inventaire *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="">Sélectionner un type</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable *
              </label>
              <select
                required
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="">Sélectionner un responsable</option>
                {responsibles.map(responsible => (
                  <option key={responsible} value={responsible}>
                    {responsible}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date prévue *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories à inclure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(1).map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.includeCategories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Description de l'inventaire..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#6B2C91' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Créer Inventaire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInventoryModal;