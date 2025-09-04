import React from 'react';
import { 
  Package, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle,
  Users,
  ClipboardList,
  TrendingUp,
  Building
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import StockAlerts from '../components/StockAlerts';
import TopArticles from '../components/TopArticles';
import RecentMovements from '../components/RecentMovements';
import DonutChart from '../components/DonutChart';
import MadagascarPattern from '../components/MadagascarPattern';

const Dashboard: React.FC = () => {
  const dashboardStats = [
    {
      title: 'Total Articles',
      value: '247',
      change: '+12%',
      changeType: 'increase' as const,
      icon: Package,
      color: '#6B2C91'
    },
    {
      title: 'Mouvements ce mois',
      value: '1,234',
      change: '+8%',
      changeType: 'increase' as const,
      icon: ArrowUpDown,
      color: '#2D8A47'
    },
    {
      title: 'Alertes Stock',
      value: '15',
      change: '-5%',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: '#2D8A47'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '24',
      change: '+3%',
      changeType: 'increase' as const,
      icon: Users,
      color: '#D4AF37'
    }
  ];

  const quickActions = [
    {
      title: 'Nouvelle Entrée',
      description: 'Enregistrer une entrée de stock',
      icon: ArrowUp,
      color: '#2D8A47',
      action: () => console.log('Nouvelle entrée')
    },
    {
      title: 'Nouvelle Sortie',
      description: 'Enregistrer une sortie de stock',
      icon: ArrowDown,
      color: '#2D8A47',
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

  const serviceActivity = [
    {
      service: 'Service Pédagogique et Scientifique',
      movements: 45,
      trend: '+15%',
      color: '#6B2C91'
    },
    {
      service: 'Direction Formation et Recherche',
      movements: 32,
      trend: '+8%',
      color: '#2D8A47'
    },
    {
      service: 'Service Administratif',
      movements: 28,
      trend: '+12%',
      color: '#D4AF37'
    },
    {
      service: 'Unité d\'Échographie',
      movements: 19,
      trend: '+22%',
      color: '#2D8A47'
    }
  ];

  // Données pour le graphique circulaire - Répartition par catégorie
  const categoryData = [
    {
      name: 'Fournitures Bureau',
      value: 42,
      color: '#6B2C91',
      description: 'Papeterie, stylos, classeurs'
    },
    {
      name: 'Consommables Médicaux',
      value: 28,
      color: '#2D8A47',
      description: 'Gants, seringues, désinfectants'
    },
    {
      name: 'Consommables IT',
      value: 22,
      color: '#D4AF37',
      description: 'Cartouches, câbles, accessoires'
    },
    {
      name: 'Produits Entretien',
      value: 8,
      color: '#DC143C',
      description: 'Nettoyants, produits d\'hygiène'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Madagascar Pattern Easter Egg */}
      <div className="relative">
        <MadagascarPattern />
      </div>
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Tableau de Bord
          </h1>
          <p className="mt-1" style={{ color: '#5A4A42' }}>
            Vue d'ensemble de la gestion de stock - INSPC Befelatanana
          </p>
        </div>
        <div className="text-sm" style={{ color: '#5A4A42' }}>
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

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
          <p className="text-sm mt-1" style={{ color: '#5A4A42' }}>
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
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow text-left"
                  style={{ borderColor: '#E5E0DB' }}
                >
                  <div className="flex items-center mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <h4 className="font-medium" style={{ color: '#2C1810' }}>{action.title}</h4>
                  </div>
                  <p className="text-sm" style={{ color: '#5A4A42' }}>{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Stock Alerts - Takes 1 column */}
        <div className="xl:col-span-1">
          <StockAlerts />
        </div>

        {/* Recent Movements - Takes 1 column */}
        <div className="xl:col-span-1">
          <RecentMovements />
        </div>

        {/* Top Articles - Takes 1 column */}
        <div className="xl:col-span-1">
          <TopArticles />
        </div>

        {/* Donut Chart - Takes 1 column */}
        <div className="xl:col-span-1">
          <DonutChart
            title="Répartition par Catégorie"
            subtitle="Distribution des sorties par type d'articles"
            data={categoryData}
            centerText="Articles"
            centerValue="247"
          />
        </div>
      </div>

      {/* Service Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
              Activité par Service
            </h3>
            <div className="text-sm" style={{ color: '#2D8A47' }}>
              Ce mois
            </div>
          </div>
        </div>
        <div className="p-6">
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
                    <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                      {service.service}
                    </p>
                    <p className="text-xs" style={{ color: '#5A4A42' }}>
                      {service.movements} mouvements
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: service.color }}>
                    {service.movements}
                  </p>
                  <p className="text-xs font-medium" style={{ color: '#2D8A47' }}>
                    {service.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            État du Système
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#2D8A4720' }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: '#2D8A47' }} />
              </div>
              <h4 className="font-medium" style={{ color: '#2C1810' }}>Base de Données</h4>
              <p className="text-sm" style={{ color: '#2D8A47' }}>Opérationnelle</p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#2D8A4720' }}
              >
                <Package className="w-8 h-8" style={{ color: '#2D8A47' }} />
              </div>
              <h4 className="font-medium" style={{ color: '#2C1810' }}>Synchronisation</h4>
              <p className="text-sm" style={{ color: '#2D8A47' }}>À jour</p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#D4AF3720' }}
              >
                <Users className="w-8 h-8" style={{ color: '#D4AF37' }} />
              </div>
              <h4 className="font-medium" style={{ color: '#2C1810' }}>Utilisateurs Connectés</h4>
              <p className="text-sm" style={{ color: '#D4AF37' }}>8 actifs</p>
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