import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  article?: string;
  quantity?: number;
}

const StockAlerts: React.FC = () => {
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'critical',
      title: 'Niveau de stock critique',
      message: 'Stock en dessous du seuil minimum',
      article: 'Cartouches HP 305',
      quantity: 2
    },
    {
      id: '2',
      type: 'warning',
      title: 'Alerte de stock faible',
      message: 'Stock faible',
      article: 'Gants latex M',
      quantity: 8
    },
    {
      id: '3',
      type: 'info',
      title: 'Rappel de réapprovisionnement',
      message: 'Pensez à réapprovisionner bientôt',
      article: 'Papier A4 80g',
      quantity: 15
    }
  ];

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
          Alertes de Stock
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Alertes importantes nécessitant votre attention
        </p>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-4 rounded-lg border ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={getIconStyles(alert.type)}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{alert.title}</h4>
                <p className="text-sm mt-1">{alert.message}</p>
                {alert.article && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Article :</span> {alert.article}
                    {alert.quantity && (
                      <span className="ml-2">
                        <span className="font-medium">Quantité :</span> {alert.quantity}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockAlerts;