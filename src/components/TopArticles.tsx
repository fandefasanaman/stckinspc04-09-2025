import React from 'react';
import { TrendingUp, Package } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Movement, Article } from '../types';

const TopArticles: React.FC = () => {
  // Récupérer les mouvements et articles depuis Firestore
  const { data: movements } = useFirestore<Movement>('movements');
  const { data: articles } = useFirestore<Article>('articles');

  // Calculer les articles les plus sortis
  const calculateTopArticles = () => {
    const exitMovements = movements.filter(m => m.type === 'exit' && m.status === 'validated');
    const articleExits: { [key: string]: number } = {};

    // Compter les sorties par article
    exitMovements.forEach(movement => {
      if (articleExits[movement.articleId]) {
        articleExits[movement.articleId] += movement.quantity;
      } else {
        articleExits[movement.articleId] = movement.quantity;
      }
    });

    // Créer la liste des top articles avec leurs informations
    const topArticles = Object.entries(articleExits)
      .map(([articleId, totalExits]) => {
        const article = articles.find(a => a.id === articleId);
        if (!article) return null;
        
        return {
          id: articleId,
          name: article.name,
          category: article.category,
          totalExits,
          currentStock: article.currentStock,
          trend: '+0%' // Vous pourriez calculer la tendance en comparant avec la période précédente
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.totalExits || 0) - (a?.totalExits || 0))
      .slice(0, 5);

    return topArticles;
  };

  const topArticles = calculateTopArticles();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Articles les Plus Sortis
          </h3>
          <div className="flex items-center text-sm" style={{ color: '#00A86B' }}>
            <TrendingUp className="w-4 h-4 mr-1" />
            Ce mois
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {topArticles.length > 0 ? topArticles.map((article, index) => (
            <div key={article.id} className="flex items-center space-x-4">
              {/* Rank */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: index < 3 ? '#D4AF37' : '#6B2C91' }}
              >
                {index + 1}
              </div>
              
              {/* Article Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {article?.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-bold" style={{ color: '#6B2C91' }}>{article?.totalExits} sorties</p>
                    <span className="text-xs text-green-600 font-medium">
                      {article?.trend}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs" style={{ color: '#00A86B' }}>
                    {article?.category}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Package className="w-3 h-3 mr-1" />
                    Stock: {article?.currentStock}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            className="w-full py-2 px-4 text-sm font-medium rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#6B2C91', color: '#6B2C91' }}
          >
            Voir analyse complète
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopArticles;