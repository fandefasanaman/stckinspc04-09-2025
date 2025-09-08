import React, { useState } from 'react';
import { X, ArrowDown, Save } from 'lucide-react';

interface StockExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exit: any) => void;
}

const StockExitModal: React.FC<StockExitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    articleCode: '',
    quantity: '',
    service: '',
    beneficiary: '',
    reason: '',
    reference: '',
    notes: ''
  });

  const articles = [
    { code: 'FB001', name: 'Papier A4 80g', unit: 'paquet', currentStock: 150 },
    { code: 'IT002', name: 'Cartouches HP 305', unit: 'unité', currentStock: 25 },
    { code: 'MED003', name: 'Gants latex M', unit: 'boîte', currentStock: 75 },
    { code: 'ENT005', name: 'Désinfectant surfaces', unit: 'litre', currentStock: 40 }
  ];

  const services = [
    'Service Pédagogique et Scientifique',
    'Service Financier',
    'Service Administratif',
    'Service Documentation',
    'Direction Formation et Recherche',
    'Direction des Affaires Administratives',
    'Direction Générale',
    'Unité d\'Échographie',
    'Unité d\'Acupuncture'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      type: 'exit',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      user: 'Utilisateur Actuel',
      status: 'pending'
    });
    setFormData({
      articleCode: '',
      quantity: '',
      service: '',
      beneficiary: '',
      reason: '',
      reference: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedArticle = articles.find(a => a.code === formData.articleCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ArrowDown className="w-6 h-6 mr-3" style={{ color: '#DC143C' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#DC143C' }}>
              Sortie de Stock
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
                style={{ '--tw-ring-color': '#DC143C' } as any}
              >
                <option value="">Sélectionner un article</option>
                {articles.map(article => (
                  <option key={article.code} value={article.code}>
                    {article.code} - {article.name} (Stock: {article.currentStock})
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
                  max={selectedArticle?.currentStock || undefined}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#DC143C' } as any}
                  placeholder="Ex: 10"
                />
                {selectedArticle && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    /{selectedArticle.currentStock} {selectedArticle.unit}(s)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Demandeur *
              </label>
              <select
                required
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#DC143C' } as any}
              >
                <option value="">Sélectionner un service</option>
                {services.map(service => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bénéficiaire *
              </label>
              <input
                type="text"
                required
                value={formData.beneficiary}
                onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#DC143C' } as any}
                placeholder="Ex: Secrétariat SPS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence Demande
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#DC143C' } as any}
                placeholder="Ex: BS-2024-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de la sortie *
              </label>
              <textarea
                required
                rows={2}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#DC143C' } as any}
                placeholder="Ex: Consommables pour consultation"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes additionnelles
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#DC143C' } as any}
                placeholder="Notes optionnelles..."
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
              style={{ backgroundColor: '#DC143C' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer Sortie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockExitModal;