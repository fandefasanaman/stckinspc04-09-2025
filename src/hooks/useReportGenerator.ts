import { useState } from 'react';
import { ReportGeneratorService, ReportData } from '../services/reportGeneratorService';
import { ExportService } from '../services/exportService';
import { Article, Movement, User, Inventory } from '../types';

export const useReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);

  const generateReport = async (
    type: 'stock' | 'movements' | 'consumption',
    data: {
      articles: Article[];
      movements: Movement[];
      users: User[];
      inventories: Inventory[];
    },
    config: {
      period: string;
      format: string;
      services?: string[];
      categories?: string[];
    },
    generatedBy: string
  ): Promise<ReportData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🚀 Génération rapport ${type} avec config:`, config);
      
      let reportData: ReportData;
      
      // Filtrer les données si nécessaire
      let filteredArticles = data.articles;
      let filteredMovements = data.movements;
      
      if (config.categories && config.categories.length > 0) {
        filteredArticles = filteredArticles.filter(a => 
          config.categories!.some(cat => a.category.toLowerCase().includes(cat.toLowerCase()))
        );
      }
      
      if (config.services && config.services.length > 0) {
        filteredMovements = filteredMovements.filter(m => 
          config.services!.includes(m.service)
        );
      }
      
      // Générer le rapport selon le type
      switch (type) {
        case 'stock':
          reportData = ReportGeneratorService.generateStockReport(
            filteredArticles,
            config.period,
            config.format,
            generatedBy
          );
          break;
          
        case 'movements':
          reportData = ReportGeneratorService.generateMovementsReport(
            filteredMovements,
            config.period,
            config.format,
            generatedBy
          );
          break;
          
        case 'consumption':
          reportData = ReportGeneratorService.generateConsumptionReport(
            filteredMovements,
            filteredArticles,
            config.period,
            config.format,
            generatedBy
          );
          break;
          
        default:
          throw new Error(`Type de rapport non supporté: ${type}`);
      }
      
      setCurrentReport(reportData);
      setLoading(false);
      
      console.log('✅ Rapport généré avec succès:', reportData.summary);
      return reportData;
      
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      console.error('❌ Erreur lors de la génération du rapport:', err);
      return null;
    }
  };

  const exportData = async (
    data: {
      articles: Article[];
      movements: Movement[];
      users: User[];
      inventories: Inventory[];
    },
    config: {
      period: string;
      format: 'csv' | 'excel' | 'json';
    },
    exportedBy: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Export des données avec config:', config);
      
      // Filtrer les mouvements selon la période
      const filteredMovements = ExportService.filterData(data.movements, { period: config.period });
      
      const exportData = {
        articles: data.articles,
        movements: filteredMovements,
        users: data.users,
        inventories: data.inventories,
        metadata: {
          exportDate: new Date().toISOString(),
          exportedBy,
          filters: config,
          totalRecords: data.articles.length + filteredMovements.length + data.users.length + data.inventories.length
        }
      };
      
      ExportService.exportCompleteData(exportData, config.format);
      
      setLoading(false);
      console.log('✅ Export terminé avec succès:', exportData.metadata.totalRecords, 'enregistrements');
      return true;
      
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      console.error('❌ Erreur lors de l\'export:', err);
      return false;
    }
  };

  const clearError = () => setError(null);
  const clearReport = () => setCurrentReport(null);

  return {
    loading,
    error,
    currentReport,
    generateReport,
    exportData,
    clearError,
    clearReport
  };
};