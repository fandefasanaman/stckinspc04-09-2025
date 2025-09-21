import React, { useState, useEffect } from 'react';
import { X, Package, Save, Edit } from 'lucide-react';
import { Article } from '../../types';

interface EditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articleId: string, updates: Partial<Article>) => void;
  article: Article | null;
}

const EditArticleModal: React.FC<EditArticleModalProps> = ({ isOpen, onClose, onSave, article }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    unit: '',
    minStock: '',
    maxStock: '',
    supplier: '',
    description: ''
  });

  const categories = [
    'Fournitures Bureau',
    'Consommables IT',
    'Consommables Médicaux',
    'Produits Entretien',
    'Équipements'
  ];

  const units = [
    'unité',
    'paquet',
    'boîte',
    'litre',
    'kilogramme',
    'mètre',
    'lot'
  ];

  // Pré-remplir le formulaire avec les données de l'article
  useEffect(() => {
    if (article) {
      setFormData({
        code: article.code,
        name: article.name,
        category: article.category,
        unit: article.unit,
        minStock: article.minStock.toString(),
        maxStock: article.maxStock.toString(),
        supplier: article.supplier || '',
        description: article.description || ''
      });
    }
  }, [article]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!article) return;
    
    // Validation des champs obligatoires
    if (!formData.code || !formData.name || !formData.category || !formData.unit) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation des stocks
    const minStock = parseInt(formData.minStock);
    const maxStock = parseInt(formData.maxStock);
    
    if (isNaN(minStock) || isNaN(maxStock) || minStock < 0 || maxStock < 0) {
      alert('Les stocks minimum et maximum doivent être des nombres positifs');
      return;
    }
    
    if (minStock >= maxStock) {
      alert('Le stock maximum doit être supérieur au stock minimum');
      return;
    }

    // Préparer les mises à jour
    const updates: Partial<Article> = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      minStock,
      maxStock,
      supplier: formData.supplier.trim() || undefined,
      description: formData.description.trim() || undefined
    };

    onSave(article.id, updates);
    onClose();
  };

  const handleClose = () => {
    // Réinitialiser le formulaire
    setFormData({
      code: '',
      name: '',
      category: '',
      unit: '',
      minStock: '',
      maxStock: '',
      supplier: '',
      description: ''
    });
    onClose();
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Edit className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
                Modifier Article
              </h2>
              <p className="text-sm text-gray-600">
                {article.code} - {article.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Informations actuelles de l'article */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Informations actuelles</h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
              <div><strong>Stock actuel:</strong> {article.currentStock} {article.unit}</div>
              <div><strong>Statut:</strong> {
                article.status === 'normal' ? 'Normal' :
                article.status === 'low' ? 'Stock faible' : 'Rupture'
              }</div>
              <div><strong>Créé le:</strong> {new Date(article.createdAt).toLocaleDateString()}</div>
              <div><strong>Modifié le:</strong> {new Date(article.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Article *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: MED001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'article *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: Gants chirurgicaux"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité *
              </label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="">Sélectionner une unité</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Minimum *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Maximum *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: 100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: PHARMADIS MADAGASCAR"
              />
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
                placeholder="Description détaillée de l'article..."
              />
            </div>
          </div>

          {/* Aperçu des modifications */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Aperçu des modifications</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Article:</strong> {formData.name || 'Non défini'}</p>
              <p><strong>Code:</strong> {formData.code || 'Non défini'}</p>
              <p><strong>Catégorie:</strong> {formData.category || 'Non définie'}</p>
              <p><strong>Stock Min/Max:</strong> {formData.minStock || '0'} / {formData.maxStock || '0'} {formData.unit || 'unités'}</p>
              <p><strong>Fournisseur:</strong> {formData.supplier || 'Non défini'}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={handleClose}
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
              Sauvegarder Modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticleModal;