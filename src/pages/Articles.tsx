import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { ArticleServiceWithFallback } from '../services/articleServiceWithFallback';
import NewArticleModal from '../components/modals/NewArticleModal';
import { Article } from '../types';

const Articles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const newArticleModal = useModal();

  // Utiliser le hook avec fallback pour récupérer les articles
  const { 
    data: articles, 
    loading: articlesLoading, 
    error, 
    isOffline, 
    isUsingFallback, 
    retryConnection 
  } = useFirestoreWithFallback<Article>('articles');

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'bureau', label: 'Fournitures Bureau' },
    { value: 'informatique', label: 'Consommables IT' },
    { value: 'medical', label: 'Consommables Médicaux' },
    { value: 'entretien', label: 'Produits Entretien' }
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

  const handleNewArticle = async (articleData: any) => {
    setLoading(true);
    try {
      await ArticleServiceWithFallback.createArticle({
        code: articleData.code,
        name: articleData.name,
        category: articleData.category,
        unit: articleData.unit,
        minStock: parseInt(articleData.minStock),
        maxStock: parseInt(articleData.maxStock),
        supplier: articleData.supplier,
        description: articleData.description
      });
      
      // Le hook se mettra à jour automatiquement
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'article:', error);
      alert('Erreur lors de la création de l\'article: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditArticle = async (articleId: string, updates: Partial<Article>) => {
    try {
      await ArticleServiceWithFallback.updateArticle(articleId, updates);
    } catch (error: any) {
      console.error('Erreur lors de la modification de l\'article:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      await ArticleServiceWithFallback.deleteArticle(articleId);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  if (articlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#6B2C91' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600">Impossible de charger les articles</p>
        </div>
      </div>
    );
  }

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
          
          {/* Indicateur de statut de connexion */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
              )}
              <span className={`text-sm ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                {isOffline ? 'Mode hors ligne' : 'Connecté'}
              </span>
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Données locales
                </span>
                <button
                  onClick={retryConnection}
                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                  title="Réessayer la connexion"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={newArticleModal.openModal}
          disabled={loading}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Création...' : 'Nouvel Article'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Message d'état si nécessaire */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">{error}</p>
                {isUsingFallback && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Les modifications seront synchronisées automatiquement lors de la reconnexion.
                  </p>
                )}
              </div>
              {isOffline && (
                <button
                  onClick={retryConnection}
                  className="ml-2 px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                >
                  Réessayer
                </button>
              )}
            </div>
          </div>
        )}
        
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
                        onClick={() => {
                          const newStock = prompt('Nouveau stock:', article.currentStock.toString());
                          if (newStock && !isNaN(parseInt(newStock))) {
                            ArticleServiceWithFallback.updateStock(article.id, parseInt(newStock));
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#00A86B' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteArticle(article.id)}
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