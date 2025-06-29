import { useState } from 'react';
import { motion } from 'framer-motion';
import { AstrologyTest } from '../components/AstrologyTest';
import { SMSTest } from '../components/SMSTest';
import { UserListTest } from '../components/UserListTest';
import { StarryBackground } from '../components/StarryBackground';
import { Logo } from '../components/Logo';
import { SMSService } from '../lib/sms';
import { AuthService } from '../lib/auth';
import { StorageService } from '../lib/storage';
import { cn } from '../lib/utils';
import { InteractiveCard } from '../components/InteractiveCard';
import { PlaceSearchTest } from '../components/PlaceSearchTest';

export function Test() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string } | null>(null);
  const [storageResult, setStorageResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestGuidance = async () => {
    setSending(true);
    setResult(null);
    
    try {
      const testUserId = 'test-user-' + Date.now();
      const response = await SMSService.sendGuidanceLink('0630071719', testUserId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setResult({
        success: true,
        message: 'SMS envoyé avec succès ! Vérifiez votre téléphone.'
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message'
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestAuth = async () => {
    setAuthResult(null);
    try {
      // Test phone auth
      const phone = '0612345678';
      const authResponse = await AuthService.signIn(phone);
      
      if (!authResponse.success) {
        throw new Error(authResponse.error);
      }

      setAuthResult({
        success: true,
        message: 'Authentification réussie'
      });
    } catch (error) {
      setAuthResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur d\'authentification'
      });
    }
  };

  const handleTestStorage = async () => {
    setStorageResult(null);
    try {
      // Test profile storage
      const testProfile = {
        id: 'test-' + Date.now(),
        name: 'Test User',
        phone: '0612345678',
        birth_date: '1990-01-01',
        birth_time: '12:00',
        birth_place: 'Paris',
        natal_chart: {},
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial' as const,
        last_guidance_sent: null,
        daily_guidance_sms_enabled: true,
        guidance_sms_time: '08:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await StorageService.saveProfile(testProfile);
      const savedProfile = StorageService.getProfile(testProfile.id);

      if (!savedProfile) {
        throw new Error('Profile not saved correctly');
      }

      setStorageResult({
        success: true,
        message: 'Test de stockage réussi'
      });
    } catch (error) {
      setStorageResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur de stockage'
      });
    }
  };

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
            <div className="mb-8">
              <Logo />
            </div>
            <h1 className="text-3xl font-cinzel font-bold mb-4">
              <span className="bg-gradient-to-r from-[#F5CBA7] via-[#D4A373] to-[#F5CBA7] text-transparent bg-clip-text animate-cosmic-text">
                Tests des Services
              </span>
            </h1>
            <p className="text-gray-300">
              Cette page permet de tester les différents workflows de l'application
            </p>
          </motion.div>

          <div className="space-y-8">
            <InteractiveCard className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7]">Test d'Authentification</h2>
              <button
                onClick={handleTestAuth}
                className={cn(
                  'w-full py-3 px-4 rounded-lg',
                  'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
                  'text-gray-900 font-semibold',
                  'transition-all duration-200',
                  'hover:opacity-90'
                )}
              >
                Tester l'authentification
              </button>
              {authResult && (
                <div className={cn(
                  'mt-4 p-4 rounded-lg',
                  authResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {authResult.message}
                </div>
              )}
            </InteractiveCard>

            <InteractiveCard className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7]">Test de Stockage</h2>
              <button
                onClick={handleTestStorage}
                className={cn(
                  'w-full py-3 px-4 rounded-lg',
                  'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
                  'text-gray-900 font-semibold',
                  'transition-all duration-200',
                  'hover:opacity-90'
                )}
              >
                Tester le stockage
              </button>
              {storageResult && (
                <div className={cn(
                  'mt-4 p-4 rounded-lg',
                  storageResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {storageResult.message}
                </div>
              )}
            </InteractiveCard>

            <UserListTest />
            
            <InteractiveCard className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7]">Test de Guidance</h2>
              <button
                onClick={handleTestGuidance}
                disabled={sending}
                className={cn(
                  'w-full py-3 px-4 rounded-lg',
                  'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
                  'text-gray-900 font-semibold',
                  'flex items-center justify-center gap-2',
                  'transition-all duration-200',
                  'hover:opacity-90',
                  sending && 'opacity-50 cursor-not-allowed'
                )}
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  'Tester la guidance'
                )}
              </button>
              {result && (
                <div className={cn(
                  'mt-4 p-4 rounded-lg',
                  result.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {result.message}
                </div>
              )}
            </InteractiveCard>

            <AstrologyTest />
            <SMSTest />

            <PlaceSearchTest />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Test;