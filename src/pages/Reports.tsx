import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Package,
  ArrowUp,
  ArrowDown,
  Building
} from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  const reportTypes = [
    {
      id: 'stock',
      title: 'Rapport de Stock',
      description: 'État actuel des stocks par catégorie',
      icon: Package,
      color: '#6B2C91'
    },
    {
      id: 'movements',
      title: 'Mouvements',
      description: 'Historique des entrées et sorties',
      icon: TrendingUp,
      color: '#00A86B'
    },
    {
      id: 'consumption',
      title: 'Consommation',
      description: 'Analyse de consommation par service',
      icon: Building,
      color: '#D4AF37'
    }
  ];

  const quickStats = [
    {
      title: 'Total Articles',
      value: '247',
      icon: Package,
      color: '#6B2C91'
    },
    {
      title: 'Entrées ce mois',
      value: '156',
      icon: ArrowUp,
      color: '#00A86B'
    },
    {
      title: 'Sorties ce mois',
      value: '234',
      icon: ArrowDown,
      color: '#DC143C'
    },
    {
      title: 'Services actifs',
      value: '8',
      icon: Building,
      color: '#D4AF37'
    }
  ];

  const handleGenerateReport = (reportType: string) => {
    console.log(`Génération du rapport ${reportType} pour la période ${selectedPeriod} en format ${selectedFormat}`);
    alert(`Rapport ${reportType} généré avec succès !`);
  };

  const handleExportData = () => {
    console.log('Export des données en cours...');
    alert('Export des données lancé !');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Rapports et Analyses
          </h1>
          <p className="text-gray-600 mt-1">
            Générez des rapports détaillés sur votre gestion de stock
          </p>
        </div>
        <button 
          onClick={handleExportData}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#00A86B' }}
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter Données
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B2C91' }}>
          Configuration des Rapports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {formats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#6B2C91' }}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Appliquer Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: `${report.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {report.description}
              </p>
              <button 
                onClick={() => handleGenerateReport(report.id)}
                className="w-full flex items-center justify-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: report.color }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Générer
              </button>
            </div>
          );
        })}
      </div>

      {/* Sample Data Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Aperçu des Données - Mouvements Récents
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Service
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  23/01/2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ArrowDown className="w-3 h-3 mr-1" />
                    Sortie
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Papier A4 80g
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#6B2C91' }}>
                  15 paquets
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Service Administratif
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  22/01/2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Entrée
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Cartouches HP 305
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#6B2C91' }}>
                  25 unités
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Service IT
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;