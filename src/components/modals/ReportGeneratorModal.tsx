import React, { useState } from 'react';
import { X, BarChart3, Download, Calendar } from 'lucide-react';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportConfig: any) => void;
}

const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [reportConfig, setReportConfig] = useState({
    type: '',
    period: '',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    services: [] as string[],
    categories: [] as string[]
  });

  const reportTypes = [
    { value: 'stock_status', label: 'État des Stocks' },
    { value: 'movements', label: 'Mouvements de Stock' },
    { value: 'consumption', label: 'Consommation par Service' },
    { value: 'inventory', label: 'Rapport d\'Inventaire' },
    { value: 'alerts', label: 'Alertes et Anomalies' }
  ];

  const periods = [
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  const services = [
    'Service Pédagogique et Scientifique',
    'Service Financier',
    'Service Administratif',
    'Service Documentation',
    'Direction Formation et Recherche',
    'Direction des Affaires Administratives',
    'Direction Générale'
  ];

  const categories = [
    'Fournitures Bureau',
    'Consommables IT',
    'Consommables Médicaux',
    'Produits Entretien'
  ];

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setReportConfig({ ...reportConfig, services: [...reportConfig.services, service] });
    } else {
      setReportConfig({ ...reportConfig, services: reportConfig.services.filter(s => s !== service) });
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setReportConfig({ ...reportConfig, categories: [...reportConfig.categories, category] });
    } else {
      setReportConfig({ ...reportConfig, categories: reportConfig.categories.filter(c => c !== category) });
    }
  };

  const handleGenerate = () => {
    onGenerate(reportConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
              Générateur de Rapports
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rapport *
              </label>
              <select
                required
                value={reportConfig.type}
                onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="">Sélectionner un type</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période *
              </label>
              <select
                required
                value={reportConfig.period}
                onChange={(e) => setReportConfig({ ...reportConfig, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                <option value="">Sélectionner une période</option>
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format d'export
              </label>
              <select
                value={reportConfig.format}
                onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
              >
                {formats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options d'inclusion
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig({ ...reportConfig, includeCharts: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                  <span className="ml-2 text-sm text-gray-700">Inclure les graphiques</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeDetails}
                    onChange={(e) => setReportConfig({ ...reportConfig, includeDetails: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                  <span className="ml-2 text-sm text-gray-700">Inclure les détails</span>
                </label>
              </div>
            </div>

            {/* Services Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services à inclure
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {services.map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.services.includes(service)}
                      onChange={(e) => handleServiceChange(service, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories à inclure
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{ '--tw-ring-color': '#6B2C91' } as any}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#6B2C91' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Générer Rapport
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;