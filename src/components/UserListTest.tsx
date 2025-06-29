import { useState, useEffect } from 'react';
import { User, Trash2, Loader2 } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { InteractiveCard } from './InteractiveCard';
import type { Profile } from '../lib/types/supabase';

export function UserListTest() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const allProfiles = await StorageService.getAllProfiles();
      setProfiles(allProfiles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des profils';
      setError(errorMessage);
      console.error('Error loading profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        StorageService.clearUserData(userId);
        await loadProfiles(); // Recharger la liste
      } catch (err) {
        console.error('Error deleting profile:', err);
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <InteractiveCard className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7] flex items-center gap-2">
        <User className="w-6 h-6" />
        Utilisateurs Enregistrés
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      ) : profiles.length === 0 ? (
        <p className="text-gray-400 text-center py-4">
          Aucun utilisateur enregistré
        </p>
      ) : (
        <div className="space-y-4">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="bg-white/5 rounded-lg p-4 relative group"
            >
              <button
                onClick={() => handleDeleteProfile(profile.id)}
                className="absolute right-2 top-2 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid gap-2">
                <div>
                  <span className="text-gray-400">Nom:</span>
                  <span className="ml-2 text-white">{profile.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Téléphone:</span>
                  <span className="ml-2 text-white">{profile.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400">Statut:</span>
                  <span className="ml-2">
                    {profile.subscription_status === 'trial' ? (
                      <span className="text-primary">Période d'essai</span>
                    ) : (
                      <span className="text-green-400">Abonné</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Créé le:</span>
                  <span className="ml-2 text-white">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Dernière guidance:</span>
                  <span className="ml-2 text-white">
                    {profile.last_guidance_sent 
                      ? formatDate(profile.last_guidance_sent)
                      : 'Jamais'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-400">
        Total: {profiles.length} utilisateur{profiles.length > 1 ? 's' : ''}
      </p>
    </InteractiveCard>
  );
}