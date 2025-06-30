import { useState, forwardRef } from 'react';
import { Phone, Loader2 } from 'lucide-react';
import { BrevoService } from '../lib/services/BrevoService';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { MagicButtonX } from './MagicButtonX';

interface PhoneAuthProps {
  onSuccess?: (userId: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const PhoneAuth = forwardRef<HTMLInputElement, PhoneAuthProps>(function PhoneAuth(props, ref) {
  const { onSuccess, inputRef } = props;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Ajout de la fonction de formatage international
  function formatPhoneInternational(phone: string): string {
    // Pour la France : remplace 0 initial par +33
    if (phone.startsWith('0') && phone.length === 10) {
      return '+33' + phone.slice(1);
    }
    // Si déjà au format international, retourne tel quel
    if (phone.startsWith('+') && phone.length >= 11) {
      return phone;
    }
    // Sinon, retourne vide
    return '';
  }

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Formatage du numéro au format international
      const formattedPhone = formatPhoneInternational(phoneNumber);
      if (!formattedPhone) {
        setError('Numéro de téléphone invalide. Utilisez le format +33612345678 ou 06XXXXXXXX');
        setIsLoading(false);
        return;
      }
      // Générer un code de vérification à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Envoyer le code via Brevo
      await BrevoService.sendVerificationSMS(formattedPhone, code);
      
      // Stocker le code temporairement (à remplacer par une solution plus sécurisée)
      localStorage.setItem('tempVerificationCode', code);
      
      setIsCodeSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const storedCode = localStorage.getItem('tempVerificationCode');
      const formattedPhone = formatPhoneInternational(phoneNumber);
      if (verificationCode === storedCode && formattedPhone) {
        // Appel à Supabase Auth pour authentifier l'utilisateur
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone
        });
        if (error) {
          setError('Erreur lors de la connexion : ' + error.message);
          setIsLoading(false);
          return;
        }
        localStorage.removeItem('tempVerificationCode');
        // TODO: Mettre à jour l'état global d'authentification ou rediriger
      } else {
        setError('Code de vérification incorrect');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7]">Authentification par SMS</h2>

      {!isCodeSent ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
              Numéro de téléphone
            </label>
            <input
              ref={inputRef}
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+33612345678"
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'bg-white/10 border border-white/20',
                'text-white placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-[#F5CBA7] focus:border-transparent'
              )}
            />
          </div>

          <MagicButtonX
            onClick={handleSendCode}
            disabled={isLoading || !phoneNumber}
            className={cn(
              'w-full py-3 px-4 rounded-lg',
              'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
              'text-gray-900 font-semibold',
              'flex items-center justify-center gap-2',
              'transition-all duration-200',
              'hover:opacity-90',
              'focus:outline-none focus:ring-2 focus:ring-[#F5CBA7] focus:ring-opacity-50',
              (isLoading || !phoneNumber) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Envoyer le code
              </>
            )}
          </MagicButtonX>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
              Code de vérification
            </label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'bg-white/10 border border-white/20',
                'text-white placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-[#F5CBA7] focus:border-transparent'
              )}
            />
          </div>

          <MagicButtonX
            onClick={handleVerifyCode}
            disabled={isLoading || !verificationCode}
            className={cn(
              'w-full py-3 px-4 rounded-lg',
              'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
              'text-gray-900 font-semibold',
              'flex items-center justify-center gap-2',
              'transition-all duration-200',
              'hover:opacity-90',
              'focus:outline-none focus:ring-2 focus:ring-[#F5CBA7] focus:ring-opacity-50',
              (isLoading || !verificationCode) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier le code'
            )}
          </MagicButtonX>

          <button
            onClick={() => setIsCodeSent(false)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Modifier le numéro
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 text-red-400 rounded-lg" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
});