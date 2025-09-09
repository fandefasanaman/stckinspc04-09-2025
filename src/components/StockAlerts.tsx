import React from 'react';
import { AlertTriangle, Package, Calendar } from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { StockAlert } from '../types';

const StockAlerts: React.FC = () => {
  // Récupérer les alertes depuis Firestore avec fallback
  const { data: alerts, loading, error, isOffline, loadingMessage } = useFirestoreWithFallback<StockAlert>('alerts', [
    // Filtrer pour ne récupérer que les alertes actives
    // orderBy('priority', 'desc'),
    // orderBy('createdAt', 'desc')
  ], [
    // Données de fallback pour les alertes
    {
      id: 'alert-1',
      type: 'low_stock',
      articleId: 'fallback-2',
      articleCode: 'IT002',
      articleName: 'Cartouches HP 305',
      currentStock: 8,
      minStock: 15,
      priority: 'high',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'alert-2',
      type: 'out_of_stock',
      articleId: 'fallback-3',
      articleCode: 'MED003',
      articleName: 'Gants latex M',
      currentStock: 0,
      minStock: 10,
      priority: 'critical',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ]);

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
  const activeAlerts = alerts.filter(alert => alert.status === 'active').slice(0, 5);

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
                    Créé le {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune alerte active</p>
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