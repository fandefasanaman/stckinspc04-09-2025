import React from 'react';
import { TrendingUp, Package } from 'lucide-react';

const TopArticles: React.FC = () => {
  const topArticles = [
    {
      id: 1,
      name: 'Papier A4 80g',
      category: 'Fournitures Bureau',
      totalExits: 245,
      currentStock: 150,
      trend: '+12%'
    },
    {
      id: 2,
      name: 'Gants latex M',
      category: 'Consommables Médicaux',
      totalExits: 189,
      currentStock: 75,
      trend: '+8%'
    },
    {
      id: 3,
      name: 'Stylos bille bleu',
      category: 'Fournitures Bureau',
      totalExits: 156,
      currentStock: 200,
      trend: '+15%'
    },
    {
      id: 4,
      name: 'Cartouches HP 305',
      category: 'Consommables IT',
      totalExits: 134,
      currentStock: 25,
      trend: '+5%'
    },
    {
      id: 5,
      name: 'Désinfectant surfaces',
      category: 'Produits Entretien',
      totalExits: 98,
      currentStock: 40,
      trend: '+22%'
    }
  ];

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
          {topArticles.map((article, index) => (
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
                    {article.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium" style={{ color: '#6B2C91' }}>
                      {article.totalExits}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {article.trend}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs" style={{ color: '#00A86B' }}>
                    {article.category}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Package className="w-3 h-3 mr-1" />
                    Stock: {article.currentStock}
                  </div>
                </div>
              </div>
            </div>
          ))}
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