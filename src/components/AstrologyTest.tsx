import { useState } from 'react';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { AstrologyService, type BirthData, type NatalChart, type GuidanceResponse } from '../lib/astrology';
import { cn } from '../lib/utils';
import { ApiError } from '../lib/errors';

export function AstrologyTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    natalChart?: NatalChart;
    guidance?: GuidanceResponse;
    error?: string;
  } | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Données de test
      const birthData: BirthData = {
        date_of_birth: '1990-01-01',
        time_of_birth: '12:00',
        location: '48.8566,2.3522' // Paris
      };

      // Calculer le thème natal
      const natalChart = await AstrologyService.calculateNatalChart(birthData);

      // Générer la guidance
      const guidance = await AstrologyService.generateDailyGuidance(
        'test-user',
        natalChart
      );

      setResult({ natalChart, guidance });
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7]">Test Astrologique</h2>

      <button
        onClick={handleTest}
        disabled={loading}
        className={cn(
          'w-full py-3 px-4 rounded-lg',
          'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
          'text-gray-900 font-semibold',
          'flex items-center justify-center gap-2',
          'transition-all duration-200',
          'hover:opacity-90',
          'focus:outline-none focus:ring-2 focus:ring-[#F5CBA7] focus:ring-opacity-50',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Calcul en cours...
          </>
        ) : (
          <>
            <Star className="w-5 h-5" />
            Tester le service astrologique
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 space-y-4">
          {result.error ? (
            <div className="p-4 bg-red-500/10 text-red-400 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{result.error}</span>
            </div>
          ) : (
            <>
              {result.natalChart && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-[#F5CBA7]">
                    Thème Natal
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      Ascendant : {result.natalChart.ascendant.sign} à{' '}
                      {result.natalChart.ascendant.degree}°
                    </p>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-gray-400">
                        Positions planétaires :
                      </p>
                      <ul className="space-y-1">
                        {result.natalChart.planets.map((planet) => (
                          <li
                            key={planet.name}
                            className="text-sm text-gray-300 flex items-center gap-2"
                          >
                            <span className="text-[#F5CBA7]">{planet.name}</span>
                            <span>
                              {planet.sign} ({planet.longitude}°) - Maison{' '}
                              {planet.house}
                            </span>
                            {planet.retrograde && (
                              <span className="text-orange-400 text-xs">R</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {result.guidance && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-[#F5CBA7]">
                    Guidance du Jour
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-300">{result.guidance.summary}</p>
                    <div className="grid gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#F5CBA7]">
                          Amour
                        </p>
                        <p className="text-sm text-gray-300">
                          {result.guidance.love}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F5CBA7]">
                          Travail
                        </p>
                        <p className="text-sm text-gray-300">
                          {result.guidance.work}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F5CBA7]">
                          Énergie
                        </p>
                        <p className="text-sm text-gray-300">
                          {result.guidance.energy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AstrologyTest;