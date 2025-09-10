import React, { useState } from 'react';
import { X, ClipboardList, Save, Calendar, User, Building } from 'lucide-react';
import { useFirestoreWithFallback } from '../../hooks/useFirestoreWithFallback';
import { Article, User as UserType } from '../../types';

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

  // Récupérer les articles et utilisateurs depuis Firestore
  const { data: articles } = useFirestoreWithFallback<Article>('articles');
  const { data: users } = useFirestoreWithFallback<UserType>('users');

  // Extraire les catégories uniques des articles
  const categories = ['Général', ...Array.from(new Set(articles.map(a => a.category)))];
  
  // Filtrer les utilisateurs qui peuvent être responsables d'inventaire
  const responsibles = users.filter(u => 
    u.status === 'active' && 
    ['admin', 'manager', 'supervisor'].includes(u.role)
  );

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
    
    // Validation
    if (formData.includeCategories.length === 0 && formData.category !== 'Général') {
      alert('Veuillez sélectionner au moins une catégorie à inclure');
      return;
    }
    
    onSave({
      ...formData,
      status: 'planned',
      articlesCount: 0,
      discrepancies: 0
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
                {responsibles.map(user => (
                  <option key={user.id} value={user.name}>
                    {user.name} ({user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Gestionnaire' : 'Responsable'})
                  </option>
                ))}
              </select>
              {responsibles.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Aucun responsable disponible - Vérifiez les utilisateurs actifs
                </p>
              )}
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
              {formData.category === 'Général' ? (
                <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                  L'inventaire général inclura automatiquement toutes les catégories d'articles disponibles.
                </p>
              ) : (
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
              )}
              {formData.category !== 'Général' && formData.includeCategories.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Veuillez sélectionner au moins une catégorie
                </p>
              )}
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

          {/* Aperçu des articles qui seront inclus */}
          {(formData.category === 'Général' || formData.includeCategories.length > 0) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Aperçu de l'inventaire</h4>
              <div className="text-sm text-blue-700">
                {formData.category === 'Général' ? (
                  <p><strong>Articles inclus:</strong> Tous les articles ({articles.length} articles)</p>
                ) : (
                  <p><strong>Articles inclus:</strong> {
                    articles.filter(article => 
                      formData.includeCategories.some(cat => 
                        article.category.toLowerCase().includes(cat.toLowerCase())
                      )
                    ).length
                  } articles des catégories sélectionnées</p>
                )}
                <p><strong>Responsable:</strong> {formData.responsible}</p>
                <p><strong>Date prévue:</strong> {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString() : 'Non définie'}</p>
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