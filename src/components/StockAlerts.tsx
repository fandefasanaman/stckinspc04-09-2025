import React from 'react';
import { AlertTriangle, Package, Calendar } from 'lucide-react';

const StockAlerts: React.FC = () => {
  const alerts = [
    {
      id: 1,
      type: 'low_stock',
      article: 'Papier A4 80g',
      currentStock: 5,
      minStock: 20,
      category: 'Fournitures Bureau',
      priority: 'high'
    },
    {
      id: 2,
      type: 'expiring',
      article: 'Antiseptique',
      expiryDate: '2024-02-15',
      quantity: 12,
      category: 'Consommables Médicaux',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'out_of_stock',
      article: 'Cartouches HP 305',
      currentStock: 0,
      minStock: 5,
      category: 'Consommables IT',
      priority: 'critical'
    },
    {
      id: 4,
      type: 'low_stock',
      article: 'Gants latex M',
      currentStock: 8,
      minStock: 25,
      category: 'Consommables Médicaux',
      priority: 'high'
    },
    {
      id: 5,
      type: 'expiring',
      article: 'Produit nettoyant',
      expiryDate: '2024-01-30',
      quantity: 3,
      category: 'Produits Entretien',
      priority: 'low'
    }
  ];

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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Alertes Stock
          </h3>
          <span 
            className="px-2 py-1 text-xs font-medium text-white rounded-full"
            style={{ backgroundColor: '#DC143C' }}
          >
            {alerts.length}
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
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
                      {alert.article}
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
                    {alert.category}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
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