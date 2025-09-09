import React, { useState } from 'react';
import { X, Truck, Save, Mail, Phone, MapPin } from 'lucide-react';

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: any) => void;
}

const NewSupplierModal: React.FC<NewSupplierModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    categories: [] as string[],
    notes: ''
  });

  const availableCategories = [
    'Fournitures Bureau',
    'Consommables IT',
    'Consommables Médicaux',
    'Produits Entretien',
    'Équipements'
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, categories: [...formData.categories, category] });
    } else {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      contact: {
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      },
      status: 'active',
      rating: 0
    });
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      categories: [],
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Truck className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
              Nouveau Fournisseur
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du fournisseur *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: PHARMADIS MADAGASCAR"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code fournisseur *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: PHAR001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="contact@fournisseur.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="+261 XX XX XX XX"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="Adresse complète du fournisseur"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories de produits *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Veuillez sélectionner au moins une catégorie
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Informations complémentaires sur le fournisseur..."
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
              disabled={formData.categories.length === 0}
              className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#6B2C91' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Créer Fournisseur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSupplierModal;