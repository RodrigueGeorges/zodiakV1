import React, { useState } from 'react';

interface NatalChartSVGProps {
  natalChart: any;
}

const planetDescriptions: Record<string, string> = {
  Soleil: "Le Soleil représente l'identité, la volonté et l'expression de soi.",
  Lune: "La Lune symbolise les émotions, l'intuition et le monde intérieur.",
  Mercure: "Mercure gouverne la communication, l'intellect et l'apprentissage.",
  Vénus: "Vénus concerne l'amour, la beauté et les valeurs.",
  Mars: "Mars incarne l'énergie, l'action et le désir.",
  Jupiter: "Jupiter est lié à l'expansion, la chance et la croissance.",
  Saturne: "Saturne représente la structure, la discipline et les leçons de vie.",
  Uranus: "Uranus symbolise l'innovation, la liberté et le changement soudain.",
  Neptune: "Neptune concerne l'inspiration, la spiritualité et les rêves.",
  Pluton: "Pluton est associé à la transformation, la puissance et la régénération."
};

const houseDescriptions: Record<number, string> = {
  1: "La Maison I concerne l'identité, l'apparence et la première impression.",
  2: "La Maison II touche aux ressources, à la sécurité et aux valeurs.",
  3: "La Maison III régit la communication, l'entourage et l'apprentissage.",
  4: "La Maison IV parle du foyer, des racines et de la famille.",
  5: "La Maison V est celle de la créativité, des plaisirs et des enfants.",
  6: "La Maison VI concerne le travail quotidien, la santé et le service.",
  7: "La Maison VII est celle des partenariats et du mariage.",
  8: "La Maison VIII touche à la transformation, l'intimité et les ressources partagées.",
  9: "La Maison IX régit la philosophie, les voyages et l'expansion de l'esprit.",
  10: "La Maison X parle de la carrière, de la réputation et des objectifs.",
  11: "La Maison XI concerne les amitiés, les groupes et les aspirations collectives.",
  12: "La Maison XII est celle de l'inconscient, du retrait et de la spiritualité."
};

export function NatalChartSVG({ natalChart }: NatalChartSVGProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Pour la démo, on simule un SVG simple avec des cercles pour les planètes et maisons
  // Dans la vraie app, tu peux parser le SVG retourné par l'API et ajouter les handlers sur les bons éléments
  const width = 400;
  const height = 400;
  const center = width / 2;
  const radius = 150;

  const handlePlanetMouseOver = (planet: any, e: React.MouseEvent) => {
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      content: `${planet.name} en ${planet.sign} (Maison ${planet.house}) : ${planetDescriptions[planet.name] || ''}`
    });
  };
  const handlePlanetMouseOut = () => setTooltip(null);

  const handleHouseMouseOver = (house: any, e: React.MouseEvent) => {
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      content: `Maison ${house.number} en ${house.sign} : ${houseDescriptions[house.number] || ''}`
    });
  };
  const handleHouseMouseOut = () => setTooltip(null);

  return (
    <div className="relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-lg">
        {/* Cercle principal */}
        <circle cx={center} cy={center} r={radius} fill="#0a0a23" stroke="#F5CBA7" strokeWidth={3} />
        {/* Maisons astrologiques */}
        {natalChart.houses && natalChart.houses.map((house: any, i: number) => {
          const angle = (i / 12) * 2 * Math.PI;
          const x = center + Math.cos(angle) * (radius - 20);
          const y = center + Math.sin(angle) * (radius - 20);
          return (
            <g key={house.number + '-' + i}>
              <circle
                cx={x}
                cy={y}
                r={18}
                fill="#1a1a40"
                stroke="#F5CBA7"
                strokeWidth={2}
                onMouseOver={e => handleHouseMouseOver(house, e)}
                onMouseOut={handleHouseMouseOut}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize={14}
                fill="#F5CBA7"
                className="font-cinzel"
              >
                {house.number}
              </text>
            </g>
          );
        })}
        {/* Planètes */}
        {natalChart.planets && natalChart.planets.map((planet: any, i: number) => {
          const angle = (planet.longitude / 360) * 2 * Math.PI;
          const x = center + Math.cos(angle) * (radius - 60);
          const y = center + Math.sin(angle) * (radius - 60);
          return (
            <g key={planet.name + '-' + i}>
              <circle
                cx={x}
                cy={y}
                r={12}
                fill="#F5CBA7"
                stroke="#fff"
                strokeWidth={2}
                onMouseOver={e => handlePlanetMouseOver(planet, e)}
                onMouseOut={handlePlanetMouseOut}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize={12}
                fill="#0a0a23"
                className="font-cinzel"
              >
                {planet.name[0]}
              </text>
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