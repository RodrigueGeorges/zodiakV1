import { motion } from 'framer-motion';

function CosmicLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-24 h-24">
        {/* Anneau cosmique */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-[#F5CBA7]/30"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />
        {/* Anneau secondaire */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-[#D4A373]/30"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />
        {/* Planète centrale */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#F5CBA7] to-[#D4A373] shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />
        {/* Étoiles filantes */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/80 shadow"
            style={{
              top: `${10 + i * 20}%`,
              left: `${20 + i * 25}%`,
            }}
            animate={{
              x: [0, 40, 0],
              opacity: [1, 0, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8 + i * 0.5,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span className="mt-6 text-primary font-cinzel text-lg animate-pulse">Chargement cosmique...</span>
    </div>
  );
}

export default CosmicLoader; 