import React from 'react';
import { ArrowUp, ArrowDown, Calendar, User } from 'lucide-react';

const RecentMovements: React.FC = () => {
  const recentMovements = [
    {
      id: 1,
      type: 'entry',
      article: 'Papier A4 80g',
      quantity: 50,
      unit: 'paquets',
      user: 'Marie Kouassi',
      time: '10:30',
      status: 'validated'
    },
    {
      id: 2,
      type: 'exit',
      article: 'Cartouches HP 305',
      quantity: 3,
      unit: 'unités',
      user: 'Jean Koffi',
      time: '09:15',
      status: 'validated'
    },
    {
      id: 3,
      type: 'entry',
      article: 'Gants latex M',
      quantity: 100,
      unit: 'boîtes',
      user: 'Dr. Aya Traoré',
      time: '16:45',
      status: 'validated'
    },
    {
      id: 4,
      type: 'exit',
      article: 'Désinfectant',
      quantity: 5,
      unit: 'litres',
      user: 'Paul Diabaté',
      time: '14:20',
      status: 'pending'
    }
  ];

  const getMovementIcon = (type: string) => {
    return type === 'entry' ? ArrowUp : ArrowDown;
  };

  const getMovementColor = (type: string) => {
    return type === 'entry' ? '#2D8A47' : '#DC143C';
  };

  const getStatusBadge = (status: string) => {
    return status === 'validated' ? (
      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Validé
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        En attente
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Mouvements Récents
          </h3>
          <div className="flex items-center text-sm" style={{ color: '#2D8A47' }}>
            <Calendar className="w-4 h-4 mr-1" />
            Aujourd'hui
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {recentMovements.map((movement) => {
            const Icon = getMovementIcon(movement.type);
            const color = getMovementColor(movement.type);
            
            return (
              <div key={movement.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>
                      {movement.article}
                    </p>
                    <span className="text-xs text-gray-500">{movement.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs" style={{ color: '#5A4A42' }}>
                      <User className="w-3 h-3 mr-1" />
                      {movement.user}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color }}>
                        {movement.type === 'entry' ? '+' : '-'}{movement.quantity} {movement.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            className="w-full py-2 px-4 text-sm font-medium rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#6B2C91', color: '#6B2C91' }}
          >
            Voir tous les mouvements
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentMovements;