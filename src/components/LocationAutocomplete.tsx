import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, Plus } from 'lucide-react';
import { LocationStorageService } from '../services/locationStorageService';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Ex: Magasin A - Étagère 2",
  disabled = false,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 🎯 CORRECTION 2: AUTOCOMPLETE AMÉLIORÉ - Initialiser avec des données de test
  useEffect(() => {
    // Ajouter des emplacements de test s'ils n'existent pas
    const existingHistory = LocationStorageService.getLocationHistory();
    const testLocations = [
      'ETAGERE 2',
      'ETAGERE 1',
      'ETAGERE 3',
      'Magasin A - Étagère 1',
      'Magasin A - Étagère 2',
      'Magasin B - Armoire IT',
      'Pharmacie - Armoire A',
      'Pharmacie - Armoire B',
      'Bureau Direction - Placard',
      'Salle de Formation - Armoire'
    ];
    
    testLocations.forEach(location => {
      if (!existingHistory.some(existing => existing.toLowerCase() === location.toLowerCase())) {
        LocationStorageService.addLocationToHistory(location);
      }
    });
  }, []);

  // Mettre à jour les suggestions quand la valeur change
  useEffect(() => {
    if (isTyping || showSuggestions) {
      const newSuggestions = LocationStorageService.searchLocations(value);
      setSuggestions(newSuggestions);
      console.log('🔍 Suggestions pour "' + value + '":', newSuggestions);
    }
  }, [value, isTyping, showSuggestions]);

  // Gérer le focus sur l'input
  const handleFocus = () => {
    console.log('🎯 Focus sur input emplacement');
    const allSuggestions = LocationStorageService.searchLocations('');
    setSuggestions(allSuggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
    setIsTyping(false);
  };

  // Gérer la perte de focus
  const handleBlur = (e: React.FocusEvent) => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setIsTyping(false);
      }
    }, 150);
  };

  // Gérer les changements de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('✏️ Saisie emplacement:', newValue);
    onChange(newValue);
    
    setIsTyping(true);
    const newSuggestions = LocationStorageService.searchLocations(newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Ajouter la valeur actuelle à l'historique si elle n'existe pas
        if (value.trim()) {
          LocationStorageService.addLocationToHistory(value.trim());
          setShowSuggestions(false);
          console.log('✅ Nouvel emplacement ajouté:', value.trim());
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          selectSuggestion(suggestions[highlightedIndex]);
        } else if (value.trim()) {
          // Ajouter la valeur actuelle à l'historique si elle n'existe pas
          LocationStorageService.addLocationToHistory(value.trim());
          setShowSuggestions(false);
          console.log('✅ Nouvel emplacement ajouté via Enter:', value.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setIsTyping(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    console.log('✅ Suggestion sélectionnée:', suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  // Supprimer une suggestion de l'historique
  const removeSuggestion = (suggestion: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🗑️ Suppression suggestion:', suggestion);
    LocationStorageService.removeLocationFromHistory(suggestion);
    const newSuggestions = LocationStorageService.searchLocations(value);
    setSuggestions(newSuggestions);
  };

  // Ajouter un nouvel emplacement
  const addNewLocation = () => {
    if (value.trim()) {
      LocationStorageService.addLocationToHistory(value.trim());
      setShowSuggestions(false);
      console.log('✅ Nouvel emplacement ajouté manuellement:', value.trim());
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': '#00A86B' } as any}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {/* 🎯 CORRECTION 2: DROPDOWN DE SUGGESTIONS AMÉLIORÉ */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {/* En-tête du dropdown */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600">
              {suggestions.length > 0 ? `${suggestions.length} emplacements trouvés` : 'Aucun emplacement trouvé'}
            </p>
          </div>

          {/* Suggestions existantes */}
          {suggestions.length > 0 && suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex 
                  ? 'bg-green-50 text-green-900' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="flex items-center flex-1">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-900 font-medium">{suggestion}</span>
                  <p className="text-xs text-gray-500">Emplacement existant</p>
                </div>
              </div>
              <div className="group">
                <button
                  type="button"
                  onClick={(e) => removeSuggestion(suggestion, e)}
                  className="ml-2 p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer de l'historique"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Option pour ajouter un nouvel emplacement */}
          {value.trim() && !suggestions.some(s => s.toLowerCase() === value.toLowerCase()) && (
            <div
              className={`flex items-center px-4 py-3 cursor-pointer border-t-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors ${
                highlightedIndex === suggestions.length 
                  ? 'bg-green-100' 
                  : ''
              }`}
              onClick={addNewLocation}
            >
              <Plus className="w-4 h-4 mr-3 text-green-500" />
              <div>
                <span className="text-sm text-green-700 font-medium">
                  Ajouter "{value.trim()}"
                </span>
                <p className="text-xs text-green-600">Créer un nouvel emplacement</p>
              </div>
            </div>
          )}

          {/* Message si aucune suggestion */}
          {suggestions.length === 0 && !value.trim() && (
            <div className="px-4 py-6 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Commencez à taper pour voir les suggestions</p>
              <p className="text-xs mt-1">Ex: ETAGERE, Magasin, Pharmacie...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;