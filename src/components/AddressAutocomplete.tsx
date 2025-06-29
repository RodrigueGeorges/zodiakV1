import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { AddressService, type Address } from '../lib/address';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, address: Address | null) => void;
  error?: string;
  type?: 'housenumber' | 'street' | 'locality' | 'municipality';
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  error,
  type,
  placeholder = "Rechercher une adresse..."
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const searchAddresses = async () => {
      if (query.length < 3) {
        setAddresses([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Searching addresses for:', query);
        const results = await AddressService.search(query, { 
          type,
          limit: 5
        });
        console.log('Search results:', results);
        setAddresses(results);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAddresses, 300);
    return () => clearTimeout(timeoutId);
  }, [query, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedAddress(null);
    onChange(newValue, null);
    setIsOpen(true);
  };

  const handleSelectAddress = (address: Address) => {
    console.log('Selected address:', address);
    setSelectedAddress(address);
    const formattedAddress = AddressService.formatAddress(address);
    setQuery(formattedAddress);
    onChange(formattedAddress, address);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setSelectedAddress(null);
    onChange('', null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          {selectedAddress && (
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
            error && 'border-red-500 focus:ring-red-500'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
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

      {error && (
        <p className="mt-1 text-sm text-red-500 pl-3">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && query.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-gray-800/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 max-h-60 overflow-auto"
          >
            {addresses.length > 0 ? (
              <ul className="py-1">
                {addresses.map((address) => (
                  <motion.li
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className={cn(
                      'px-4 py-3 cursor-pointer',
                      'hover:bg-white/10 transition-colors',
                      'text-white',
                      'flex items-center gap-3'
                    )}
                    whileHover={{ x: 5 }}
                  >
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="font-medium text-lg text-white">
                        {address.street || address.city}
                      </div>
                      <div className="text-sm text-gray-300">
                        {address.postcode} {address.city}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-gray-300 text-center">
                {loading ? 'Recherche...' : 'Aucun résultat trouvé'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}