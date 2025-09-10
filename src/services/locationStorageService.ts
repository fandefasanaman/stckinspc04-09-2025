// Service pour gérer l'historique des emplacements de stockage
export class LocationStorageService {
  private static STORAGE_KEY = 'stock_locations_history';

  // Obtenir l'historique des emplacements
  static getLocationHistory(): string[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      const parsed = history ? JSON.parse(history) : [];
      
      // 🎯 CORRECTION: Ajouter des emplacements par défaut si l'historique est vide
      if (parsed.length === 0) {
        const defaultLocations = [
          'ETAGERE 2',
          'ETAGERE 1',
          'ETAGERE 3',
          'Magasin A - Étagère 1',
          'Magasin A - Étagère 2',
          'Magasin A - Étagère 3',
          'Magasin B - Armoire IT',
          'Magasin B - Étagère 1',
          'Pharmacie - Armoire A',
          'Pharmacie - Armoire B',
          'Pharmacie - Réfrigérateur',
          'Bureau Direction - Placard',
          'Salle de Formation - Armoire',
          'Entrepôt Principal - Zone A',
          'Entrepôt Principal - Zone B',
          'Local Technique - Étagère',
          'Infirmerie - Armoire Médicale',
          'Secrétariat - Placard Bureau'
        ];
        
        // Sauvegarder les emplacements par défaut
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultLocations));
        console.log('✅ Emplacements par défaut initialisés:', defaultLocations.length);
        return defaultLocations;
      }
      
      return parsed;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des emplacements:', error);
      return [];
    }
  }

  // Ajouter un nouvel emplacement à l'historique
  static addLocationToHistory(location: string): void {
    if (!location || location.trim() === '') return;

    try {
      const history = this.getLocationHistory();
      const trimmedLocation = location.trim();
      
      // Éviter les doublons (insensible à la casse)
      const exists = history.some(loc => 
        loc.toLowerCase() === trimmedLocation.toLowerCase()
      );
      
      if (!exists) {
        // Ajouter au début de la liste
        const newHistory = [trimmedLocation, ...history];
        
        // Limiter à 50 emplacements pour éviter l'encombrement
        const limitedHistory = newHistory.slice(0, 50);
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
        console.log('✅ Nouvel emplacement ajouté à l\'historique:', trimmedLocation);
      } else {
        // Si l'emplacement existe, le remonter en première position
        const filteredHistory = history.filter(loc => 
          loc.toLowerCase() !== trimmedLocation.toLowerCase()
        );
        const newHistory = [trimmedLocation, ...filteredHistory];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newHistory));
        console.log('✅ Emplacement remonté en première position:', trimmedLocation);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'emplacement à l\'historique:', error);
    }
  }

  // Rechercher des emplacements par terme
  static searchLocations(searchTerm: string): string[] {
    const history = this.getLocationHistory();
    
    if (!searchTerm || searchTerm.trim() === '') {
      // Retourner les 10 premiers emplacements si pas de recherche
      return history.slice(0, 10);
    }

    const term = searchTerm.toLowerCase().trim();
    
    // 🎯 RECHERCHE AMÉLIORÉE - Plusieurs méthodes de correspondance
    const exactMatches: string[] = [];
    const startMatches: string[] = [];
    const containsMatches: string[] = [];
    
    history.forEach(location => {
      const locationLower = location.toLowerCase();
      
      if (locationLower === term) {
        exactMatches.push(location);
      } else if (locationLower.startsWith(term)) {
        startMatches.push(location);
      } else if (locationLower.includes(term)) {
        containsMatches.push(location);
      }
    });
    
    // Combiner les résultats par ordre de pertinence
    const results = [...exactMatches, ...startMatches, ...containsMatches];
    
    // Limiter à 10 suggestions et supprimer les doublons
    const uniqueResults = Array.from(new Set(results)).slice(0, 10);
    
    console.log(`🔍 Recherche "${searchTerm}": ${uniqueResults.length} résultats trouvés`);
    return uniqueResults;
  }

  // Nettoyer l'historique (garder seulement les plus récents)
  static cleanHistory(): void {
    try {
      const history = this.getLocationHistory();
      const cleanedHistory = history.slice(0, 30); // Garder seulement les 30 plus récents
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedHistory));
      console.log('✅ Historique des emplacements nettoyé');
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'historique:', error);
    }
  }

  // Supprimer un emplacement de l'historique
  static removeLocationFromHistory(location: string): void {
    try {
      const history = this.getLocationHistory();
      const newHistory = history.filter(loc => 
        loc.toLowerCase() !== location.toLowerCase()
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newHistory));
      console.log('✅ Emplacement supprimé de l\'historique:', location);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emplacement:', error);
    }
  }

  // 🎯 NOUVELLE MÉTHODE: Obtenir les emplacements les plus utilisés
  static getMostUsedLocations(limit: number = 5): string[] {
    try {
      const history = this.getLocationHistory();
      // Pour l'instant, retourner simplement les premiers (les plus récents)
      // Dans une version future, on pourrait compter la fréquence d'utilisation
      return history.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des emplacements les plus utilisés:', error);
      return [];
    }
  }

  // 🎯 NOUVELLE MÉTHODE: Obtenir des suggestions intelligentes basées sur la catégorie
  static getSmartSuggestions(category?: string, searchTerm?: string): string[] {
    const history = this.getLocationHistory();
    
    if (!category) {
      return this.searchLocations(searchTerm || '');
    }
    
    // Suggestions basées sur la catégorie
    const categoryKeywords: { [key: string]: string[] } = {
      'médical': ['pharmacie', 'armoire', 'réfrigérateur', 'infirmerie'],
      'medical': ['pharmacie', 'armoire', 'réfrigérateur', 'infirmerie'],
      'bureau': ['bureau', 'placard', 'secrétariat', 'direction'],
      'informatique': ['it', 'technique', 'armoire'],
      'entretien': ['entrepôt', 'local', 'technique']
    };
    
    const keywords = categoryKeywords[category.toLowerCase()] || [];
    
    if (keywords.length === 0) {
      return this.searchLocations(searchTerm || '');
    }
    
    // Filtrer l'historique par mots-clés de catégorie
    const categoryMatches = history.filter(location => 
      keywords.some(keyword => 
        location.toLowerCase().includes(keyword)
      )
    );
    
    // Combiner avec la recherche textuelle si fournie
    if (searchTerm && searchTerm.trim()) {
      const textMatches = this.searchLocations(searchTerm);
      const combined = [...new Set([...categoryMatches, ...textMatches])];
      return combined.slice(0, 10);
    }
    
    return categoryMatches.slice(0, 10);
  }
}