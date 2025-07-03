import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth.tsx';
import { supabase } from '../lib/supabase';
import InteractiveCard from '../components/InteractiveCard';
import Logo from '../components/Logo';
import StarryBackground from '../components/StarryBackground';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import { getCoordsFromPlaceString, type Place } from '../lib/places';
import { AstrologyService } from '../lib/astrology';
import type { NatalChart } from '../lib/astrology';

export default function RegisterComplete() {
  const navigate = useNavigate();
  const { user, isLoading, refreshProfile, profile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    unknownTime: false,
    birthPlace: '',
    birthPlaceObj: null as Place | null,
    guidanceTime: '08:00',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placeStatus, setPlaceStatus] = useState({ loading: false, error: null as string | null, valid: false });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
    // Pré-fill form with existing profile data
    if (user && profile) {
      setForm(prevForm => ({
        ...prevForm,
        name: profile.name || '',
        phone: profile.phone || '',
        birthDate: profile.birth_date || '',
        birthTime: profile.birth_time || '',
        birthPlace: profile.birth_place || '',
        guidanceTime: profile.guidance_sms_time || '08:00',
      }));
      // If a birth place is already set, consider it valid
      if (profile.birth_place) {
        setPlaceStatus({ loading: false, error: null, valid: true });
      }
    }
  }, [isLoading, user, navigate, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError('Veuillez remplir tous les champs correctement.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!user) {
        throw new Error("Utilisateur non trouvé. Veuillez vous reconnecter.");
      }

      const birthTime = form.unknownTime ? '12:00' : form.birthTime;
      const [hour, minute] = birthTime.split(':').map(Number);
      
      const coords = await getCoordsFromPlaceString(form.birthPlace);

      if (!coords) {
        throw new Error("Impossible de récupérer les coordonnées du lieu de naissance.");
      }

      const birthData = {
        date_of_birth: form.birthDate,
        time_of_birth: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        location: `${coords.latitude},${coords.longitude}`
      };

      const natalChart = await AstrologyService.calculateNatalChart(birthData);

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: form.name,
        phone: form.phone,
        birth_date: form.birthDate,
        birth_time: form.unknownTime ? null : form.birthTime,
        birth_place: form.birthPlace,
        natal_chart: natalChart as NatalChart,
        guidance_sms_time: form.guidanceTime,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      await refreshProfile();
      
      setSuccess('Profil complété avec succès ! Redirection...');
      
      setTimeout(() => {
        navigate('/guidance?tab=natal_chart', { replace: true });
      }, 1000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      form.name.trim() &&
      form.phone.trim() &&
      form.birthDate.trim() &&
      (form.birthTime.trim() || form.unknownTime) &&
      placeStatus.valid
    );
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-cosmic-900 text-white">Chargement...</div>;
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      <StarryBackground />
      <div className="container mx-auto px-4 md:px-8 xl:px-12 2xl:px-24 py-8 md:py-12 lg:py-16">
        <div className="max-w-md mx-auto mt-16">
          <InteractiveCard className="p-6 md:p-8 xl:p-10 2xl:p-16">
            <div className="mb-8 text-center">
              <Logo />
              <h2 className="text-2xl font-cinzel font-bold mt-4 mb-2">
                Complétez votre profil
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                  placeholder="+33612345678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Heure de naissance</label>
                <input
                  type="time"
                  value={form.birthTime}
                  onChange={e => setForm({ ...form, birthTime: e.target.value, unknownTime: false })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                  placeholder="HH:mm"
                  disabled={form.unknownTime}
                />
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="unknownTime"
                    checked={form.unknownTime}
                    onChange={e => setForm({ ...form, unknownTime: e.target.checked, birthTime: '' })}
                    className="mr-2"
                  />
                  <label htmlFor="unknownTime" className="text-sm text-gray-400">Je ne connais pas l'heure</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Lieu de naissance</label>
                <PlaceAutocomplete
                  value={form.birthPlace}
                  onChange={(value, place) => setForm({ ...form, birthPlace: value, birthPlaceObj: place })}
                  placeholder="Ville, Pays (ex: Paris, France)"
                  onStatusChange={setPlaceStatus}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Heure d'envoi de la guidance</label>
                <input
                  type="time"
                  value={form.guidanceTime}
                  onChange={e => setForm({ ...form, guidanceTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                  required
                />
                <span className="text-xs text-gray-400">Par défaut : 08:00</span>
              </div>
              {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
              {success && <div className="text-green-400 text-sm mb-2">{success}</div>}
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-primary text-black font-semibold hover:bg-secondary transition-colors"
                disabled={loading || !isFormValid()}
              >
                Compléter le profil
              </button>
            </form>
          </InteractiveCard>
        </div>
      </div>
    </div>
  );
} 