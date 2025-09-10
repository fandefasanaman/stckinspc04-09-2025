import React from 'react';
import { ClipboardList, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { Inventory, InventoryItem } from '../types';

interface InventoryProgressProps {
  inventoryId: string;
}

const InventoryProgress: React.FC<InventoryProgressProps> = ({ inventoryId }) => {
  // Récupérer l'inventaire et ses éléments
  const { data: inventories } = useFirestoreWithFallback<Inventory>('inventories');
  const { data: allInventoryItems } = useFirestoreWithFallback<InventoryItem>('inventory_items');
  
  const inventory = inventories.find(inv => inv.id === inventoryId);
  const inventoryItems = allInventoryItems.filter(item => item.inventoryId === inventoryId);

  if (!inventory) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Inventaire non trouvé</p>
      </div>
    );
  }

  const stats = {
    totalItems: inventoryItems.length,
    countedItems: inventoryItems.filter(item => item.status === 'counted' || item.status === 'validated').length,
    pendingItems: inventoryItems.filter(item => item.status === 'pending').length,
    discrepancies: inventoryItems.filter(item => item.difference !== undefined && item.difference !== 0).length,
    totalDifference: inventoryItems.reduce((sum, item) => sum + (item.difference || 0), 0)
  };

  const progressPercentage = stats.totalItems > 0 ? (stats.countedItems / stats.totalItems) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#6B2C91';
      case 'in_progress': return '#D4AF37';
      case 'completed': return '#00A86B';
      case 'validated': return '#00A86B';
      default: return '#6B2C91';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return Clock;
      case 'in_progress': return ClipboardList;
      case 'completed': return CheckCircle;
      case 'validated': return CheckCircle;
      default: return ClipboardList;
    }
  };

  const StatusIcon = getStatusIcon(inventory.status);
  const statusColor = getStatusColor(inventory.status);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <StatusIcon className="w-6 h-6" style={{ color: statusColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
                {inventory.name}
              </h3>
              <p className="text-sm text-gray-600">
                Responsable: {inventory.responsible} | Prévu le: {new Date(inventory.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: statusColor }}>
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-sm text-gray-600">Progression</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progression du comptage
            </span>
            <span className="text-sm text-gray-500">
              {stats.countedItems}/{stats.totalItems} articles
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: statusColor,
                width: `${progressPercentage}%`
              }}
            />
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
              {stats.totalItems}
            </div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#00A86B' }}>
              {stats.countedItems}
            </div>
            <div className="text-sm text-gray-600">Comptés</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
              {stats.pendingItems}
            </div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: '#DC143C' }}>
              {stats.discrepancies}
            </div>
            <div className="text-sm text-gray-600">Écarts</div>
          </div>
        </div>

        {/* Résumé des écarts */}
        {stats.discrepancies > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <h4 className="font-medium text-orange-800">Écarts détectés</h4>
            </div>
            <div className="text-sm text-orange-700">
              <p><strong>{stats.discrepancies}</strong> articles présentent des écarts</p>
              <p>
                Différence totale: 
                <span 
                  className="ml-1 font-bold"
                  style={{ color: stats.totalDifference >= 0 ? '#00A86B' : '#DC143C' }}
                >
                  {stats.totalDifference >= 0 ? '+' : ''}{stats.totalDifference} unités
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Informations de timing */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Créé:</span>
              <span className="ml-2">{new Date(inventory.createdAt).toLocaleDateString()}</span>
            </div>
            {inventory.startedAt && (
              <div>
                <span className="font-medium">Démarré:</span>
                <span className="ml-2">{new Date(inventory.startedAt).toLocaleDateString()}</span>
              </div>
            )}
            {inventory.completedAt && (
              <div>
                <span className="font-medium">Terminé:</span>
                <span className="ml-2">{new Date(inventory.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryProgress;