import { useState } from 'react';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { SMSService } from '../lib/sms';
import { cn } from '../lib/utils';
import { DeliveryStatus } from './DeliveryStatus';
import { AnimatedButtonZ } from './AnimatedButtonZ';

export function SMSTest() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);
  const [phone, setPhone] = useState('');

  const handleTestSMS = async () => {
    setSending(true);
    setResult(null);
    
    try {
      console.log('Sending SMS to:', phone);
      const response = await SMSService.sendSMS({
        to: phone,
        message: '✨ Test de Zodiak avec Vonage : Votre connexion aux astres fonctionne parfaitement ! 🌟',
        sender: 'Zodiak'
      });
      
      console.log('Vonage API response:', response);

      if (response.error) {
        throw new Error(response.error);
      }
      
      setResult({
        success: true,
        message: 'SMS envoyé avec succès !',
        messageId: response.messageId
      });
    } catch (error) {
      console.error('SMS test error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du SMS'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-[#F5CBA7]">Test d'envoi SMS (Vonage)</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            className={cn(
              'w-full px-4 py-2 rounded-lg',
              'bg-white/5 backdrop-blur-lg',
              'border border-white/10',
              'text-white placeholder-gray-400',
              'focus:border-primary focus:ring-2 focus:ring-primary/50',
              'transition-all duration-200'
            )}
          />
          <p className="mt-1 text-sm text-gray-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Format: 06XXXXXXXX ou +33XXXXXXXXX
          </p>
        </div>

        <AnimatedButtonZ
          onClick={handleTestSMS}
          disabled={sending || !phone}
          className={cn(
            'w-full py-3 px-4 rounded-lg',
            'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
            'text-gray-900 font-semibold',
            'flex items-center justify-center gap-2',
            'transition-all duration-200',
            'hover:opacity-90',
            'focus:outline-none focus:ring-2 focus:ring-[#F5CBA7] focus:ring-opacity-50',
            (sending || !phone) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer un SMS de test
            </>
          )}
        </AnimatedButtonZ>

        {result && (
          <div className={cn(
            'mt-4 p-4 rounded-lg',
            result.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}>
            {result.message}
            {result.messageId && (
              <div className="mt-2">
                <p className="text-sm text-gray-400 mb-1">Statut de livraison :</p>
                <DeliveryStatus messageId={result.messageId} />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Logs</h3>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap">
            Ouvrez la console du navigateur (F12) pour voir les logs détaillés de l'API Vonage.
          </pre>
        </div>
      </div>
    </div>
  );
}