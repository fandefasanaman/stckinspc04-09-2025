// Service pour gérer l'historique des emplacements de stockage
export class LocationStorageService {
  private static STORAGE_KEY = 'stock_locations_history';

  // Obtenir l'historique des emplacements
  static getLocationHistory(): string[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
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
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'emplacement à l\'historique:', error);
    }
  }

  // Rechercher des emplacements par terme
  static searchLocations(searchTerm: string): string[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getLocationHistory().slice(0, 10); // Retourner les 10 premiers
    }

    const history = this.getLocationHistory();
    const term = searchTerm.toLowerCase();
    
    return history.filter(location => 
      location.toLowerCase().includes(term)
    ).slice(0, 10); // Limiter à 10 suggestions
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
}