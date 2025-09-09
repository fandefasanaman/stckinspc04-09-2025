import React, { useState } from 'react';
import { X, Package, Save } from 'lucide-react';
import { auth, db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

interface NewArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: any) => void;
}

const NewArticleModal: React.FC<NewArticleModalProps> = ({ isOpen, onClose, onSave }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔍 DIAGNOSTIC SAUVEGARDE
    console.log('🔍 DIAGNOSTIC SAUVEGARDE:');
    console.log('User authentifié:', auth.currentUser ? 'OUI' : 'NON');
    console.log('User ID:', auth.currentUser?.uid);
    console.log('Données à sauvegarder:', formData);
    
    // Test de connexion Firestore
    testFirestoreConnection();
    
    onSave(formData);
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

  // Test simple d'écriture Firestore
  const testFirestoreConnection = async () => {
    try {
      console.log('🧪 Test de connexion Firestore...');
      const testRef = await addDoc(collection(db, 'test'), {
        message: 'test de connexion',
        timestamp: new Date(),
        userAgent: navigator.userAgent
      });
      console.log('✅ Test écriture Firestore OK:', testRef.id);
    } catch (error: any) {
      console.error('❌ Test écriture échoue:', error.code, error.message);
      console.error('Détails erreur:', error);
    }
  };

  // Test d'authentification anonyme
  const testAnonymousAuth = async () => {
    try {
      console.log('🧪 Test authentification anonyme...');
      const result = await signInAnonymously(auth);
      console.log('✅ Authentification anonyme OK:', result.user.uid);
    } catch (error: any) {
      console.error('❌ Authentification anonyme échoue:', error.code, error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
              Nouvel Article
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
          {/* Boutons de diagnostic */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-3">🔧 Outils de Diagnostic</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={testFirestoreConnection}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Test Firestore
              </button>
              <button
                type="button"
                onClick={testAnonymousAuth}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Test Auth Anonyme
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('📊 État actuel:');
                  console.log('- Auth:', auth.currentUser);
                  console.log('- DB config:', db.app.options);
                  console.log('- Network:', navigator.onLine ? 'ONLINE' : 'OFFLINE');
                }}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              >
                État Système
              </button>
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArticleModal;