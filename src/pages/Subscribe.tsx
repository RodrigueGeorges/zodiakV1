import { CreditCard, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { StarryBackground } from '../components/StarryBackground';
import { InteractiveCard } from '../components/InteractiveCard';
import { Logo } from '../components/Logo';
import { StripeSubscription } from '../components/StripeSubscription';

const features = [
  {
    icon: <Star className="w-6 h-6 text-[#F5CBA7]" />,
    title: 'Guidance Quotidienne',
    description: 'Recevez chaque jour vos prédictions personnalisées'
  },
  {
    icon: <Shield className="w-6 h-6 text-[#F5CBA7]" />,
    title: 'Analyse Approfondie',
    description: 'Accédez à votre thème astral complet'
  },
  {
    icon: <CreditCard className="w-6 h-6 text-[#F5CBA7]" />,
    title: 'Paiement Sécurisé',
    description: 'Annulez à tout moment sans engagement'
  }
];

export function Subscribe() {
  return (
    <div className="min-h-screen overflow-hidden relative">
      <StarryBackground />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="mb-8"
            >
              <Logo />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-cinzel font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-[#F5CBA7] via-[#D4A373] to-[#F5CBA7] text-transparent bg-clip-text animate-cosmic-text">
                Prolongez votre connexion aux étoiles
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300"
            >
              Choisissez votre formule et commencez votre voyage astral
            </motion.p>
          </motion.div>

          <InteractiveCard className="p-8 mb-8">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-cinzel font-semibold text-[#F5CBA7]">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <StripeSubscription />
            </div>
          </InteractiveCard>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-gray-400"
          >
            En vous abonnant, vous acceptez nos conditions générales d'utilisation
            et notre politique de confidentialité.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;