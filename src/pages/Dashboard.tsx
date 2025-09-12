import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle,
  Users,
  ClipboardList,
  TrendingUp,
  Building,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { Article, Movement, User, Inventory } from '../types';
import StatsCard from '../components/StatsCard';
import StockAlerts from '../components/StockAlerts';
import TopArticles from '../components/TopArticles';
import RecentMovements from '../components/RecentMovements';

const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: 'Total Articles',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: Package,
      color: '#6B2C91'
    },
    {
      title: 'Mouvements ce mois',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: ArrowUpDown,
      color: '#00A86B'
    },
    {
      title: 'Alertes Stock',
      value: '0',
      change: '+0%',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: '#DC143C'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: Users,
      color: '#D4AF37'
    }
  ]);

  // Récupérer les vraies données depuis Firestore
  const { 
    data: articles, 
    loading: articlesLoading,
    error: articlesError,
    isOffline,
    isUsingFallback,
    retryConnection
  } = useFirestoreWithFallback<Article>('articles');

  const { data: movements } = useFirestoreWithFallback<Movement>('movements');
  const { data: users } = useFirestoreWithFallback<User>('users');
  const { data: inventories } = useFirestoreWithFallback<Inventory>('inventories');

  // Calculer les vraies statistiques
  useEffect(() => {
    if (articles.length > 0 || movements.length > 0 || users.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Mouvements du mois en cours
      const thisMonthMovements = movements.filter(movement => {
        const movementDate = new Date(movement.createdAt);
        return movementDate.getMonth() === currentMonth && 
               movementDate.getFullYear() === currentYear;
      });

      // Mouvements du mois précédent pour calculer la tendance
      const lastMonthMovements = movements.filter(movement => {
        const movementDate = new Date(movement.createdAt);
        return movementDate.getMonth() === lastMonth && 
               movementDate.getFullYear() === lastMonthYear;
      });

      // Calculer les alertes (articles en stock faible ou rupture)
      const alertsCount = articles.filter(a => a.status === 'low' || a.status === 'out').length;

      // Utilisateurs actifs
      const activeUsersCount = users.filter(u => u.status === 'active').length;

      // Calculer les tendances
      const movementsTrend = lastMonthMovements.length > 0 
        ? Math.round(((thisMonthMovements.length - lastMonthMovements.length) / lastMonthMovements.length) * 100)
        : 0;

      const newStats = [
        {
          title: 'Total Articles',
          value: articles.length.toString(),
          change: '+0%', // Pas de tendance pour le total d'articles
          changeType: 'increase' as const,
          icon: Package,
          color: '#6B2C91'
        },
        {
          title: 'Mouvements ce mois',
          value: thisMonthMovements.length.toString(),
          change: `${movementsTrend >= 0 ? '+' : ''}${movementsTrend}%`,
          changeType: movementsTrend >= 0 ? 'increase' as const : 'decrease' as const,
          icon: ArrowUpDown,
          color: '#00A86B'
        },
        {
          title: 'Alertes Stock',
          value: alertsCount.toString(),
          change: '-0%', // Tendance négative souhaitée pour les alertes
          changeType: 'decrease' as const,
          icon: AlertTriangle,
          color: '#DC143C'
        },
        {
          title: 'Utilisateurs Actifs',
          value: activeUsersCount.toString(),
          change: '+0%',
          changeType: 'increase' as const,
          icon: Users,
          color: '#D4AF37'
        }
      ];

      setDashboardStats(newStats);
      console.log('📊 Statistiques dashboard calculées:', {
        articles: articles.length,
        thisMonthMovements: thisMonthMovements.length,
        alerts: alertsCount,
        activeUsers: activeUsersCount
      });
    }
  }, [articles, movements, users]);

  // Calculer l'activité réelle par service
  const calculateServiceActivity = () => {
    const serviceStats: { [key: string]: { movements: number; trend: string; color: string } } = {};
    
    // Grouper les mouvements par service
    movements.forEach(movement => {
      // Ignorer les mouvements sans service défini
      if (!movement.service || movement.service === 'Service Inconnu') return;
      
      if (!serviceStats[movement.service]) {
        serviceStats[movement.service] = {
          movements: 0,
          trend: '+0%',
          color: '#6B2C91'
        };
      }
      serviceStats[movement.service].movements++;
    });

    // Convertir en tableau et trier par nombre de mouvements
    return Object.entries(serviceStats)
      .map(([service, stats], index) => ({
        service,
        movements: stats.movements,
        trend: stats.trend,
        color: ['#6B2C91', '#00A86B', '#D4AF37', '#DC143C'][index % 4]
      }))
      .sort((a, b) => b.movements - a.movements)
      .slice(0, 4);
  };

  const serviceActivity = calculateServiceActivity();

  const quickActions = [
    {
      title: 'Nouvelle Entrée',
      description: 'Enregistrer une entrée de stock',
      icon: ArrowUp,
      color: '#00A86B',
      action: () => console.log('Nouvelle entrée')
    },
    {
      title: 'Nouvelle Sortie',
      description: 'Enregistrer une sortie de stock',
      icon: ArrowDown,
      color: '#DC143C',
      action: () => console.log('Nouvelle sortie')
    },
    {
      title: 'Nouvel Inventaire',
      description: 'Planifier un inventaire',
      icon: ClipboardList,
      color: '#6B2C91',
      action: () => console.log('Nouvel inventaire')
    },
    {
      title: 'Rapport Rapide',
      description: 'Générer un rapport',
      icon: TrendingUp,
      color: '#D4AF37',
      action: () => console.log('Rapport rapide')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Tableau de Bord
          </h1>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
              )}
              <span className={`text-sm ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                {isOffline ? 'Mode hors ligne' : 'Données en temps réel'}
              </span>
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Données locales
                </span>
                <button
                  onClick={retryConnection}
                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                  title="Réessayer la connexion"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de la gestion de stock - INSPC Befelatanana
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Message d'erreur si nécessaire */}
      {articlesError && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-blue-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                {articlesError} • Dashboard basé sur {articles.length} articles et {movements.length} mouvements
              </p>
              {isUsingFallback && (
                <p className="text-xs text-blue-600 mt-1">
                  ✅ Données disponibles • Synchronisation automatique en arrière-plan
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Actions Rapides
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Accès rapide aux fonctionnalités principales
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Alerts - Takes 1 column */}
        <div className="lg:col-span-1">
          <StockAlerts />
        </div>

        {/* Recent Movements - Takes 1 column */}
        <div className="lg:col-span-1">
          <RecentMovements />
        </div>

        {/* Top Articles - Takes 1 column */}
        <div className="lg:col-span-1">
          <TopArticles />
        </div>
      </div>

      {/* Service Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
              Activité par Service - Données Réelles
            </h3>
            <div className="text-sm" style={{ color: '#00A86B' }}>
              {movements.length} mouvements total
            </div>
          </div>
        </div>
        <div className="p-6">
          {serviceActivity.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceActivity.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      <Building className="w-5 h-5" style={{ color: service.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {service.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {service.movements} mouvements
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: service.color }}>
                      {service.movements}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {service.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune activité de service enregistrée</p>
              <p className="text-xs mt-1">Les données apparaîtront après les premiers mouvements</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            État du Système - Données Réelles
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  isOffline ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <CheckCircle className="w-8 h-8" style={{ color: isOffline ? '#DC143C' : '#00A86B' }} />
              </div>
              <h4 className="font-medium text-gray-900">Base de Données</h4>
              <p className={`text-sm ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                {isOffline ? 'Hors ligne' : 'Opérationnelle'}
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  isUsingFallback ? 'bg-yellow-100' : 'bg-green-100'
                }`}
              >
                <Package className="w-8 h-8" style={{ color: isUsingFallback ? '#D4AF37' : '#00A86B' }} />
              </div>
              <h4 className="font-medium text-gray-900">Synchronisation</h4>
              <p className={`text-sm ${isUsingFallback ? 'text-yellow-600' : 'text-green-600'}`}>
                {isUsingFallback ? 'Données locales' : 'À jour'}
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#D4AF3720' }}
              >
                <Users className="w-8 h-8" style={{ color: '#D4AF37' }} />
              </div>
              <h4 className="font-medium text-gray-900">Utilisateurs Connectés</h4>
              <p className="text-sm" style={{ color: '#D4AF37' }}>
                {users.filter(u => u.status === 'active').length} actifs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant ArrowUpDown pour les mouvements
const ArrowUpDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

// Composant CheckCircle pour le statut système
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;