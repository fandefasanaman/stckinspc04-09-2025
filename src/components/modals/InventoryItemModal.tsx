import React, { useState } from 'react';
import { X, Package, Save, MapPin, FileText } from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => void;
  item?: InventoryItem;
  mode: 'count' | 'edit' | 'view';
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  item,
  mode = 'count'
}) => {
  const [formData, setFormData] = useState({
    physicalStock: item?.physicalStock?.toString() || '',
    notes: item?.notes || '',
    location: item?.location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const physicalStock = parseInt(formData.physicalStock);
    if (isNaN(physicalStock) || physicalStock < 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }
    
    onSave({
      physicalStock,
      notes: formData.notes,
      location: formData.location
    });
    
    onClose();
  };

  const getDifferenceDisplay = (theoretical: number, physical: number) => {
    const difference = physical - theoretical;
    const color = difference > 0 ? '#00A86B' : difference < 0 ? '#DC143C' : '#6B2C91';
    const sign = difference > 0 ? '+' : '';
    
    return (
      <span style={{ color }} className="font-medium">
        {sign}{difference}
      </span>
    );
  };

  if (!isOpen || !item) return null;

  const isReadOnly = mode === 'view';
  const physicalStock = parseInt(formData.physicalStock) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
                {mode === 'count' ? 'Compter Article' : mode === 'edit' ? 'Modifier Comptage' : 'Détails Article'}
              </h2>
              <p className="text-sm text-gray-600">
                {item.articleName} ({item.articleCode})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Informations de l'article */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Informations Article</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Code:</span>
                <span className="ml-2 font-medium">{item.articleCode}</span>
              </div>
              <div>
                <span className="text-gray-600">Nom:</span>
                <span className="ml-2 font-medium">{item.articleName}</span>
              </div>
              <div>
                <span className="text-gray-600">Stock théorique:</span>
                <span className="ml-2 font-bold" style={{ color: '#6B2C91' }}>
                  {item.theoreticalStock}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Emplacement:</span>
                <span className="ml-2">{item.location || 'Non défini'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Stock physique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock physique compté *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.physicalStock}
                  onChange={(e) => setFormData({ ...formData, physicalStock: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="Quantité comptée"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  unités
                </div>
              </div>
              
              {/* Affichage de la différence en temps réel */}
              {formData.physicalStock && !isNaN(physicalStock) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Différence:</span>
                    <span className="font-medium">
                      {getDifferenceDisplay(item.theoreticalStock, physicalStock)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Nouveau stock:</span>
                    <span className="font-bold" style={{ color: '#6B2C91' }}>
                      {physicalStock}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Emplacement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emplacement de stockage
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="Ex: Magasin A - Étagère 2"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes de comptage
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="Observations, remarques, conditions de stockage..."
                />
              </div>
            </div>

            {/* Informations de comptage existantes */}
            {item.countedAt && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Informations de comptage</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Compté par:</strong> {item.countedBy}</p>
                  <p><strong>Date de comptage:</strong> {new Date(item.countedAt).toLocaleString()}</p>
                  {item.validatedAt && (
                    <>
                      <p><strong>Validé par:</strong> {item.validatedBy}</p>
                      <p><strong>Date de validation:</strong> {new Date(item.validatedAt).toLocaleString()}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isReadOnly && (
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
                {mode === 'count' ? 'Enregistrer Comptage' : 'Mettre à jour'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default InventoryItemModal;