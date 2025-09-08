import React from 'react';
import { ArrowUp, ArrowDown, Clock, User } from 'lucide-react';

const RecentMovements: React.FC = () => {
  const movements = [
    {
      id: 1,
      type: 'entry',
      article: 'Papier A4 80g',
      quantity: 50,
      unit: 'paquets',
      user: 'Marie Kouassi',
      service: 'Service Administratif',
      time: '10:30',
      date: 'Aujourd\'hui'
    },
    {
      id: 2,
      type: 'exit',
      article: 'Cartouches HP 305',
      quantity: 3,
      unit: 'unités',
      user: 'Jean Koffi',
      service: 'Service Pédagogique',
      time: '09:15',
      date: 'Aujourd\'hui'
    },
    {
      id: 3,
      type: 'entry',
      article: 'Gants latex',
      quantity: 100,
      unit: 'boîtes',
      user: 'Dr. Aya Traoré',
      service: 'Unité d\'Échographie',
      time: '16:45',
      date: 'Hier'
    },
    {
      id: 4,
      type: 'exit',
      article: 'Stylos bille bleu',
      quantity: 20,
      unit: 'unités',
      user: 'Paul Diabaté',
      service: 'Direction Générale',
      time: '14:20',
      date: 'Hier'
    },
    {
      id: 5,
      type: 'exit',
      article: 'Désinfectant surfaces',
      quantity: 5,
      unit: 'litres',
      user: 'Fatou Bamba',
      service: 'Service Documentation',
      time: '11:30',
      date: 'Hier'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Mouvements Récents
          </h3>
          <button 
            className="text-sm hover:underline"
            style={{ color: '#00A86B' }}
          >
            Voir tout
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {movements.map((movement) => (
          <div key={movement.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              {/* Movement Type Icon */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${movement.type === 'entry' ? 'bg-green-100' : 'bg-red-100'}
              `}>
                {movement.type === 'entry' ? (
                  <ArrowUp className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-red-600" />
                )}
              </div>

              {/* Movement Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {movement.article}
                  </p>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${movement.type === 'entry' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {movement.type === 'entry' ? 'Entrée' : 'Sortie'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm" style={{ color: '#6B2C91' }}>
                    <strong>{movement.quantity}</strong> {movement.unit}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    {movement.user}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs" style={{ color: '#00A86B' }}>
                    {movement.service}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {movement.time} - {movement.date}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMovements;