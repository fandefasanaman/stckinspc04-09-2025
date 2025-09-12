import React from 'react';
import { CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';

interface ReportStatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  details?: string;
}

const ReportStatusIndicator: React.FC<ReportStatusIndicatorProps> = ({ 
  status, 
  message, 
  details 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: Loader,
          color: '#6B2C91',
          bgColor: '#6B2C9110',
          borderColor: '#6B2C91',
          defaultMessage: 'Génération en cours...'
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: '#00A86B',
          bgColor: '#00A86B10',
          borderColor: '#00A86B',
          defaultMessage: 'Rapport généré avec succès'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#DC143C',
          bgColor: '#DC143C10',
          borderColor: '#DC143C',
          defaultMessage: 'Erreur lors de la génération'
        };
      default:
        return {
          icon: Clock,
          color: '#6B2C91',
          bgColor: '#6B2C9110',
          borderColor: '#6B2C91',
          defaultMessage: 'Prêt à générer'
        };
    }
  };

  if (status === 'idle') return null;

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: config.bgColor,
        borderColor: config.borderColor
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon 
            className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`}
            style={{ color: config.color }}
          />
        </div>
        <div className="ml-3 flex-1">
          <p 
            className="text-sm font-medium"
            style={{ color: config.color }}
          >
            {message || config.defaultMessage}
          </p>
          {details && (
            <p className="text-xs mt-1 text-gray-600">
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportStatusIndicator;