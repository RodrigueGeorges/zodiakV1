import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkle, Moon, Sun, Compass, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import PhoneAuth from '../components/PhoneAuth';
import Logo from '../components/Logo';
import StarryBackground from '../components/StarryBackground';
import InteractiveCard from '../components/InteractiveCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';
import CosmicLoader from '../components/CosmicLoader';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'sms' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (isSignUp) {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/register/complete`
          }
        });
        if (error || !data.user) {
          setError(error?.message || "Erreur lors de l'inscription");
        } else {
          setInfo('Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre adresse.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        }
      } else {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
        }
        // La redirection est gérée globalement dans App.tsx
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-900">
        <CosmicLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      <StarryBackground />

      <div className="container mx-auto px-4 md:px-8 xl:px-12 2xl:px-24 py-8 md:py-12 lg:py-16">
        <div className="max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl mx-auto">
          <div className="text-center mb-8 md:mb-12 xl:mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 md:mb-6"
            >
              <Logo />
            </motion.div>

            <p className="text-lg text-primary font-cinzel italic text-center mt-4 mb-6">
              L'astrologie qui éclaire votre quotidien.
            </p>

            {/* BOUTON PRINCIPAL */}
            <motion.button
              className="px-8 py-3 bg-primary text-black rounded-lg font-bold text-lg shadow-lg hover:bg-secondary transition relative flex items-center gap-2 animate-glow mx-auto mb-8"
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkle className="w-6 h-6 text-yellow-300" />
              Commencez votre voyage astral
            </motion.button>

            {/* MODALE AVEC FORMULAIRE */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-cosmic-900 rounded-2xl shadow-2xl p-6 md:p-8 xl:p-10 2xl:p-16 max-w-md w-full relative border border-primary/20"
                >
                  {/* Bouton retour à l'accueil */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 left-3 text-primary hover:text-secondary text-lg font-bold"
                  >
                    ← Accueil
                  </button>
                  {/* Croix de fermeture */}
                  <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-primary hover:text-secondary text-2xl">×</button>
                  <InteractiveCard className="p-6 md:p-8 xl:p-10 2xl:p-16">
                    <h2 className="text-xl md:text-2xl font-cinzel font-bold text-center mb-4 md:mb-6">
                      <span className="bg-gradient-to-r from-primary via-secondary to-primary text-transparent bg-clip-text">
                        {isSignUp ? 'Inscription' : 'Connexion'}
                      </span>
                    </h2>
                    <div className="flex justify-center mb-4 gap-4">
                      <button
                        className={cn('px-3 py-1 rounded', authMode === 'sms' ? 'bg-primary text-black' : 'bg-white/10 text-white')}
                        onClick={() => setAuthMode('sms')}
                      >SMS</button>
                      <button
                        className={cn('px-3 py-1 rounded', authMode === 'email' ? 'bg-primary text-black' : 'bg-white/10 text-white')}
                        onClick={() => setAuthMode('email')}
                      >Email</button>
                    </div>
                    {authMode === 'sms' ? (
                      <PhoneAuth onSuccess={() => navigate('/guidance')} />
                    ) : (
                      <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                            placeholder="Votre email"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
                          <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                            placeholder="Votre mot de passe"
                            required
                          />
                        </div>
                        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
                        {info && <div className="text-green-400 text-sm mb-2">{info}</div>}
                        <motion.button
                          type="submit"
                          className="w-full py-2 rounded-lg bg-primary text-black font-semibold hover:bg-secondary transition-colors relative overflow-hidden"
                          whileTap={{ scale: 0.97 }}
                          animate={loading ? { boxShadow: '0 0 24px 8px #F5CBA7' } : {}}
                          disabled={loading}
                        >
                          {loading ? 'Chargement...' : (isSignUp ? 'Créer un compte' : 'Se connecter')}
                        </motion.button>
                        <div className="text-center mt-2">
                          {isSignUp ? (
                            <span className="text-sm text-gray-400">Déjà un compte ? <button type="button" className="underline text-primary" onClick={() => setIsSignUp(false)}>Se connecter</button></span>
                          ) : (
                            <span className="text-sm text-gray-400">Pas encore de compte ? <button type="button" className="underline text-primary" onClick={() => setIsSignUp(true)}>Créer un compte</button></span>
                          )}
                        </div>
                      </form>
                    )}
                    <div className="mt-4 md:mt-6 text-center">
                      <p className="text-sm md:text-base text-gray-400">
                        Pas encore de compte ?{' '}
                        <Link 
                          to="/register" 
                          className="text-primary hover:text-secondary transition-colors"
                        >
                          Inscrivez-vous
                        </Link>
                      </p>
                    </div>
                  </InteractiveCard>
                </motion.div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative mb-16 md:mb-24"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-xl opacity-50" />
              <div className="relative bg-white/5 backdrop-blur-lg rounded-full py-3 md:py-4 px-6 md:px-8 xl:px-16 2xl:px-24 inline-flex items-center gap-3 md:gap-4 border border-white/10 shadow-2xl">
                <Sparkle className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
                <span className="text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-cinzel font-semibold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                  7 jours d'essai gratuit
                </span>
                <Sparkle className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8 xl:gap-12 2xl:gap-16">
              {[
                {
                  icon: <Sun className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Guidance Quotidienne",
                  description: "Recevez chaque matin un message inspirant et personnalisé, basé sur votre thème astral unique, pour avancer sereinement dans votre vie."
                },
                {
                  icon: <Moon className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Thème Astral Détaillé",
                  description: "Profitez d'analyses astrologiques approfondies pour comprendre l'influence des planètes sur votre parcours et révéler les clés de votre bien-être."
                },
                {
                  icon: <Compass className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Navigation Céleste",
                  description: "Prenez des décisions éclairées grâce à des conseils personnalisés, en harmonie avec les énergies cosmiques de votre carte du ciel."
                },
                {
                  icon: <Clock className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Timing Parfait",
                  description: "Identifiez les moments les plus propices pour vos projets importants, grâce à une guidance adaptée à votre profil astral et à l'énergie du jour."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <InteractiveCard
                    className="p-4 md:p-6 xl:p-10 2xl:p-14 h-full transition-transform duration-300 hover:scale-105 hover:shadow-cosmic hover:border-primary/40 relative group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4"
                      >
                        <div className="text-primary">{feature.icon}</div>
                      </motion.div>
                      <h3 className="text-lg md:text-xl font-cinzel font-semibold text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-300">{feature.description}</p>
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkle className="w-5 h-5 text-yellow-300 animate-float" />
                    </motion.div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}