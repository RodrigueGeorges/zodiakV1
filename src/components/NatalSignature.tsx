import { motion } from 'framer-motion';
import { Sun, Moon, Sparkle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Un mappage simple des noms de signes aux icônes (à remplacer par de vraies icônes SVG si disponibles)
const ZodiacIcon = ({ sign }: { sign: string }) => {
  const icons: { [key: string]: string } = {
    Bélier: '♈', Taureau: '♉', Gémeaux: '♊', Cancer: '♋', Lion: '♌', Vierge: '♍',
    Balance: '♎', Scorpion: '♏', Sagittaire: '♐', Capricorne: '♑', Verseau: '♒', Poissons: '♓'
  };
  return <span className="text-2xl">{icons[sign] || '✨'}</span>;
};

const signDescriptions: { [key: string]: string } = {
  Bélier: "Pionnier, courageux et direct.",
  Taureau: "Fiable, patient et sensuel.",
  Gémeaux: "Adaptable, curieux et communicatif.",
  Cancer: "Intuitif, protecteur et sensible.",
  Lion: "Créatif, généreux et confiant.",
  Vierge: "Pratique, loyal et analytique.",
  Balance: "Diplomate, juste et sociable.",
  Scorpion: "Passionné, tenace et perspicace.",
  Sagittaire: "Optimiste, aventureux et honnête.",
  Capricorne: "Responsable, discipliné et ambitieux.",
  Verseau: "Indépendant, humanitaire et original.",
  Poissons: "Compatissant, artistique et sage."
};

interface NatalSignatureProps {
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
}

export function NatalSignature({ sunSign, moonSign, ascendantSign }: NatalSignatureProps) {
  const signatureItems = [
    { label: 'Soleil', sign: sunSign, icon: <Sun className="w-5 h-5 text-yellow-400" /> },
    { label: 'Lune', sign: moonSign, icon: <Moon className="w-5 h-5 text-slate-300" /> },
    { label: 'Ascendant', sign: ascendantSign, icon: <Sparkle className="w-5 h-5 text-fuchsia-400" /> }
  ];

  const handleSignClick = (sign: string, label: string) => {
    const description = signDescriptions[sign] || "Informations non disponibles.";
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-cosmic-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-white/10 p-4`}
      >
        <div className="flex-1 w-0">
          <p className="text-sm font-semibold text-primary">{label} en {sign}</p>
          <p className="mt-1 text-sm text-gray-300">{description}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-6">
      <h3 className="text-lg font-cinzel font-semibold mb-4 text-center text-primary">Signature Astrale</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        {signatureItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => handleSignClick(item.sign, item.label)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {item.icon}
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
            <ZodiacIcon sign={item.sign} />
            <span className="text-sm text-gray-300 mt-1">{item.sign}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default NatalSignature;
