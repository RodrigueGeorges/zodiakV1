import React, { forwardRef, useState, useEffect } from 'react';
import { Phone, Loader2 } from 'lucide-react';
import { BrevoService } from '../lib/services/BrevoService';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ButtonZodiak } from './ButtonZodiak';
import { toast } from 'react-hot-toast';

interface PhoneAuthProps {
  onSuccess?: (phone: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const PhoneAuth = forwardRef<HTMLInputElement, PhoneAuthProps>(function PhoneAuth(props, ref) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les caractères non numériques
    const cleaned = value.replace(/\D/g, '');
    
    // Limiter à 10 chiffres
    const limited = cleaned.slice(0, 10);
    
    // Formater en 06 XX XX XX XX
    if (limited.length === 0) return '';
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('06');
  };

  const sendVerificationCode = async () => {
    if (!validatePhone(phone)) {
      toast.error('Veuillez entrer un numéro de téléphone valide (06 XX XX XX XX)');
      return;
    }

    setIsLoading(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanedPhone,
          message: `Votre code de vérification Zodiak est : ${generateCode()}. Valide pendant 10 minutes.`
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du code');
      }

      setIsCodeSent(true);
      setCountdown(60);
      toast.success('Code de vérification envoyé !');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Erreur lors de l\'envoi du code. Veuillez réessayer.');
      props.onError?.(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    // Générer un code à 6 chiffres
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Veuillez entrer le code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation de vérification - en production, vérifier avec le serveur
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cleanedPhone = phone.replace(/\D/g, '');
      props.onSuccess?.(cleanedPhone);
      toast.success('Numéro de téléphone vérifié avec succès !');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Code incorrect. Veuillez réessayer.');
      props.onError?.(error instanceof Error ? error.message : 'Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = () => {
    if (countdown > 0) return;
    sendVerificationCode();
  };

  return (
    <div className={`space-y-4 ${props.className || ''}`}>
      {!isCodeSent ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Numéro de téléphone
            </label>
            <input
              ref={ref}
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="06 XX XX XX XX"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={14}
            />
          </div>
          <ButtonZodiak
            onClick={sendVerificationCode}
            disabled={!validatePhone(phone) || isLoading}
            className="w-full"
          >
            {isLoading ? 'Envoi...' : 'Envoyer le code'}
          </ButtonZodiak>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Code de vérification
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>
          <ButtonZodiak
            onClick={verifyCode}
            disabled={code.length !== 6 || isLoading}
            className="w-full"
          >
            {isLoading ? 'Vérification...' : 'Vérifier le code'}
          </ButtonZodiak>
          <div className="text-center">
            <button
              onClick={resendCode}
              disabled={countdown > 0}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {countdown > 0 
                ? `Renvoyer le code dans ${countdown}s` 
                : 'Renvoyer le code'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default PhoneAuth;