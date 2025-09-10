import React, { useState } from 'react';
import { X, ArrowUp, Save, Package, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useFirestoreWithFallback } from '../../hooks/useFirestoreWithFallback';
import { Article, Supplier } from '../../types';
import LocationAutocomplete from '../LocationAutocomplete';
import { LocationStorageService } from '../../services/locationStorageService';

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

  // 🎯 DONNÉES ENRICHIES POUR TEST - Articles avec fournisseurs liés
  const enhancedArticlesFallback: Article[] = [
    {
      id: 'art-med001',
      code: 'med0001',
      name: 'ram',
      category: 'Consommables Médicaux',
      unit: 'unité',
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      supplier: 'SODIM ANDRAHARO', // Nom exact du fournisseur
      supplierId: 'sup-sodim', // ID exact du fournisseur
      description: 'Médicament RAM',
      status: 'normal',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'art-fb001',
      code: 'FB001',
      name: 'Papier A4 80g',
      category: 'Fournitures Bureau',
      unit: 'paquet',
      currentStock: 150,
      minStock: 20,
      maxStock: 200,
      supplier: 'DISTRIMAD', // Nom exact du fournisseur
      supplierId: 'sup-distrimad', // ID exact du fournisseur
      description: 'Papier A4 standard',
      status: 'normal',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'art-it002',
      code: 'IT002',
      name: 'Cartouches HP 305',
      category: 'Consommables IT',
      unit: 'unité',
      currentStock: 25,
      minStock: 5,
      maxStock: 50,
      supplier: 'SOCOBIS', // Nom exact du fournisseur
      supplierId: 'sup-socobis', // ID exact du fournisseur
      description: 'Cartouches d\'encre HP',
      status: 'normal',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  // 🎯 FOURNISSEURS ENRICHIS avec SODIM ANDRAHARO
  const enhancedSuppliersFallback: Supplier[] = [
    {
      id: 'sup-sodim',
      name: 'SODIM ANDRAHARO',
      code: 'SODI001',
      status: 'active',
      contact: { 
        phone: '+261 20 22 111 22', 
        email: 'contact@sodim.mg',
        address: 'Andraharo, Antananarivo'
      },
      categories: ['Consommables Médicaux'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'sup-distrimad',
      name: 'DISTRIMAD',
      code: 'DIST001',
      status: 'active',
      contact: { 
        phone: '+261 20 22 234 56', 
        email: 'info@distrimad.mg' 
      },
      categories: ['Fournitures Bureau'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'sup-socobis',
      name: 'SOCOBIS',
      code: 'SOCO001',
      status: 'active',
      contact: { 
        phone: '+261 20 22 345 67', 
        email: 'commande@socobis.mg' 
      },
      categories: ['Consommables IT'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'sup-medical',
      name: 'MEDICAL SUPPLY MG',
      code: 'MESU001',
      status: 'active',
      contact: { 
        phone: '+261 20 22 456 78', 
        email: 'vente@medicalsupply.mg' 
      },
      categories: ['Consommables Médicaux'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'sup-bureau',
      name: 'BUREAU CENTER',
      code: 'BURE001',
      status: 'active',
      contact: { 
        phone: '+261 20 22 567 89', 
        email: 'contact@bureaucenter.mg' 
      },
      categories: ['Fournitures Bureau'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  // Récupérer les articles depuis Firestore avec données enrichies
  const { data: articles } = useFirestoreWithFallback<Article>('articles', [], [], enhancedArticlesFallback);
  
  // Récupérer les fournisseurs depuis Firestore avec données enrichies
  const { data: suppliers } = useFirestoreWithFallback<Supplier>('suppliers', [], [], enhancedSuppliersFallback);
  
  // Filtrer les fournisseurs actifs
  const activeSuppliers = suppliers.filter(s => s.status === 'active');

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
    
    // Sauvegarder l'emplacement dans l'historique s'il est renseigné
    if (formData.location.trim()) {
      LocationStorageService.addLocationToHistory(formData.location.trim());
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

  // 🎯 CORRECTION 1: FOURNISSEUR AUTO-SÉLECTIONNÉ - Logique améliorée
  const handleArticleChange = (articleId: string) => {
    const selectedArticle = articles.find(a => a.id === articleId);
    
    if (selectedArticle) {
      console.log('🔍 === DIAGNOSTIC LIAISON ARTICLE-FOURNISSEUR ===');
      console.log('🎯 Article sélectionné:', selectedArticle.name, '(', selectedArticle.code, ')');
      console.log('🎯 Fournisseur attendu:', selectedArticle.supplier);
      console.log('🎯 ID Fournisseur attendu:', selectedArticle.supplierId);
      console.log('🎯 Fournisseurs disponibles:', activeSuppliers.map(s => ({ id: s.id, name: s.name })));
      
      // 🚀 LOGIQUE DE SÉLECTION AUTOMATIQUE DU FOURNISSEUR
      let supplierIdToSet = '';
      let matchMethod = '';
      
      // Méthode 1: Utiliser l'ID du fournisseur si disponible
      if (selectedArticle.supplierId) {
        const supplierExists = activeSuppliers.find(s => s.id === selectedArticle.supplierId);
        if (supplierExists) {
          supplierIdToSet = selectedArticle.supplierId;
          matchMethod = 'ID exact';
          console.log('✅ Méthode 1 - Fournisseur trouvé par ID exact:', supplierExists.name);
        } else {
          console.log('❌ Méthode 1 - ID fournisseur non trouvé:', selectedArticle.supplierId);
        }
      }
      
      // Méthode 2: Chercher par nom si pas d'ID ou ID non trouvé
      if (!supplierIdToSet && selectedArticle.supplier) {
        console.log('🔍 Méthode 2 - Recherche par nom exact:', selectedArticle.supplier);
        const foundSupplier = activeSuppliers.find(s => 
          s.name.toLowerCase().trim() === selectedArticle.supplier?.toLowerCase().trim()
        );
        if (foundSupplier) {
          supplierIdToSet = foundSupplier.id;
          matchMethod = 'Nom exact';
          console.log('✅ Méthode 2 - Fournisseur trouvé par nom exact:', foundSupplier.name);
        } else {
          console.log('❌ Méthode 2 - Nom fournisseur non trouvé:', selectedArticle.supplier);
        }
      }
      
      // Méthode 3: Chercher par correspondance partielle
      if (!supplierIdToSet && selectedArticle.supplier) {
        console.log('🔍 Méthode 3 - Recherche par correspondance partielle:', selectedArticle.supplier);
        const foundSupplier = activeSuppliers.find(s => 
          s.name.toLowerCase().includes(selectedArticle.supplier?.toLowerCase() || '') ||
          (selectedArticle.supplier?.toLowerCase() || '').includes(s.name.toLowerCase())
        );
        if (foundSupplier) {
          supplierIdToSet = foundSupplier.id;
          matchMethod = 'Correspondance partielle';
          console.log('✅ Méthode 3 - Fournisseur trouvé par correspondance partielle:', foundSupplier.name);
        } else {
          console.log('❌ Méthode 3 - Aucune correspondance partielle trouvée');
        }
      }
      
      // 🚀 DIAGNOSTIC FINAL DÉTAILLÉ
      console.log('🔍 === RÉSULTAT FINAL ===');
      console.log('- Fournisseur sélectionné:', supplierIdToSet ? activeSuppliers.find(s => s.id === supplierIdToSet)?.name : 'AUCUN');
      console.log('- ID sélectionné:', supplierIdToSet || 'AUCUN');
      console.log('- Méthode de correspondance:', matchMethod || 'AUCUNE');
      console.log('- Liaison réussie:', supplierIdToSet ? '✅ OUI' : '❌ NON');
      console.log('🔍 === FIN DIAGNOSTIC ===');
      
      setFormData({ 
        ...formData, 
        articleId,
        articleCode: selectedArticle.code,
        supplierId: supplierIdToSet // 🎯 FOURNISSEUR AUTOMATIQUE
      });
      
      // 🚀 FEEDBACK VISUEL pour confirmer la sélection
      if (supplierIdToSet) {
        const selectedSupplierName = activeSuppliers.find(s => s.id === supplierIdToSet)?.name;
        console.log(`✅ SUCCÈS FINAL: Article "${selectedArticle.name}" → Fournisseur "${selectedSupplierName}" sélectionné automatiquement via ${matchMethod}`);
      } else {
        console.error(`❌ ÉCHEC FINAL: Aucun fournisseur trouvé pour l'article "${selectedArticle.name}"`);
        console.error('🔧 SOLUTION: Vérifiez que les IDs et noms correspondent exactement entre articles et fournisseurs');
      }
    } else {
      setFormData({ 
        ...formData, 
        articleId,
        articleCode: '',
        supplierId: '' // Réinitialiser le fournisseur si pas d'article
      });
      console.log('❌ Article non trouvé pour ID:', articleId);
    }
  };

  if (!isOpen) return null;

  const selectedArticle = articles.find(a => a.id === formData.articleId);
  const selectedSupplier = activeSuppliers.find(s => s.id === formData.supplierId);
  const isMedicalCategory = selectedArticle?.category.toLowerCase().includes('médical') || 
                           selectedArticle?.category.toLowerCase().includes('medical');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header - Fixe en haut */}
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

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Contenu défilable */}
          <div className="p-6 overflow-y-auto flex-1">
          {/* 🚀 ZONE DE TEST POUR VÉRIFICATION */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔍 DIAGNOSTIC EN TEMPS RÉEL - Liaison Article-Fournisseur</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Article sélectionné:</strong> {selectedArticle ? `${selectedArticle.code} - ${selectedArticle.name}` : 'Aucun'}</p>
              <p><strong>Fournisseur de l'article:</strong> {selectedArticle?.supplier || 'Non défini'}</p>
              <p><strong>ID Fournisseur:</strong> {selectedArticle?.supplierId || 'Non défini'}</p>
              <p><strong>Fournisseur auto-sélectionné:</strong> {selectedSupplier ? `${selectedSupplier.name} (${selectedSupplier.id})` : 'Aucun'}</p>
              <p><strong>Fournisseurs disponibles:</strong> {activeSuppliers.length} ({activeSuppliers.map(s => s.name).join(', ')})</p>
              <p className={`font-medium ${selectedArticle && selectedSupplier ? 'text-green-700' : 'text-red-700'}`}>
                {selectedArticle && selectedSupplier ? '✅ Liaison automatique RÉUSSIE' : '❌ ÉCHEC de liaison automatique'}
              </p>
              {selectedArticle && !selectedSupplier && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 font-medium">🚨 PROBLÈME DÉTECTÉ:</p>
                  <p className="text-red-600 text-xs">
                    L'article "{selectedArticle.name}" a le fournisseur "{selectedArticle.supplier}" 
                    avec l'ID "{selectedArticle.supplierId}", mais ce fournisseur n'existe pas dans la liste.
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    🔧 Vérifiez que l'ID "{selectedArticle.supplierId}" correspond à un fournisseur actif.
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('🔍 === DIAGNOSTIC COMPLET LIAISON ===');
                console.log('📊 Articles total:', articles.length);
                console.log('🏢 Fournisseurs total:', activeSuppliers.length);
                console.log('📦 Articles avec fournisseur défini:', articles.filter(a => a.supplier).length);
                console.log('📦 Articles avec ID fournisseur défini:', articles.filter(a => a.supplierId).length);
                
                // Vérifier chaque liaison
                articles.forEach(article => {
                  if (article.supplier || article.supplierId) {
                    const linkedSupplier = activeSuppliers.find(s => s.id === article.supplierId);
                    console.log(`${linkedSupplier ? '✅' : '❌'} ${article.code}: ${article.supplier} → ${linkedSupplier ? linkedSupplier.name : 'NON TROUVÉ'}`);
                  }
                });
                console.log('🔍 === FIN DIAGNOSTIC COMPLET ===');
              }}
              className="mt-2 px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
            >
              🔍 Diagnostic Complet Console
            </button>
          </div>

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
                  <span className="ml-2 text-xs text-blue-600">
                    (Testez avec "med0001 - ram" pour voir la sélection automatique)
                  </span>
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
                  {selectedArticle?.supplier && selectedSupplier && (
                    <span className="ml-2 text-xs font-medium text-green-600">
                      ✅ Auto-sélectionné depuis l'article
                    </span>
                  )}
                  {selectedArticle?.supplier && !selectedSupplier && (
                    <span className="ml-2 text-xs font-medium text-red-600">
                      ⚠️ Fournisseur "{selectedArticle.supplier}" non trouvé
                    </span>
                  )}
                </label>
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => {
                    setFormData({ ...formData, supplierId: e.target.value });
                    const newSupplier = activeSuppliers.find(s => s.id === e.target.value);
                    console.log('🔄 Fournisseur changé manuellement:', newSupplier?.name);
                  }}
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
              {selectedArticle && selectedSupplier && (
                <span className="ml-auto px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Fournisseur lié automatiquement
                </span>
              )}
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
                  <span className="ml-2 text-xs text-blue-600">
                    🎯 (Autocomplete amélioré - tapez "ETAGERE" pour tester)
                  </span>
                </label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(value) => {
                    setFormData({ ...formData, location: value });
                    console.log('📍 Emplacement sélectionné:', value);
                  }}
                  placeholder="Ex: ETAGERE 2, Magasin A - Étagère 2, Pharmacie - Armoire B..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tapez pour voir les suggestions ou créer un nouvel emplacement
                </p>
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
                {formData.location && <p><strong>Emplacement:</strong> {formData.location}</p>}
                {formData.batchNumber && <p><strong>Lot:</strong> {formData.batchNumber}</p>}
                {formData.expiryDate && <p><strong>Expiration:</strong> {new Date(formData.expiryDate).toLocaleDateString()}</p>}
              </div>
            </div>
          )}
          </div>

          {/* Boutons d'action - Fixes en bas */}
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-white">
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