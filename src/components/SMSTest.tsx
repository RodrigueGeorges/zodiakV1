import React, { useState } from 'react';
import { ButtonZodiak } from './ButtonZodiak';
import { toast } from 'react-hot-toast';

function SMSTest() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendSMS = async () => {
    if (!phone || !message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          message
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du SMS');
      }

      toast.success('SMS envoyé avec succès !');
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Erreur lors de l\'envoi du SMS');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Test SMS</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 XX XX XX XX"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre message..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <ButtonZodiak
          onClick={sendSMS}
          disabled={isLoading || !phone || !message}
          className="w-full"
        >
          {isLoading ? 'Envoi...' : 'Envoyer SMS'}
        </ButtonZodiak>
      </div>
    </div>
  );
}

export default SMSTest;