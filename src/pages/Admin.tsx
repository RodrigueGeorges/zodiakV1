import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trash2, Shield, CreditCard, Calendar, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { StarryBackground } from '../components/StarryBackground';
import { Logo } from '../components/Logo';
import { InteractiveCard } from '../components/InteractiveCard';
import type { Profile } from '../lib/types/supabase';

export function Admin() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'trial' | 'active' | 'expired'>('all');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleUpdateSubscription = async (userId: string, status: 'trial' | 'active' | 'expired') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(search.toLowerCase()) ||
      profile.phone.includes(search);
      
    const matchesFilter = 
      filter === 'all' || 
      profile.subscription_status === filter;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'text-primary';
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-900 flex items-center justify-center">
        <StarryBackground />
        <div className="text-center">
          <Logo />
          <div className="mt-4 w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-900 relative">
      <StarryBackground />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="mb-8">
              <Logo />
            </div>
            <h1 className="text-3xl font-cinzel font-bold mb-4 flex items-center justify-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary text-transparent bg-clip-text">
                Dashboard Admin
              </span>
            </h1>
          </motion.div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <InteractiveCard className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg',
                    'bg-white/5 backdrop-blur-lg',
                    'border border-white/10',
                    'text-white placeholder-gray-400',
                    'focus:border-primary focus:ring-2 focus:ring-primary/50',
                    'transition-all duration-200'
                  )}
                />
              </div>

              <div className="flex gap-2">
                {(['all', 'trial', 'active', 'expired'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      'px-4 py-2 rounded-lg transition-colors',
                      filter === status
                        ? 'bg-primary text-gray-900'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {status === 'all' ? 'Tous' :
                     status === 'trial' ? 'Essai' :
                     status === 'active' ? 'Actifs' : 'Expirés'}
                  </button>
                ))}
              </div>
            </div>
          </InteractiveCard>

          <div className="space-y-4">
            {filteredProfiles.map(profile => (
              <InteractiveCard key={profile.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold">{profile.name}</span>
                      </div>
                      <p className="text-gray-400">{profile.phone}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span className={cn(
                          'font-medium',
                          getStatusColor(profile.subscription_status)
                        )}>
                          {profile.subscription_status === 'trial' ? 'Période d\'essai' :
                           profile.subscription_status === 'active' ? 'Abonné' : 'Expiré'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Expire le {formatDate(profile.trial_ends_at)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Inscrit le {formatDate(profile.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Dernière guidance: {profile.last_guidance_sent 
                            ? formatDate(profile.last_guidance_sent)
                            : 'Jamais'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateSubscription(profile.id, 'trial')}
                        className={cn(
                          'px-3 py-1 rounded text-sm',
                          profile.subscription_status === 'trial'
                            ? 'bg-primary text-gray-900'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        )}
                      >
                        Essai
                      </button>
                      <button
                        onClick={() => handleUpdateSubscription(profile.id, 'active')}
                        className={cn(
                          'px-3 py-1 rounded text-sm',
                          profile.subscription_status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        )}
                      >
                        Activer
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="px-3 py-1 rounded text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </InteractiveCard>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-gray-400">
            Total: {filteredProfiles.length} utilisateur{filteredProfiles.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;