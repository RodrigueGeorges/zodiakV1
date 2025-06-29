import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, Sparkle, Moon, Sun, Compass, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { PhoneAuth } from '../components/PhoneAuth';
import { Logo } from '../components/Logo';
import { StarryBackground } from '../components/StarryBackground';
import { InteractiveCard } from '../components/InteractiveCard';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'sms' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

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
              className="mb-6 md:mb-8"
            >
              <Logo />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto mb-8 md:mb-12"
            >
              <div className="relative mb-4 md:mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl 2xl:text-9xl font-bold font-cinzel tracking-wider">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 blur-2xl bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />
                    <span className="relative bg-gradient-to-r from-primary via-secondary to-primary text-transparent bg-clip-text">
                      ZODIAK
                    </span>
                  </span>
                </h1>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 md:mt-4"
                >
                  <p className="text-lg sm:text-xl md:text-3xl xl:text-4xl 2xl:text-5xl text-gray-300 font-cinzel">
                    Votre boussole céleste au quotidien
                  </p>
                </motion.div>
              </div>
            </motion.div>

            <div className="max-w-md mx-auto mb-6 md:mb-8">
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
                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-primary text-black font-semibold hover:bg-secondary transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Chargement...' : (isSignUp ? 'Créer un compte' : 'Se connecter')}
                    </button>
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
            </div>

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
                  description: "Recevez chaque jour des prédictions personnalisées basées sur votre thème astral unique."
                },
                {
                  icon: <Moon className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Thème Astral Détaillé",
                  description: "Découvrez l'influence des planètes sur votre vie grâce à une analyse approfondie."
                },
                {
                  icon: <Compass className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Navigation Céleste",
                  description: "Prenez des décisions éclairées en harmonie avec les énergies cosmiques."
                },
                {
                  icon: <Clock className="w-5 h-5 md:w-6 md:h-6" />,
                  title: "Timing Parfait",
                  description: "Identifiez les moments propices pour vos projets importants."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <InteractiveCard className="p-4 md:p-6 xl:p-10 2xl:p-14 h-full">
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4"
                      >
                        <div className="text-primary">{feature.icon}</div>
                      </motion.div>
                      <h3 className="text-lg md:text-xl font-cinzel font-semibold text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-300">{feature.description}</p>
                    </div>
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