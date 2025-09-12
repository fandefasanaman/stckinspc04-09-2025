import React from 'react';
import { ArrowUp, ArrowDown, Clock, User } from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { Movement } from '../types';

const RecentMovements: React.FC = () => {
  const { userData } = useAuth();
  
  // Récupérer les mouvements récents depuis Firestore
  const { data: allMovements, loading, error } = useFirestoreWithFallback<Movement>('movements');
  
  // Limiter aux 5 mouvements les plus récents
  const movements = allMovements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

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
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des mouvements...</p>
          </div>
        ) : error && movements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ArrowUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Erreur de chargement</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : movements.length > 0 ? movements.map((movement) => (
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
                    {movement.articleName}
                  </p>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${movement.type === 'entry' 
                      ? 'bg-green-100 text-green-800' 
                      : movement.status === 'pending' && userData?.role === 'validator'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {movement.type === 'entry' ? 'Entrée' : 
                     movement.status === 'pending' && userData?.role === 'validator' ? 'À Valider' : 'Sortie'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm" style={{ color: '#6B2C91' }}>
                    <strong>{movement.quantity}</strong> {movement.unit}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    {movement.userName}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs" style={{ color: '#00A86B' }}>
                    {movement.service}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {movement.time} - {formatDate(movement.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center text-gray-500">
            <ArrowUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun mouvement dans la base de données</p>
            <p className="text-xs mt-1">Les mouvements apparaîtront ici une fois créés</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentMovements;