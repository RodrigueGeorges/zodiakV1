import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Clock, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { PlaceAutocomplete } from './PlaceAutocomplete';
import type { Place } from '../lib/places';

export function PlaceSearchTest() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);

  const handlePlaceChange = (value: string, place: Place | null) => {
    setSelectedPlace(place);
    setSearchCount(prev => prev + 1);
    setLastSearchTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-cosmic-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Test des Optimisations</h1>
          <p className="text-gray-300">
            Testez la recherche de lieux avec debouncing et cache
          </p>
        </motion.div>

        {/* Métriques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-primary" />
              <span className="font-medium">Requêtes</span>
            </div>
            <div className="text-2xl font-bold text-white">{searchCount}</div>
            <div className="text-sm text-gray-400">Total effectuées</div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="font-medium">Performance</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {searchCount > 0 ? Math.round(100 / searchCount) : 0}%
            </div>
            <div className="text-sm text-gray-400">Optimisation</div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Dernière</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {lastSearchTime > 0 ? new Date(lastSearchTime).toLocaleTimeString() : '--'}
            </div>
            <div className="text-sm text-gray-400">Recherche</div>
          </div>
        </motion.div>

        {/* Zone de test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Test de Recherche
            </h2>
            
            <PlaceAutocomplete
              value=""
              onChange={handlePlaceChange}
              placeholder="Tapez 'Corbeil' pour tester..."
            />

            {selectedPlace && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <h3 className="font-medium text-green-400 mb-2">Lieu sélectionné :</h3>
                <p className="text-white">{selectedPlace.locale_names.fr?.[0]}</p>
                <p className="text-gray-300 text-sm">
                  {selectedPlace.administrative[0]}, {selectedPlace.country}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Coordonnées: {selectedPlace._geoloc.lat}, {selectedPlace._geoloc.lng}
                </p>
              </motion.div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-400 mb-2">Instructions de test :</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Tapez "Corbeil" caractère par caractère</li>
              <li>• Observez le nombre de requêtes dans la console</li>
              <li>• Vérifiez que le cache fonctionne en retapant la même recherche</li>
              <li>• Les requêtes devraient être limitées grâce au debouncing de 300ms</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 