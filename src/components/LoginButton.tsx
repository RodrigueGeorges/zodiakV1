import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, Loader2, User } from 'lucide-react';
import { cn } from '../lib/utils';
import InteractiveCard from './InteractiveCard';
import Toast from './Toast';
import { useAuth } from '../lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SuperAuthService } from '../lib/auth';
import { StorageService } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { ButtonZodiak } from './ButtonZodiak';
import PhoneAuth from './PhoneAuth';

interface LoginButtonProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

function LoginButton({ 
  showToast, 
  className = '', 
  variant = 'default',
  size = 'md'
}: LoginButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [authMode, setAuthMode] = useState<'sms' | 'email'>('sms');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = SuperAuthService.getCurrentUser();
        setIsAuthenticated(!!currentUser);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const unsubscribe = SuperAuthService.subscribe((auth) => {
      setIsAuthenticated(auth.isAuthenticated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Vérifier l'état de connexion actuel
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          showToast('Connexion réussie !', 'success');
        } else if (event === 'SIGNED_OUT') {
          showToast('Déconnexion réussie', 'success');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [showToast]);

  const handleSuccess = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && profile) {
        StorageService.saveProfile(profile);
        console.log('Profil sauvegardé dans le localStorage:', profile);
        setIsOpen(false);
        showToast('Connexion réussie', 'success');
        navigate(`/guidance/${userId}`);
      } else {
        setIsOpen(false);
        showToast('Profil non trouvé, veuillez compléter votre inscription.', 'info');
        navigate('/register');
      }
      console.log('Session dans le localStorage:', localStorage.getItem('auth_session'));
    } catch (error) {
      showToast('Erreur lors de la connexion', 'error');
      console.error('Error handling auth success:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        showToast('Erreur lors de la déconnexion', 'error');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Erreur lors de la déconnexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError(null);
    try {
      if (isSignUp) {
        // Inscription
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error || !data.user) {
          setEmailError(error?.message || 'Erreur lors de l\'inscription');
          setIsLoading(false);
          return;
        }
        setIsOpen(false);
        showToast('Inscription réussie, veuillez compléter votre profil.', 'success');
        navigate('/register');
        return;
      } else {
        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) {
          setEmailError(error?.message || 'Erreur de connexion');
          setIsLoading(false);
          return;
        }
        // Récupérer le profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (!profileError && profile) {
          StorageService.saveProfile(profile);
          setIsOpen(false);
          showToast('Connexion réussie', 'success');
          navigate(`/guidance/${data.user.id}`);
        } else {
          setIsOpen(false);
          showToast('Profil non trouvé, veuillez compléter votre inscription.', 'info');
          navigate('/register');
        }
      }
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Login error:', error);
        showToast('Erreur lors de la connexion', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Erreur lors de la connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {user ? 'Déconnexion...' : 'Connexion...'}
        </>
      );
    }

    if (user) {
      return (
        <>
          <User className="w-4 h-4" />
          {user.email ? user.email.split('@')[0] : 'Profil'}
        </>
      );
    }

    return (
      <>
        <LogIn className="w-4 h-4" />
        Se connecter
      </>
    );
  };

  const getButtonStyles = () => {
    const baseStyles = 'flex items-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const variantStyles = {
      default: 'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373] text-gray-900 hover:opacity-90 focus:ring-[#F5CBA7]',
      outline: 'border border-[#F5CBA7] text-[#F5CBA7] hover:bg-[#F5CBA7] hover:text-gray-900 focus:ring-[#F5CBA7]',
      ghost: 'text-[#F5CBA7] hover:bg-[#F5CBA7]/10 focus:ring-[#F5CBA7]'
    };

    return cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    );
  };

  if (isLoading) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-end safe-area-inset-top">
        <ButtonZodiak
          onClick={user ? handleLogout : handleLogin}
          disabled={isLoading}
          className={getButtonStyles()}
        >
          {getButtonContent()}
        </ButtonZodiak>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(calc(100%-2rem),28rem)] max-h-[calc(100vh-4rem)] overflow-auto overscroll-contain"
              role="dialog"
              aria-modal="true"
            >
              <InteractiveCard className="relative overflow-hidden">
                <div className="p-4 sm:p-6 relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 -m-2 touch-manipulation"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <h2 className="text-lg sm:text-2xl font-cinzel font-bold mb-6 text-center">
                    <span className="bg-gradient-to-r from-primary via-secondary to-primary text-transparent bg-clip-text animate-cosmic-text">
                      Connexion
                    </span>
                  </h2>

                  <div className="flex justify-center mb-4 gap-4">
                    <button
                      className={cn('px-3 py-1 rounded', authMode === 'sms' ? 'bg-primary text-black' : 'bg-white/10 text-white')}
                      onClick={() => { setAuthMode('sms'); setIsSignUp(false); }}
                    >SMS</button>
                    <button
                      className={cn('px-3 py-1 rounded', authMode === 'email' ? 'bg-primary text-black' : 'bg-white/10 text-white')}
                      onClick={() => setAuthMode('email')}
                    >Email</button>
                  </div>

                  {authMode === 'sms' ? (
                    <PhoneAuth
                      onSuccess={handleSuccess}
                      ref={inputRef}
                    />
                  ) : (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
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
                      {emailError && <div className="text-red-400 text-sm mb-2">{emailError}</div>}
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-primary text-black font-semibold hover:bg-secondary transition-colors"
                        disabled={isLoading}
                      >
                        {isSignUp ? 'Créer un compte' : 'Se connecter'}
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
                </div>
              </InteractiveCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default LoginButton;