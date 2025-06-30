import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePerformance } from '../lib/hooks/usePerformance';

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export function PerformanceMonitor({ className, showDetails = false }: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const { getMetrics, getAverageDuration } = usePerformance({ enableLogging: false });

  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  const totalRequests = metrics.length;
  const averageResponseTime = totalRequests > 0 
    ? metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalRequests 
    : 0;

  const cacheHits = metrics.filter(m => m.metadata?.fromCache).length;
  const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

  return (
    <>
      {/* Bouton pour afficher/masquer le moniteur */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'bg-primary/90 backdrop-blur-lg',
          'p-3 rounded-full shadow-lg',
          'hover:bg-primary transition-colors',
          'flex items-center gap-2 text-white',
          className
        )}
      >
        <Activity className="w-5 h-5" />
        <span className="text-sm font-medium">Perf</span>
      </button>

      {/* Panneau de surveillance */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-80 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Performance Monitor
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Métriques principales */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Requêtes totales:</span>
                <span className="text-white font-medium">{totalRequests}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Temps moyen:</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Cache hit rate:</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {cacheHitRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Détails des requêtes */}
            {showDetails && metrics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-2">Dernières requêtes:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {metrics.slice(-5).map((metric, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{metric.name}</span>
                        <span className={cn(
                          "font-medium",
                          metric.duration && metric.duration < 100 ? "text-green-400" :
                          metric.duration && metric.duration < 500 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {metric.duration?.toFixed(0)}ms
                        </span>
                      </div>
                      {metric.metadata?.fromCache && (
                        <span className="text-primary text-xs">(cache)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PerformanceMonitor; 