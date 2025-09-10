import React, { useState, useRef, useEffect } from 'react';
import { Truck, X, Plus } from 'lucide-react';
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { SupplierServiceWithFallback } from '../services/supplierServiceWithFallback';
import { Supplier } from '../types';

interface SupplierAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SupplierAutocomplete: React.FC<SupplierAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Ex: PHARMADIS MADAGASCAR",
  disabled = false,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<Supplier[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Récupérer les fournisseurs depuis Firestore avec fallback
  const { data: allSuppliers } = useFirestoreWithFallback<Supplier>('suppliers', [], [], [
    // Données de fallback enrichies pour les fournisseurs
    {
      id: 'fallback-1',
      name: 'PHARMADIS MADAGASCAR',
      code: 'PHA001',
      contact: {
        email: 'contact@pharmadis.mg',
        phone: '+261 20 22 123 45'
      },
      categories: ['Consommables Médicaux'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      name: 'DISTRIMAD',
      code: 'DIS001',
      contact: {
        email: 'info@distrimad.mg',
        phone: '+261 20 22 234 56'
      },
      categories: ['Fournitures Bureau'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      name: 'SOCOBIS',
      code: 'SOC001',
      contact: {
        email: 'contact@socobis.mg',
        phone: '+261 20 22 345 67'
      },
      categories: ['Consommables IT'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fallback-4',
      name: 'SODIM ANDRAHARO',
      code: 'SOD001',
      contact: {
        email: 'sodim@andraharo.mg',
        phone: '+261 20 22 456 78'
      },
      categories: ['Consommables Médicaux'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Mettre à jour les suggestions quand la valeur change
  useEffect(() => {
    if (isTyping || showSuggestions) {
      const newSuggestions = SupplierServiceWithFallback.searchSuppliersByName(value, allSuppliers);
      setSuggestions(newSuggestions);
      console.log('🔍 Suggestions fournisseur pour "' + value + '":', newSuggestions.length);
    }
  }, [value, isTyping, showSuggestions, allSuppliers]);

  // Gérer le focus sur l'input
  const handleFocus = () => {
    console.log('🎯 Focus sur input fournisseur');
    const allSuggestions = SupplierServiceWithFallback.searchSuppliersByName('', allSuppliers);
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
    console.log('✏️ Saisie fournisseur:', newValue);
    onChange(newValue);
    
    setIsTyping(true);
    const newSuggestions = SupplierServiceWithFallback.searchSuppliersByName(newValue, allSuppliers);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setShowSuggestions(false);
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
          selectSuggestion(suggestions[highlightedIndex].name);
        } else {
          setShowSuggestions(false);
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
  const selectSuggestion = (supplierName: string) => {
    console.log('✅ Fournisseur sélectionné:', supplierName);
    onChange(supplierName);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  // Ajouter un nouveau fournisseur
  const addNewSupplier = () => {
    if (value.trim()) {
      console.log('✅ Nouveau fournisseur ajouté:', value.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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

      {/* Dropdown de suggestions */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {/* En-tête du dropdown */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600">
              {suggestions.length > 0 ? `${suggestions.length} fournisseurs trouvés` : 'Aucun fournisseur trouvé'}
            </p>
          </div>

          {/* Suggestions existantes */}
          {suggestions.length > 0 && suggestions.map((supplier, index) => (
            <div
              key={supplier.id}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex 
                  ? 'bg-green-50 text-green-900' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectSuggestion(supplier.name)}
            >
              <div className="flex items-center flex-1">
                <Truck className="w-4 h-4 mr-3 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-900 font-medium">{supplier.name}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">Code: {supplier.code}</span>
                    {supplier.categories.length > 0 && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#00A86B20', color: '#00A86B' }}
                      >
                        {supplier.categories[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Option pour ajouter un nouveau fournisseur */}
          {value.trim() && !allSuppliers.some(s => s.name.toLowerCase() === value.toLowerCase()) && (
            <div
              className={`flex items-center px-4 py-3 cursor-pointer border-t-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors ${
                highlightedIndex === suggestions.length 
                  ? 'bg-green-100' 
                  : ''
              }`}
              onClick={addNewSupplier}
            >
              <Plus className="w-4 h-4 mr-3 text-green-500" />
              <div>
                <span className="text-sm text-green-700 font-medium">
                  Ajouter "{value.trim()}"
                </span>
                <p className="text-xs text-green-600">Créer un nouveau fournisseur</p>
              </div>
            </div>
          )}

          {/* Message si aucune suggestion */}
          {suggestions.length === 0 && !value.trim() && (
            <div className="px-4 py-6 text-center text-gray-500">
              <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Commencez à taper pour voir les fournisseurs</p>
              <p className="text-xs mt-1">Ex: PHARMADIS, DISTRIMAD, SOCOBIS...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierAutocomplete;