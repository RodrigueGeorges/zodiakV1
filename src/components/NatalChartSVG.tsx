import React, { useState } from 'react';

interface NatalChartSVGProps {
  chartData: {
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
      house: number;
      longitude: number;
      latitude: number;
    }>;
    houses: Array<{
      number: number;
      sign: string;
      degree: number;
      longitude: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      type: string;
      orb: number;
    }>;
  };
  size?: number;
  showLabels?: boolean;
  showHouses?: boolean;
  showAspects?: boolean;
}

export function NatalChartSVG({ chartData, size = 400, showLabels = true }: NatalChartSVGProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Pour la démo, on simule un SVG simple avec des cercles pour les planètes et maisons
  // Dans la vraie app, tu peux parser le SVG retourné par l'API et ajouter les handlers sur les bons éléments
  const width = size;
  const height = size;
  const center = width / 2;
  const radius = 150;

  return (
    <div className="relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-lg">
        {/* Cercle principal */}
        <circle cx={center} cy={center} r={radius} fill="#0a0a23" stroke="#F5CBA7" strokeWidth={3} />
        {/* Maisons astrologiques */}
        {chartData.houses && chartData.houses.map((house) => {
          const angle = (house.number / 12) * 2 * Math.PI;
          const x = center + Math.cos(angle) * (radius - 20);
          const y = center + Math.sin(angle) * (radius - 20);
          return (
            <g key={`house-${house.number}`}>
              <circle cx={x} cy={y} r={3} fill="#F5CBA7" />
              {showLabels && (
                <text x={x + 10} y={y} fontSize="12" fill="#F5CBA7">
                  {house.number}
                </text>
              )}
            </g>
          );
        })}
        {/* Planètes */}
        {chartData.planets && chartData.planets.map((planet) => {
          const angle = (planet.longitude / 360) * 2 * Math.PI;
          const x = center + Math.cos(angle) * (radius - 60);
          const y = center + Math.sin(angle) * (radius - 60);
          return (
            <g key={`planet-${planet.name}`}>
              <circle 
                cx={x} 
                cy={y} 
                r={5} 
                fill="#FFD700"
                onMouseEnter={(e) => setTooltip({ 
                  x: e.clientX, 
                  y: e.clientY, 
                  content: `${planet.name} en ${planet.sign} (${planet.degree.toFixed(1)}°)` 
                })}
                onMouseLeave={() => setTooltip(null)}
              />
              {showLabels && (
                <text x={x + 8} y={y + 4} fontSize="10" fill="#FFD700">
                  {planet.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tooltip && (
        <div
          className="fixed z-50 bg-cosmic-800 text-white rounded-lg shadow-lg px-4 py-2 text-sm font-cinzel border border-primary"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12, pointerEvents: 'none', maxWidth: 260 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

export default NatalChartSVG; 