import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import NewArticleModal from '../components/modals/NewArticleModal';

const Articles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const newArticleModal = useModal();

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'bureau', label: 'Fournitures Bureau' },
    { value: 'informatique', label: 'Consommables IT' },
    { value: 'medical', label: 'Consommables Médicaux' },
    { value: 'entretien', label: 'Produits Entretien' }
  ];

  const articles = [
    {
      id: 1,
      code: 'FB001',
      name: 'Papier A4 80g',
      category: 'Fournitures Bureau',
      unit: 'paquet',
      currentStock: 150,
      minStock: 20,
      maxStock: 500,
      unitPrice: 2500,
      supplier: 'PAPETERIE MODERNE',
      status: 'normal',
      lastEntry: '2024-01-15'
    },
    {
      id: 2,
      code: 'IT002',
      name: 'Cartouches HP 305',
      category: 'Consommables IT',
      unit: 'unité',
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      unitPrice: 15000,
      supplier: 'TECH SUPPLIES',
      status: 'low',
      lastEntry: '2024-01-10'
    },
    {
      id: 3,
      code: 'MED003',
      name: 'Gants latex M',
      category: 'Consommables Médicaux',
      unit: 'boîte',
      currentStock: 75,
      minStock: 25,
      maxStock: 200,
      unitPrice: 8500,
      supplier: 'MEDICAL PLUS',
      status: 'normal',
      lastEntry: '2024-01-12'
    },
    {
      id: 4,
      code: 'IT004',
      name: 'Câbles USB-C',
      category: 'Consommables IT',
      unit: 'unité',
      currentStock: 0,
      minStock: 5,
      maxStock: 30,
      unitPrice: 3200,
      supplier: 'TECH SUPPLIES',
      status: 'out',
      lastEntry: '2023-12-20'
    },
    {
      id: 5,
      code: 'ENT005',
      name: 'Désinfectant surfaces',
      category: 'Produits Entretien',
      unit: 'litre',
      currentStock: 40,
      minStock: 15,
      maxStock: 100,
      unitPrice: 4800,
      supplier: 'HYGIENE PRO',
      status: 'normal',
      lastEntry: '2024-01-14'
    }
  ];

  const getStatusBadge = (status: string, currentStock: number, minStock: number) => {
    if (status === 'out' || currentStock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Rupture
        </span>
      );
    } else if (status === 'low' || currentStock <= minStock) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Stock faible
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Normal
        </span>
      );
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           article.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleNewArticle = (articleData: any) => {
    console.log('Nouvel article:', articleData);
    // Logique pour sauvegarder l'article
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Gestion des Articles
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez votre catalogue d'articles et suivez les stocks
          </p>
        </div>
        <button 
          onClick={newArticleModal.openModal}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Article
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Stock Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: '#6B2C9120' }}
                      >
                        <Package className="w-5 h-5" style={{ color: '#6B2C91' }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {article.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Code: {article.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      style={{ backgroundColor: '#00A86B20', color: '#00A86B' }}
                    >
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <strong>{article.currentStock}</strong> {article.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {article.minStock} | Max: {article.maxStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(article.status, article.currentStock, article.minStock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {article.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#00A86B' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#DC143C' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#6B2C9120' }}
            >
              <Package className="w-6 h-6" style={{ color: '#6B2C91' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                {articles.length}
              </p>
              <p className="text-sm text-gray-600">Total Articles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#DC143C20' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: '#DC143C' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#DC143C' }}>
                {articles.filter(a => a.status === 'out' || a.currentStock === 0).length}
              </p>
              <p className="text-sm text-gray-600">En Rupture</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#D4AF3720' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                {articles.filter(a => a.status === 'low' || (a.currentStock <= a.minStock && a.currentStock > 0)).length}
              </p>
              <p className="text-sm text-gray-600">Stock Faible</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#00A86B20' }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: '#00A86B' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#00A86B' }}>
                {articles.filter(a => a.currentStock > a.minStock).length}
              </p>
              <p className="text-sm text-gray-600">Stock Normal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewArticleModal
        isOpen={newArticleModal.isOpen}
        onClose={newArticleModal.closeModal}
        onSave={handleNewArticle}
      />
    </div>
  );
};

export default Articles;