import { Article, Movement, User, Inventory } from '../types';

export interface ExportData {
  articles: Article[];
  movements: Movement[];
  users: User[];
  inventories: Inventory[];
  metadata: {
    exportDate: string;
    exportedBy: string;
    filters: any;
    totalRecords: number;
  };
}

export class ExportService {
  // Exporter en CSV
  static exportToCSV(data: any[], filename: string, headers: string[]): void {
    try {
      console.log(`📊 Export CSV: ${filename} avec ${data.length} lignes`);
      
      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Échapper les guillemets et virgules
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Export CSV terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'export CSV:', error);
      throw new Error('Erreur lors de l\'export CSV');
    }
  }

  // Exporter en JSON (pour Excel)
  static exportToJSON(data: any[], filename: string): void {
    try {
      console.log(`📊 Export JSON: ${filename} avec ${data.length} éléments`);
      
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Export JSON terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'export JSON:', error);
      throw new Error('Erreur lors de l\'export JSON');
    }
  }

  // Exporter les données complètes
  static exportCompleteData(exportData: ExportData, format: 'csv' | 'excel' | 'json' = 'csv'): void {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (format) {
        case 'csv':
          // Export des articles
          this.exportToCSV(
            exportData.articles,
            `articles_export_${timestamp}`,
            ['code', 'name', 'category', 'unit', 'currentStock', 'minStock', 'maxStock', 'status', 'supplier']
          );
          
          // Export des mouvements
          this.exportToCSV(
            exportData.movements,
            `movements_export_${timestamp}`,
            ['date', 'type', 'articleCode', 'articleName', 'quantity', 'unit', 'userName', 'service', 'status']
          );
          break;
          
        case 'json':
        case 'excel':
          // Export complet en JSON
          this.exportToJSON(exportData, `complete_export_${timestamp}`);
          break;
      }
      
      console.log(`✅ Export complet terminé en format ${format}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export complet:', error);
      throw error;
    }
  }

  // Filtrer les données selon les critères
  static filterData<T>(data: T[], filters: any): T[] {
    return data.filter(item => {
      // Appliquer les filtres selon le type de données
      if (filters.period && filters.period !== 'all') {
        const itemDate = new Date((item as any).createdAt || (item as any).date);
        const now = new Date();
        
        switch (filters.period) {
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (itemDate < weekAgo) return false;
            break;
          case 'month':
            if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
            break;
          case 'quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const itemQuarter = Math.floor(itemDate.getMonth() / 3);
            if (itemQuarter !== currentQuarter || itemDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
            break;
          case 'year':
            if (itemDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }
      
      return true;
    });
  }
}