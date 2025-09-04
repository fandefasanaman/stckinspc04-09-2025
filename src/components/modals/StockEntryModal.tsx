import React, { useState } from 'react';
import { X, ArrowUp, Save, Package } from 'lucide-react';

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
}

const StockEntryModal: React.FC<StockEntryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    articleCode: '',
    quantity: '',
    supplier: '',
    reference: '',
    notes: ''
  });

  const articles = [
    { code: 'FB001', name: 'Papier A4 80g', unit: 'paquet' },
    { code: 'IT002', name: 'Cartouches HP 305', unit: 'unité' },
    { code: 'MED003', name: 'Gants latex M', unit: 'boîte' },
    { code: 'ENT005', name: 'Désinfectant surfaces', unit: 'litre' }
  ];

  const suppliers = [
    'PHARMADIS MADAGASCAR',
    'DISTRIMAD',
    'SOCOMA',
    'HYGIÈNE MADA',
    'FOURNITURES ANTANANARIVO'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      type: 'entry',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      user: 'Utilisateur Actuel',
      status: 'pending'
    });
    setFormData({
      articleCode: '',
      quantity: '',
      supplier: '',
      reference: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedArticle = articles.find(a => a.code === formData.articleCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ArrowUp className="w-6 h-6 mr-3" style={{ color: '#2D8A47' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#2D8A47' }}>
              Entrée de Stock
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
                Article *
              </label>
              <select
                required
                value={formData.articleCode}
                onChange={(e) => setFormData({ ...formData, articleCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#2D8A47' } as any}
              >
                <option value="">Sélectionner un article</option>
                {articles.map(article => (
                  <option key={article.code} value={article.code}>
                    {article.code} - {article.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#2D8A47' } as any}
                  placeholder="Ex: 50"
                />
                {selectedArticle && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {selectedArticle.unit}(s)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur *
              </label>
              <select
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#2D8A47' } as any}
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence Document
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#2D8A47' } as any}
                placeholder="Ex: BE-2024-001"
              />
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
                style={{ '--tw-ring-color': '#2D8A47' } as any}
                placeholder="Notes additionnelles..."
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
              style={{ backgroundColor: '#2D8A47' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer Entrée
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryModal;