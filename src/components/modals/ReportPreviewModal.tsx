import React from 'react';
import { X, Download, BarChart3, FileText, Calendar, User } from 'lucide-react';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  onDownload: () => void;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  reportData,
  onDownload 
}) => {
  if (!isOpen || !reportData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
                Aperçu du Rapport
              </h2>
              <p className="text-sm text-gray-600">
                {reportData.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDownload}
              className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: '#00A86B' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Report Header */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#6B2C91' }}>
              {reportData.title}
            </h1>
            <p className="text-gray-600 mb-4">{reportData.subtitle}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="text-gray-600">Généré le</p>
                  <p className="font-medium">{formatDate(reportData.generatedAt)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="text-gray-600">Par</p>
                  <p className="font-medium">{reportData.generatedBy}</p>
                </div>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="text-gray-600">Période</p>
                  <p className="font-medium">{reportData.period}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="text-gray-600">Enregistrements</p>
                  <p className="font-medium">
                    {reportData.data.articles?.length || reportData.data.movements?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B2C91' }}>
              Résumé Exécutif
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.summary).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Preview */}
          {reportData.charts && reportData.charts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B2C91' }}>
                Graphiques Inclus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportData.charts.map((chart: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">{chart.title}</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Graphique {chart.type}</p>
                        <p className="text-xs">{chart.data?.length || 0} éléments</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#6B2C91' }}>
              Aperçu des Données
            </h3>
            
            {/* Articles Preview */}
            {reportData.data.articles && (
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-900">Articles ({reportData.data.articles.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nom</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Catégorie</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.data.articles.slice(0, 5).map((article: any) => (
                        <tr key={article.id}>
                          <td className="px-4 py-2 text-sm">{article.code}</td>
                          <td className="px-4 py-2 text-sm">{article.name}</td>
                          <td className="px-4 py-2 text-sm">{article.category}</td>
                          <td className="px-4 py-2 text-sm">{article.currentStock} {article.unit}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              article.status === 'normal' ? 'bg-green-100 text-green-800' :
                              article.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {article.status === 'normal' ? 'Normal' :
                               article.status === 'low' ? 'Faible' : 'Rupture'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.data.articles.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      ... et {reportData.data.articles.length - 5} autres articles
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Movements Preview */}
            {reportData.data.movements && (
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-900">Mouvements ({reportData.data.movements.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Article</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantité</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Service</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.data.movements.slice(0, 5).map((movement: any) => (
                        <tr key={movement.id}>
                          <td className="px-4 py-2 text-sm">{movement.date}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              movement.type === 'entry' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {movement.type === 'entry' ? 'Entrée' : 'Sortie'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">{movement.articleName}</td>
                          <td className="px-4 py-2 text-sm">{movement.quantity} {movement.unit}</td>
                          <td className="px-4 py-2 text-sm">{movement.service}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.data.movements.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      ... et {reportData.data.movements.length - 5} autres mouvements
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            onClick={onDownload}
            className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#6B2C91' }}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger Rapport
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;