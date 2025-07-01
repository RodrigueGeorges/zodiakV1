import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveCard from '../components/InteractiveCard';
import PhoneAuth from '../components/PhoneAuth';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';
import StarryBackground from '../components/StarryBackground';
import { cn } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'sms' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.log('Tentative de connexion avec:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        setError(error.message);
        return;
      }
      
      if (data.user) {
        console.log('Connexion réussie pour:', data.user.email);
        // La redirection est gérée globalement par useAuth
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <StarryBackground />
      <div className="container mx-auto px-4 md:px-8 xl:px-12 2xl:px-24 py-8 md:py-12 lg:py-16">
        <div className="max-w-md mx-auto mt-16">
          <InteractiveCard className="p-6 md:p-8 xl:p-10 2xl:p-16">
            <div className="mb-8 text-center">
              <Logo />
              <h2 className="text-2xl font-cinzel font-bold mt-4 mb-2">
                Connexion
              </h2>
            </div>
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
                {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary text-black font-semibold hover:bg-secondary transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                    onClick={() => {
                      if (email) {
                        supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/login`
                        }).then(() => {
                          alert('Email de réinitialisation envoyé !');
                        }).catch(err => {
                          console.error('Erreur envoi email:', err);
                        });
                      } else {
                        alert('Veuillez d\'abord entrer votre email');
                      }
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            )}
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-400">Pas encore de compte ?{' '}
                <button type="button" className="underline text-primary" onClick={() => navigate('/register')}>Créer un compte</button>
              </span>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </div>
  );
} 