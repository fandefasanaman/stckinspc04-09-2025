import React from 'react';
import { AlertTriangle, Package, Calendar } from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { StockAlert, Article } from '../types';

const StockAlerts: React.FC = () => {
  // Récupérer les alertes depuis Firestore avec fallback
  const { data: alerts, loading, error, isOffline, loadingMessage } = useFirestoreWithFallback<StockAlert>('alerts');
  
  // Récupérer les articles pour générer des alertes automatiques
  const { data: articles } = useFirestoreWithFallback<Article>('articles');
  
  // Générer des alertes automatiques basées sur les vrais articles
  const generateAutomaticAlerts = (): StockAlert[] => {
    const automaticAlerts: StockAlert[] = [];
    
    articles.forEach(article => {
      // Alerte de rupture de stock
      if (article.currentStock === 0) {
        automaticAlerts.push({
          id: `auto-out-${article.id}`,
          type: 'out_of_stock',
          articleId: article.id,
          articleCode: article.code,
          articleName: article.name,
          currentStock: article.currentStock,
          minStock: article.minStock,
          priority: 'critical',
          status: 'active',
          createdAt: new Date().toISOString()
        });
      }
      // Alerte de stock faible
      else if (article.currentStock <= article.minStock) {
        automaticAlerts.push({
          id: `auto-low-${article.id}`,
          type: 'low_stock',
          articleId: article.id,
          articleCode: article.code,
          articleName: article.name,
          currentStock: article.currentStock,
          minStock: article.minStock,
          priority: article.currentStock <= article.minStock * 0.5 ? 'high' : 'medium',
          status: 'active',
          createdAt: new Date().toISOString()
        });
      }
      
      // Alerte d'expiration (si date d'expiration définie)
      if (article.expiryDate) {
        const expiryDate = new Date(article.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          automaticAlerts.push({
            id: `auto-exp-${article.id}`,
            type: 'expiring',
            articleId: article.id,
            articleCode: article.code,
            articleName: article.name,
            expiryDate: article.expiryDate,
            priority: daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 15 ? 'high' : 'medium',
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    
    return automaticAlerts;
  };
  
  // Combiner les alertes de la base de données avec les alertes automatiques
  const allAlerts = [...alerts, ...generateAutomaticAlerts()];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#DC143C';
      case 'high': return '#FF6B35';
      case 'medium': return '#D4AF37';
      case 'low': return '#00A86B';
      default: return '#6B2C91';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
      case 'low_stock':
        return Package;
      case 'expiring':
        return Calendar;
      default:
        return AlertTriangle;
    }
  };

  const getAlertMessage = (alert: any) => {
    switch (alert.type) {
      case 'out_of_stock':
        return 'Rupture de stock';
      case 'low_stock':
        return `Stock faible: ${alert.currentStock}/${alert.minStock}`;
      case 'expiring':
        return `Expire le ${alert.expiryDate}`;
      default:
        return 'Alerte';
    }
  };

  // Filtrer les alertes actives et les limiter à 5
  const activeAlerts = allAlerts
    .filter(alert => alert.status === 'active')
    .sort((a, b) => {
      // Trier par priorité puis par date
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Alertes Stock
          </h3>
          <div className="flex items-center space-x-2">
            {isOffline && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Hors ligne
              </span>
            )}
            <span 
              className="px-2 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: '#DC143C' }}
            >
              {activeAlerts.length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{loadingMessage || 'Chargement des alertes...'}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">
              {alerts.length > 0 ? `${alerts.length} alertes disponibles` : error}
            </p>
            {isOffline && (
              <p className="text-xs mt-2">Données en cache affichées</p>
            )}
          </div>
        ) : activeAlerts.length > 0 ? activeAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const priorityColor = getPriorityColor(alert.priority);
          
          return (
            <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${priorityColor}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: priorityColor }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.articleName}
                    </p>
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: priorityColor }}
                    >
                      {alert.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {getAlertMessage(alert)}
                  </p>
                  
                  <p className="text-xs mt-1" style={{ color: '#00A86B' }}>
                    {alert.id.startsWith('auto-') ? 'Alerte automatique' : `Créé le ${new Date(alert.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune alerte de stock détectée</p>
            <p className="text-xs mt-1">
              {articles.length > 0 
                ? 'Tous les articles ont un stock suffisant' 
                : 'Les alertes apparaîtront quand des articles seront ajoutés'
              }
            </p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          disabled={loading}
          className="w-full py-2 px-4 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          Voir toutes les alertes
        </button>
      </div>
    </div>
  );
};

export default StockAlerts;