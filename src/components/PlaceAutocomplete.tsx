import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { usePlaceSearch, formatPlace, type Place } from '../lib/places';

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string, place: Place | null) => void;
  placeholder?: string;
  error?: string;
  onStatusChange?: (status: { loading: boolean; error: string | null; valid: boolean }) => void;
}

export function PlaceAutocomplete({
  value,
  onChange,
  placeholder = "Rechercher une ville...",
  error: externalError,
  onStatusChange
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { places, loading, error } = usePlaceSearch(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        loading,
        error,
        valid: !!selectedPlace && !error && !loading
      });
    }
  }, [loading, error, selectedPlace, onStatusChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedPlace(null);
    onChange(newValue, null);
    setIsOpen(true);
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setQuery(formatPlace(place));
    onChange(formatPlace(place), place);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setSelectedPlace(null);
    onChange('', null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          {selectedPlace && (
            <div className="h-4 w-[1px] bg-gray-600" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-12 py-3 rounded-lg',
            'bg-white/5 backdrop-blur-lg',
            'border border-white/10',
            'text-white placeholder-gray-400',
            'focus:border-primary focus:ring-2 focus:ring-primary/50',
            'transition-all duration-200',
            'text-lg',
            (error || externalError) && 'border-red-500 focus:ring-red-500'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {(error || externalError) && (
        <p className="mt-2 text-sm text-red-400 bg-red-900/30 rounded px-3 py-2" aria-live="polite">
          {externalError || (typeof error === 'string' ? error : error?.message || 'Une erreur est survenue')}
        </p>
      )}

      <AnimatePresence>
        {isOpen && query.length >= 2 && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 max-h-60 overflow-auto"
          >
            {loading && !places.length ? (
              <div className="px-4 py-8 text-gray-400 text-center flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recherche...</span>
              </div>
            ) : places.length > 0 ? (
              <ul className="py-1">
                {places.map((place) => (
                  <motion.li
                    key={place.objectID}
                    onClick={() => handleSelectPlace(place)}
                    className={cn(
                      'px-4 py-3 cursor-pointer',
                      'hover:bg-white/5 transition-colors',
                      'text-gray-300 hover:text-white',
                      'flex items-center gap-3'
                    )}
                    whileHover={{ x: 5 }}
                  >
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-lg">
                        {place.locale_names.fr?.[0]}
                      </div>
                      <div className="text-sm text-gray-400">
                        {place.administrative[0]}, France
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-gray-400 text-center">
                Aucun résultat trouvé pour "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlaceAutocomplete;