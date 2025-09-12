import { Article, Movement } from '../types';

export class ReportUtils {
  // Calculer les tendances par rapport à la période précédente
  static calculateTrends(
    currentData: any[],
    previousData: any[],
    metric: string
  ): { value: number; percentage: number; trend: 'up' | 'down' | 'stable' } {
    const currentValue = currentData.length;
    const previousValue = previousData.length;
    
    if (previousValue === 0) {
      return { value: currentValue, percentage: 0, trend: 'stable' };
    }
    
    const percentage = Math.round(((currentValue - previousValue) / previousValue) * 100);
    const trend = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
    
    return { value: currentValue, percentage, trend };
  }

  // Analyser la performance des stocks
  static analyzeStockPerformance(articles: Article[]): {
    efficiency: number;
    turnoverRate: number;
    stockHealth: 'excellent' | 'good' | 'warning' | 'critical';
    recommendations: string[];
  } {
    const totalArticles = articles.length;
    const normalStock = articles.filter(a => a.status === 'normal').length;
    const lowStock = articles.filter(a => a.status === 'low').length;
    const outOfStock = articles.filter(a => a.status === 'out').length;
    
    // Calculer l'efficacité (pourcentage d'articles avec stock normal)
    const efficiency = totalArticles > 0 ? (normalStock / totalArticles) * 100 : 0;
    
    // Simuler un taux de rotation (à améliorer avec de vraies données historiques)
    const turnoverRate = Math.random() * 12; // Simulation
    
    // Déterminer la santé du stock
    let stockHealth: 'excellent' | 'good' | 'warning' | 'critical';
    if (efficiency >= 90) stockHealth = 'excellent';
    else if (efficiency >= 75) stockHealth = 'good';
    else if (efficiency >= 60) stockHealth = 'warning';
    else stockHealth = 'critical';
    
    // Générer des recommandations
    const recommendations: string[] = [];
    
    if (outOfStock > 0) {
      recommendations.push(`${outOfStock} articles en rupture nécessitent un réapprovisionnement urgent`);
    }
    
    if (lowStock > totalArticles * 0.2) {
      recommendations.push('Trop d\'articles en stock faible - Réviser les seuils minimums');
    }
    
    if (efficiency < 80) {
      recommendations.push('Optimiser la gestion des stocks pour améliorer l\'efficacité');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Gestion de stock optimale - Continuer le suivi régulier');
    }
    
    return {
      efficiency: Math.round(efficiency),
      turnoverRate: Math.round(turnoverRate * 10) / 10,
      stockHealth,
      recommendations
    };
  }

  // Analyser les patterns de consommation
  static analyzeConsumptionPatterns(movements: Movement[]): {
    peakDays: string[];
    topCategories: { category: string; consumption: number }[];
    seasonality: any;
    predictions: string[];
  } {
    const exits = movements.filter(m => m.type === 'exit' && m.status === 'validated');
    
    // Analyser les jours de pic
    const dailyConsumption = exits.reduce((acc, movement) => {
      const day = new Date(movement.createdAt).toLocaleDateString('fr-FR', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + movement.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const peakDays = Object.entries(dailyConsumption)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
    
    // Analyser les catégories les plus consommées
    const categoryConsumption = exits.reduce((acc, movement) => {
      // Simuler la catégorie basée sur le nom de l'article
      const category = movement.articleName.includes('Papier') ? 'Fournitures Bureau' :
                     movement.articleName.includes('Cartouche') ? 'Consommables IT' :
                     'Consommables Médicaux';
      
      acc[category] = (acc[category] || 0) + movement.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryConsumption)
      .map(([category, consumption]) => ({ category, consumption }))
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5);
    
    // Prédictions simples
    const predictions = [
      'Augmentation prévue de 15% de la consommation le mois prochain',
      'Stock de papier A4 à surveiller - consommation élevée',
      'Optimisation possible des commandes groupées'
    ];
    
    return {
      peakDays,
      topCategories,
      seasonality: dailyConsumption,
      predictions
    };
  }

  // Formater les données pour l'export
  static formatDataForExport(data: any[], type: 'articles' | 'movements' | 'users'): any[] {
    switch (type) {
      case 'articles':
        return data.map(article => ({
          Code: article.code,
          Nom: article.name,
          Catégorie: article.category,
          'Stock Actuel': article.currentStock,
          'Stock Minimum': article.minStock,
          'Stock Maximum': article.maxStock,
          Unité: article.unit,
          Statut: article.status === 'normal' ? 'Normal' : 
                  article.status === 'low' ? 'Stock faible' : 'Rupture',
          Fournisseur: article.supplier || '',
          'Créé le': new Date(article.createdAt).toLocaleDateString('fr-FR')
        }));
        
      case 'movements':
        return data.map(movement => ({
          Date: movement.date,
          Heure: movement.time,
          Type: movement.type === 'entry' ? 'Entrée' : 'Sortie',
          'Code Article': movement.articleCode,
          'Nom Article': movement.articleName,
          Quantité: movement.quantity,
          Unité: movement.unit,
          Utilisateur: movement.userName,
          Service: movement.service,
          Statut: movement.status === 'validated' ? 'Validé' : 
                  movement.status === 'pending' ? 'En attente' : 'Rejeté',
          Fournisseur: movement.supplier || '',
          Bénéficiaire: movement.beneficiary || '',
          Référence: movement.reference || ''
        }));
        
      case 'users':
        return data.map(user => ({
          Nom: user.name,
          Email: user.email,
          Téléphone: user.phone,
          Rôle: user.role === 'admin' ? 'Administrateur' :
                user.role === 'manager' ? 'Gestionnaire' :
                user.role === 'supervisor' ? 'Responsable' : 'Utilisateur',
          Service: user.service,
          Statut: user.status === 'active' ? 'Actif' : 'Inactif',
          'Créé le': new Date(user.createdAt).toLocaleDateString('fr-FR'),
          'Dernière connexion': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'
        }));
        
      default:
        return data;
    }
  }

  // Valider la configuration du rapport
  static validateReportConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.period) {
      errors.push('Période non sélectionnée');
    }
    
    if (!config.format) {
      errors.push('Format non sélectionné');
    }
    
    if (config.type === 'consumption' && (!config.services || config.services.length === 0)) {
      errors.push('Au moins un service doit être sélectionné pour le rapport de consommation');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}