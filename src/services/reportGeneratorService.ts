import { Article, Movement, User, Inventory } from '../types';
import { ExportService } from './exportService';

export interface ReportData {
  title: string;
  subtitle: string;
  generatedAt: string;
  generatedBy: string;
  period: string;
  data: any;
  summary: any;
  charts?: any[];
}

export class ReportGeneratorService {
  // Générer un rapport d'état des stocks
  static generateStockReport(
    articles: Article[], 
    period: string, 
    format: string,
    generatedBy: string
  ): ReportData {
    console.log(`📊 Génération rapport de stock: ${articles.length} articles`);
    
    // Analyser les données
    const stockAnalysis = {
      totalArticles: articles.length,
      normalStock: articles.filter(a => a.status === 'normal').length,
      lowStock: articles.filter(a => a.status === 'low').length,
      outOfStock: articles.filter(a => a.status === 'out').length,
      totalValue: articles.reduce((sum, a) => sum + (a.currentStock * (a.unitPrice || 0)), 0)
    };

    // Analyse par catégorie
    const categoryAnalysis = articles.reduce((acc, article) => {
      if (!acc[article.category]) {
        acc[article.category] = {
          totalArticles: 0,
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0,
          value: 0
        };
      }
      
      acc[article.category].totalArticles++;
      acc[article.category].totalStock += article.currentStock;
      if (article.status === 'low') acc[article.category].lowStock++;
      if (article.status === 'out') acc[article.category].outOfStock++;
      acc[article.category].value += article.currentStock * (article.unitPrice || 0);
      
      return acc;
    }, {} as any);

    const reportData: ReportData = {
      title: 'Rapport d\'État des Stocks',
      subtitle: `Analyse complète des stocks par catégorie - Période: ${this.getPeriodLabel(period)}`,
      generatedAt: new Date().toISOString(),
      generatedBy,
      period,
      data: {
        articles,
        stockAnalysis,
        categoryAnalysis
      },
      summary: {
        totalArticles: stockAnalysis.totalArticles,
        alertsCount: stockAnalysis.lowStock + stockAnalysis.outOfStock,
        categoriesCount: Object.keys(categoryAnalysis).length,
        stockValue: stockAnalysis.totalValue
      },
      charts: [
        {
          type: 'donut',
          title: 'Répartition par Statut',
          data: [
            { name: 'Stock Normal', value: stockAnalysis.normalStock, color: '#00A86B' },
            { name: 'Stock Faible', value: stockAnalysis.lowStock, color: '#D4AF37' },
            { name: 'Rupture', value: stockAnalysis.outOfStock, color: '#DC143C' }
          ]
        },
        {
          type: 'bar',
          title: 'Articles par Catégorie',
          data: Object.entries(categoryAnalysis).map(([category, data]: [string, any]) => ({
            category,
            articles: data.totalArticles,
            stock: data.totalStock
          }))
        }
      ]
    };

    // Exporter selon le format demandé
    this.exportReport(reportData, format);
    
    return reportData;
  }

  // Générer un rapport de mouvements
  static generateMovementsReport(
    movements: Movement[], 
    period: string, 
    format: string,
    generatedBy: string
  ): ReportData {
    console.log(`📊 Génération rapport de mouvements: ${movements.length} mouvements`);
    
    // Filtrer les mouvements selon la période
    const filteredMovements = ExportService.filterData(movements, { period });
    
    // Analyser les données
    const movementAnalysis = {
      totalMovements: filteredMovements.length,
      entries: filteredMovements.filter(m => m.type === 'entry').length,
      exits: filteredMovements.filter(m => m.type === 'exit').length,
      pending: filteredMovements.filter(m => m.status === 'pending').length,
      validated: filteredMovements.filter(m => m.status === 'validated').length,
      rejected: filteredMovements.filter(m => m.status === 'rejected').length
    };

    // Analyse par service
    const serviceAnalysis = filteredMovements.reduce((acc, movement) => {
      const service = movement.service || 'Service non défini';
      if (!acc[service]) {
        acc[service] = {
          totalMovements: 0,
          entries: 0,
          exits: 0,
          totalQuantity: 0
        };
      }
      
      acc[service].totalMovements++;
      if (movement.type === 'entry') acc[service].entries++;
      if (movement.type === 'exit') acc[service].exits++;
      acc[service].totalQuantity += movement.quantity;
      
      return acc;
    }, {} as any);

    // Analyse temporelle (par jour)
    const dailyAnalysis = filteredMovements.reduce((acc, movement) => {
      const date = movement.date;
      if (!acc[date]) {
        acc[date] = { entries: 0, exits: 0, total: 0 };
      }
      
      if (movement.type === 'entry') acc[date].entries++;
      if (movement.type === 'exit') acc[date].exits++;
      acc[date].total++;
      
      return acc;
    }, {} as any);

    const reportData: ReportData = {
      title: 'Rapport des Mouvements de Stock',
      subtitle: `Historique complet des entrées et sorties - Période: ${this.getPeriodLabel(period)}`,
      generatedAt: new Date().toISOString(),
      generatedBy,
      period,
      data: {
        movements: filteredMovements,
        movementAnalysis,
        serviceAnalysis,
        dailyAnalysis
      },
      summary: {
        totalMovements: movementAnalysis.totalMovements,
        entriesCount: movementAnalysis.entries,
        exitsCount: movementAnalysis.exits,
        pendingCount: movementAnalysis.pending
      },
      charts: [
        {
          type: 'donut',
          title: 'Répartition Entrées/Sorties',
          data: [
            { name: 'Entrées', value: movementAnalysis.entries, color: '#00A86B' },
            { name: 'Sorties', value: movementAnalysis.exits, color: '#DC143C' }
          ]
        },
        {
          type: 'line',
          title: 'Évolution Quotidienne',
          data: Object.entries(dailyAnalysis).map(([date, data]: [string, any]) => ({
            date,
            entries: data.entries,
            exits: data.exits,
            total: data.total
          }))
        }
      ]
    };

    // Exporter selon le format demandé
    this.exportReport(reportData, format);
    
    return reportData;
  }

  // Générer un rapport de consommation par service
  static generateConsumptionReport(
    movements: Movement[], 
    articles: Article[],
    period: string, 
    format: string,
    generatedBy: string
  ): ReportData {
    console.log(`📊 Génération rapport de consommation: ${movements.length} mouvements`);
    
    // Filtrer les sorties validées selon la période
    const filteredExits = ExportService.filterData(
      movements.filter(m => m.type === 'exit' && m.status === 'validated'), 
      { period }
    );
    
    // Analyse par service
    const serviceConsumption = filteredExits.reduce((acc, movement) => {
      const service = movement.service || 'Service non défini';
      if (!acc[service]) {
        acc[service] = {
          totalMovements: 0,
          totalQuantity: 0,
          articles: new Set(),
          categories: new Set(),
          value: 0
        };
      }
      
      acc[service].totalMovements++;
      acc[service].totalQuantity += movement.quantity;
      acc[service].articles.add(movement.articleId);
      
      // Trouver la catégorie de l'article
      const article = articles.find(a => a.id === movement.articleId);
      if (article) {
        acc[service].categories.add(article.category);
        acc[service].value += movement.quantity * (article.unitPrice || 0);
      }
      
      return acc;
    }, {} as any);

    // Convertir les Sets en nombres
    Object.keys(serviceConsumption).forEach(service => {
      serviceConsumption[service].uniqueArticles = serviceConsumption[service].articles.size;
      serviceConsumption[service].uniqueCategories = serviceConsumption[service].categories.size;
      delete serviceConsumption[service].articles;
      delete serviceConsumption[service].categories;
    });

    // Analyse par catégorie
    const categoryConsumption = filteredExits.reduce((acc, movement) => {
      const article = articles.find(a => a.id === movement.articleId);
      const category = article?.category || 'Catégorie inconnue';
      
      if (!acc[category]) {
        acc[category] = {
          totalMovements: 0,
          totalQuantity: 0,
          services: new Set(),
          value: 0
        };
      }
      
      acc[category].totalMovements++;
      acc[category].totalQuantity += movement.quantity;
      acc[category].services.add(movement.service);
      acc[category].value += movement.quantity * (article?.unitPrice || 0);
      
      return acc;
    }, {} as any);

    // Convertir les Sets en nombres
    Object.keys(categoryConsumption).forEach(category => {
      categoryConsumption[category].uniqueServices = categoryConsumption[category].services.size;
      delete categoryConsumption[category].services;
    });

    const reportData: ReportData = {
      title: 'Rapport de Consommation par Service',
      subtitle: `Analyse détaillée de la consommation - Période: ${this.getPeriodLabel(period)}`,
      generatedAt: new Date().toISOString(),
      generatedBy,
      period,
      data: {
        movements: filteredExits,
        serviceConsumption,
        categoryConsumption
      },
      summary: {
        totalConsumption: filteredExits.reduce((sum, m) => sum + m.quantity, 0),
        servicesCount: Object.keys(serviceConsumption).length,
        categoriesCount: Object.keys(categoryConsumption).length,
        totalValue: Object.values(serviceConsumption).reduce((sum: number, s: any) => sum + s.value, 0)
      },
      charts: [
        {
          type: 'bar',
          title: 'Consommation par Service',
          data: Object.entries(serviceConsumption).map(([service, data]: [string, any]) => ({
            service: service.length > 20 ? service.substring(0, 20) + '...' : service,
            quantity: data.totalQuantity,
            movements: data.totalMovements
          }))
        },
        {
          type: 'donut',
          title: 'Répartition par Catégorie',
          data: Object.entries(categoryConsumption).map(([category, data]: [string, any], index) => ({
            name: category,
            value: data.totalQuantity,
            color: ['#6B2C91', '#00A86B', '#D4AF37', '#DC143C'][index % 4]
          }))
        }
      ]
    };

    // Exporter selon le format demandé
    this.exportReport(reportData, format);
    
    return reportData;
  }

  // Exporter un rapport selon le format
  private static exportReport(reportData: ReportData, format: string): void {
    const filename = `rapport_${reportData.title.toLowerCase().replace(/\s+/g, '_')}`;
    
    switch (format) {
      case 'csv':
        // Export des données principales en CSV
        if (reportData.data.movements) {
          ExportService.exportToCSV(
            reportData.data.movements,
            filename,
            ['date', 'type', 'articleName', 'quantity', 'service', 'status']
          );
        } else if (reportData.data.articles) {
          ExportService.exportToCSV(
            reportData.data.articles,
            filename,
            ['code', 'name', 'category', 'currentStock', 'status']
          );
        }
        break;
        
      case 'excel':
      case 'json':
        // Export complet en JSON
        ExportService.exportToJSON(reportData, filename);
        break;
        
      case 'pdf':
        // Pour le PDF, on génère un JSON avec les données formatées
        this.generatePDFData(reportData, filename);
        break;
    }
  }

  // Générer les données pour PDF (simulation)
  private static generatePDFData(reportData: ReportData, filename: string): void {
    const pdfData = {
      ...reportData,
      formattedData: this.formatDataForPDF(reportData),
      metadata: {
        pages: Math.ceil(Object.keys(reportData.data).length / 20),
        format: 'A4',
        orientation: 'portrait'
      }
    };
    
    ExportService.exportToJSON(pdfData, `${filename}_pdf_data`);
    console.log('📄 Données PDF générées - Intégration avec générateur PDF nécessaire');
  }

  // Formater les données pour l'affichage PDF
  private static formatDataForPDF(reportData: ReportData): any {
    return {
      header: {
        title: reportData.title,
        subtitle: reportData.subtitle,
        date: new Date(reportData.generatedAt).toLocaleDateString('fr-FR'),
        time: new Date(reportData.generatedAt).toLocaleTimeString('fr-FR')
      },
      summary: reportData.summary,
      tables: this.generateTablesForPDF(reportData.data),
      charts: reportData.charts || []
    };
  }

  // Générer les tableaux pour PDF
  private static generateTablesForPDF(data: any): any[] {
    const tables = [];
    
    if (data.articles) {
      tables.push({
        title: 'Liste des Articles',
        headers: ['Code', 'Nom', 'Catégorie', 'Stock', 'Statut'],
        rows: data.articles.map((article: Article) => [
          article.code,
          article.name,
          article.category,
          `${article.currentStock} ${article.unit}`,
          article.status === 'normal' ? 'Normal' : 
          article.status === 'low' ? 'Faible' : 'Rupture'
        ])
      });
    }
    
    if (data.movements) {
      tables.push({
        title: 'Mouvements de Stock',
        headers: ['Date', 'Type', 'Article', 'Quantité', 'Service', 'Statut'],
        rows: data.movements.map((movement: Movement) => [
          movement.date,
          movement.type === 'entry' ? 'Entrée' : 'Sortie',
          movement.articleName,
          `${movement.quantity} ${movement.unit}`,
          movement.service,
          movement.status === 'validated' ? 'Validé' : 
          movement.status === 'pending' ? 'En attente' : 'Rejeté'
        ])
      });
    }
    
    return tables;
  }

  // Obtenir le libellé de la période
  private static getPeriodLabel(period: string): string {
    switch (period) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'quarter': return 'Ce trimestre';
      case 'year': return 'Cette année';
      default: return 'Toutes les données';
    }
  }

  // Générer un rapport personnalisé
  static generateCustomReport(
    config: {
      type: string;
      period: string;
      format: string;
      includeCharts: boolean;
      includeDetails: boolean;
      services: string[];
      categories: string[];
    },
    data: {
      articles: Article[];
      movements: Movement[];
      users: User[];
      inventories: Inventory[];
    },
    generatedBy: string
  ): ReportData {
    console.log(`📊 Génération rapport personnalisé: ${config.type}`);
    
    // Filtrer les données selon les critères
    let filteredArticles = data.articles;
    let filteredMovements = data.movements;
    
    if (config.categories.length > 0) {
      filteredArticles = filteredArticles.filter(a => 
        config.categories.some(cat => a.category.toLowerCase().includes(cat.toLowerCase()))
      );
    }
    
    if (config.services.length > 0) {
      filteredMovements = filteredMovements.filter(m => 
        config.services.includes(m.service)
      );
    }
    
    // Filtrer par période
    filteredMovements = ExportService.filterData(filteredMovements, { period: config.period });
    
    // Générer le rapport selon le type
    switch (config.type) {
      case 'stock':
        return this.generateStockReport(filteredArticles, config.period, config.format, generatedBy);
      case 'movements':
        return this.generateMovementsReport(filteredMovements, config.period, config.format, generatedBy);
      case 'consumption':
        return this.generateConsumptionReport(filteredMovements, filteredArticles, config.period, config.format, generatedBy);
      default:
        throw new Error(`Type de rapport non supporté: ${config.type}`);
    }
  }
}