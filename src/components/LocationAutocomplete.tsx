import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les suggestions quand la valeur change
  useEffect(() => {
    const newSuggestions = LocationStorageService.searchLocations(value);
    setSuggestions(newSuggestions);
  }, [value]);

  // Gérer le focus sur l'input
  const handleFocus = () => {
    const allSuggestions = LocationStorageService.searchLocations('');
    setSuggestions(allSuggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // Gérer la perte de focus
  const handleBlur = (e: React.FocusEvent) => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  // Gérer les changements de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const newSuggestions = LocationStorageService.searchLocations(newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Supprimer une suggestion de l'historique
  const removeSuggestion = (suggestion: string, e: React.MouseEvent) => {
    e.stopPropagation();
    LocationStorageService.removeLocationFromHistory(suggestion);
    const newSuggestions = LocationStorageService.searchLocations(value);
    setSuggestions(newSuggestions);
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

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors ${
                index === highlightedIndex 
                  ? 'bg-green-50 text-green-900' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="flex items-center flex-1">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-900">{suggestion}</span>
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
              className={`flex items-center px-4 py-2 cursor-pointer border-t border-gray-200 ${
                highlightedIndex === suggestions.length 
                  ? 'bg-green-50 text-green-900' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                LocationStorageService.addLocationToHistory(value.trim());
                setShowSuggestions(false);
              }}
            >
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm text-green-700">
                Ajouter "{value.trim()}" comme nouvel emplacement
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;