import React, { useState } from 'react';
import { X, ArrowUp, Save, Package, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useFirestoreWithFallback } from '../../hooks/useFirestoreWithFallback';
import { Article, Supplier, StockLocation } from '../../types';

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
}

const StockEntryModal: React.FC<StockEntryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    articleCode: '',
    articleId: '',
    quantity: '',
    supplierId: '',
    deliveryNote: '',
    receivedDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    expiryDate: '',
    location: '',
    qualityCheck: 'pending' as 'pending' | 'passed' | 'failed',
    qualityNotes: '',
    reference: '',
    notes: ''
  });

  // Récupérer les articles depuis Firestore
  const { data: articles } = useFirestoreWithFallback<Article>('articles');
  const { data: suppliers } = useFirestoreWithFallback<Supplier>('suppliers');
  const { data: locations } = useFirestoreWithFallback<StockLocation>('locations');

  // Filtrer les fournisseurs et emplacements actifs
  const activeSuppliers = suppliers.filter(s => s.status === 'active');
  const activeLocations = locations.filter(l => l.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.articleId || !formData.quantity || !formData.supplierId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation de la date d'expiration si fournie
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      if (!confirm('La date d\'expiration est dans le passé. Voulez-vous continuer ?')) {
        return;
      }
    }
    
    onSave({
      ...formData,
      type: 'entry',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      user: 'Utilisateur Actuel',
      status: 'pending',
      supplier: activeSuppliers.find(s => s.id === formData.supplierId)?.name || ''
    });
    
    setFormData({
      articleCode: '',
      articleId: '',
      quantity: '',
      supplierId: '',
      deliveryNote: '',
      receivedDate: new Date().toISOString().split('T')[0],
      batchNumber: '',
      expiryDate: '',
      location: '',
      qualityCheck: 'pending',
      qualityNotes: '',
      reference: '',
      notes: ''
    });
    onClose();
  };

  const handleArticleChange = (articleId: string) => {
    const selectedArticle = articles.find(a => a.id === articleId);
    setFormData({ 
      ...formData, 
      articleId,
      articleCode: selectedArticle?.code || ''
    });
  };

  if (!isOpen) return null;

  const selectedArticle = articles.find(a => a.id === formData.articleId);
  const selectedSupplier = activeSuppliers.find(s => s.id === formData.supplierId);
  const isMedicalCategory = selectedArticle?.category.toLowerCase().includes('médical') || 
                           selectedArticle?.category.toLowerCase().includes('medical');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ArrowUp className="w-6 h-6 mr-3" style={{ color: '#00A86B' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#00A86B' }}>
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
          {/* Informations de base */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" style={{ color: '#00A86B' }} />
              Informations de base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article *
                </label>
                <select
                  required
                  value={formData.articleId}
                  onChange={(e) => handleArticleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                >
                  <option value="">Sélectionner un article</option>
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>
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
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#00A86B' } as any}
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
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {activeSuppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </option>
                  ))}
                </select>
                {selectedSupplier && (
                  <p className="text-xs text-gray-500 mt-1">
                    Contact: {selectedSupplier.contact.phone || selectedSupplier.contact.email || 'Non renseigné'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations de livraison */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" style={{ color: '#00A86B' }} />
              Informations de livraison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de réception *
                </label>
                <input
                  type="date"
                  required
                  value={formData.receivedDate}
                  onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° Bon de livraison
                </label>
                <input
                  type="text"
                  value={formData.deliveryNote}
                  onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                  placeholder="Ex: BL-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emplacement de stockage
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#00A86B' } as any}
                  >
                    <option value="">Sélectionner un emplacement</option>
                    {activeLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence commande
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                  placeholder="Ex: CMD-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Informations produit (pour articles médicaux) */}
          {(isMedicalCategory || formData.batchNumber || formData.expiryDate) && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" style={{ color: '#D4AF37' }} />
                Informations produit
                {isMedicalCategory && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Article médical
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de lot
                    {isMedicalCategory && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    required={isMedicalCategory}
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#00A86B' } as any}
                    placeholder="Ex: LOT2024001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration
                    {isMedicalCategory && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="date"
                    required={isMedicalCategory}
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#00A86B' } as any}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {formData.expiryDate && new Date(formData.expiryDate) <= new Date() && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Attention: Date d'expiration dans le passé
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contrôle qualité */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" style={{ color: '#00A86B' }} />
              Contrôle qualité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État de la marchandise
                </label>
                <select
                  value={formData.qualityCheck}
                  onChange={(e) => setFormData({ ...formData, qualityCheck: e.target.value as 'pending' | 'passed' | 'failed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                >
                  <option value="pending">En attente de contrôle</option>
                  <option value="passed">Conforme</option>
                  <option value="failed">Non conforme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes de contrôle qualité
                </label>
                <textarea
                  rows={2}
                  value={formData.qualityNotes}
                  onChange={(e) => setFormData({ ...formData, qualityNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A86B' } as any}
                  placeholder="Observations sur l'état de la marchandise..."
                />
              </div>
            </div>
          </div>

          {/* Notes additionnelles */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#00A86B' } as any}
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Résumé de l'entrée */}
          {selectedArticle && formData.quantity && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Résumé de l'entrée</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Article:</strong> {selectedArticle.name} ({selectedArticle.code})</p>
                <p><strong>Quantité:</strong> {formData.quantity} {selectedArticle.unit}(s)</p>
                <p><strong>Stock actuel:</strong> {selectedArticle.currentStock} {selectedArticle.unit}(s)</p>
                <p><strong>Nouveau stock:</strong> {selectedArticle.currentStock + parseInt(formData.quantity || '0')} {selectedArticle.unit}(s)</p>
                {selectedSupplier && <p><strong>Fournisseur:</strong> {selectedSupplier.name}</p>}
                {formData.batchNumber && <p><strong>Lot:</strong> {formData.batchNumber}</p>}
                {formData.expiryDate && <p><strong>Expiration:</strong> {new Date(formData.expiryDate).toLocaleDateString()}</p>}
              </div>
            </div>
          )}

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
              style={{ backgroundColor: '#00A86B' }}
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