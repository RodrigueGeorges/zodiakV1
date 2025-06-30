import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Bell, LogOut, Edit2, Check, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/hooks/useAuth.tsx';
import { supabase } from '../lib/supabase';
import StarryBackground from '../components/StarryBackground';
import InteractiveCard from '../components/InteractiveCard';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import LoadingScreen from '../components/LoadingScreen';
import { DESIGN_TOKENS } from '../lib/constants/design';
import { AstrologyService } from '../lib/astrology';

// Animations pour les transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, y: -2 }
};

const formVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 }
};

export function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile, isLoading: isAuthLoading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    daily_guidance_sms_enabled: true,
    guidance_sms_time: '08:00',
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Calcul des jours restants d'essai
  const daysUntilTrialEnd = profile?.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        birth_time: profile.birth_time || '',
        birth_place: profile.birth_place || '',
        daily_guidance_sms_enabled: profile.daily_guidance_sms_enabled ?? true,
        guidance_sms_time: profile.guidance_sms_time || '08:00',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) throw new Error('Non authentifié');

      let finalProfileData = { ...formData };

      // Si le thème natal n'existe pas et que les infos sont présentes, on le calcule
      if (!profile?.natal_chart && finalProfileData.birth_date && finalProfileData.birth_time && selectedPlace) {
        try {
          const birthData = {
            date_of_birth: finalProfileData.birth_date,
            time_of_birth: finalProfileData.birth_time,
            location: `${selectedPlace._geoloc.lat},${selectedPlace._geoloc.lng}`,
          };
          const natalChart = await AstrologyService.calculateNatalChart(birthData);
          (finalProfileData as any).natal_chart = natalChart;
        } catch (chartError) {
          console.error("Erreur de calcul du thème natal:", chartError);
          setError("Impossible de calculer le thème natal. Vérifiez les données de naissance.");
          // On ne bloque pas la sauvegarde du reste du profil
        }
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...finalProfileData,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      await refreshProfile();
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Non renseigné';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    if (!time) return 'Non renseigné';
    return time;
  };

  const renderStatus = () => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-red-400/30"
        >
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-green-400/30"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (!user || !profile) {
    return <LoadingScreen />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-cosmic-900 relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StarryBackground />
      {renderStatus()}

      <div className="container mx-auto px-4 md:px-8 xl:px-12 2xl:px-24 py-12">
        <div className="max-w-4xl xl:max-w-6xl 2xl:max-w-screen-xl mx-auto">
          <motion.div 
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Colonne principale */}
              <div className="xl:col-span-2 space-y-6">
                {/* Informations personnelles */}
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: 0.1 }}
                >
                  <InteractiveCard className="p-6 xl:p-10 2xl:p-14 relative overflow-hidden">
                    {/* Effet de fond subtil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                          <User className="w-6 h-6 text-gray-900" />
                        </div>
                        <h2 className="text-xl font-semibold font-cinzel bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                          Informations personnelles
                        </h2>
                        {!editMode && (
                          <motion.button
                            onClick={() => setEditMode(true)}
                            className="ml-auto p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-primary/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        )}
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {editMode ? (
                          <motion.div 
                            key="edit"
                            variants={formVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Nom complet
                                </label>
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className={DESIGN_TOKENS.components.input.base}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Téléphone
                                </label>
                                <input
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  className={DESIGN_TOKENS.components.input.base}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Date de naissance
                                </label>
                                <input
                                  type="date"
                                  value={formData.birth_date}
                                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                  className={DESIGN_TOKENS.components.input.base}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Heure de naissance
                                </label>
                                <input
                                  type="time"
                                  value={formData.birth_time}
                                  onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                                  className={DESIGN_TOKENS.components.input.base}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Lieu de naissance
                              </label>
                              <PlaceAutocomplete
                                value={formData.birth_place}
                                onChange={(value, place) => {
                                  setFormData({ ...formData, birth_place: value });
                                  setSelectedPlace(place);
                                }}
                                placeholder="Lieu de naissance"
                              />
                            </div>
                            
                            <motion.div 
                              className="flex justify-end gap-3 mt-6"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <motion.button 
                                onClick={() => setEditMode(false)} 
                                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition-all duration-200"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Annuler
                              </motion.button>
                              <motion.button 
                                onClick={handleSave} 
                                disabled={saving} 
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-black font-semibold hover:opacity-90 transition-all duration-200 shadow-lg flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {saving ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    Sauvegarde...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    Sauvegarder
                                  </>
                                )}
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="view"
                            variants={formVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-sm text-gray-400 mb-1">Nom complet</p>
                                  <p className="text-lg text-white font-medium">{profile?.name || 'Non renseigné'}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-sm text-gray-400 mb-1">Téléphone</p>
                                  <p className="text-lg text-white font-medium">{profile?.phone || 'Non renseigné'}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-sm text-gray-400 mb-1">Date de naissance</p>
                                  <p className="text-lg text-white font-medium">{formatDate(profile?.birth_date || '')}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-sm text-gray-400 mb-1">Heure de naissance</p>
                                  <p className="text-lg text-white font-medium">{formatTime(profile?.birth_time || '')}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-sm text-gray-400 mb-1">Lieu de naissance</p>
                              <p className="text-lg text-white font-medium">{profile?.birth_place || 'Non renseigné'}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </InteractiveCard>
                </motion.div>

                {/* Notifications */}
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: 0.2 }}
                >
                  <InteractiveCard className="p-6 xl:p-10 2xl:p-14 relative overflow-hidden">
                    {/* Effet de fond subtil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                          <Bell className="w-6 h-6 text-gray-900" />
                        </div>
                        <h2 className="text-xl font-semibold font-cinzel bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                          Notifications
                        </h2>
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {editMode ? (
                          <motion.div 
                            key="edit-notifications"
                            variants={formVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                              <label htmlFor="sms-enabled" className="text-gray-300 font-medium">
                                Guidance par SMS quotidienne
                              </label>
                              <motion.button
                                id="sms-enabled"
                                onClick={() =>
                                  setFormData(prev => ({ ...prev, daily_guidance_sms_enabled: !prev.daily_guidance_sms_enabled }))
                                }
                                className={cn(
                                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                                  formData.daily_guidance_sms_enabled ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-600'
                                )}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.span
                                  className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0"
                                  animate={{
                                    x: formData.daily_guidance_sms_enabled ? 20 : 0
                                  }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </motion.button>
                            </div>
                            
                            <AnimatePresence>
                              {formData.daily_guidance_sms_enabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                                >
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Heure d'envoi
                                  </label>
                                  <input
                                    type="time"
                                    value={formData.guidance_sms_time}
                                    onChange={(e) => setFormData({ ...formData, guidance_sms_time: e.target.value })}
                                    className={DESIGN_TOKENS.components.input.base}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="view-notifications"
                            variants={formVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-4"
                          >
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400">Guidance par SMS</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  profile.daily_guidance_sms_enabled 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                  {profile.daily_guidance_sms_enabled ? 'Activée' : 'Désactivée'}
                                </span>
                              </div>
                            </div>
                            
                            {profile.daily_guidance_sms_enabled && (
                              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-gray-400">Heure d'envoi</p>
                                  <p className="text-lg text-white font-medium">{formatTime(profile.guidance_sms_time)}</p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </InteractiveCard>
                </motion.div>
              </div>

              {/* Colonne de droite - Uniquement abonnement et déconnexion */}
              <div className="space-y-6">
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: 0.3 }}
                >
                  <InteractiveCard className="p-6 relative overflow-hidden">
                    {/* Effet de fond subtil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                          <CreditCard className="w-6 h-6 text-gray-900" />
                        </div>
                        <h3 className="text-lg font-semibold font-cinzel bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                          Abonnement
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <span className="text-sm text-gray-400">Statut</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            profile.subscription_status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            profile.subscription_status === 'trial' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {profile.subscription_status === 'active' ? 'Actif' :
                             profile.subscription_status === 'trial' ? 'Essai' : 'Expiré'}
                          </span>
                        </div>
                        {profile.subscription_status === 'trial' && (
                          <motion.div 
                            className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="text-sm text-gray-400">Jours restants</span>
                            <span className="text-sm font-semibold text-yellow-400">
                              {daysUntilTrialEnd} jours
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                </motion.div>
                
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  transition={{ delay: 0.4 }}
                >
                  <InteractiveCard className="p-6 relative overflow-hidden">
                    {/* Effet de fond subtil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 opacity-50" />
                    
                    <div className="relative z-10">
                      <motion.button
                        onClick={handleLogout}
                        className="w-full py-3 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 flex items-center gap-3 border border-red-500/30 hover:border-red-500/50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Déconnexion</span>
                      </motion.button>
                    </div>
                  </InteractiveCard>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;