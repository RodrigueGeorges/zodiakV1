import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { SMSService } from '../lib/sms';
import InteractiveCard from './InteractiveCard';
import type { InboundMessage } from '../lib/types/supabase';

interface InboundMessagesProps {
  userId: string;
}

export function InboundMessages({ userId }: InboundMessagesProps) {
  const [messages, setMessages] = useState<InboundMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
    // Rafraîchir les messages toutes les 30 secondes
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadMessages = async () => {
    try {
      const messages = await SMSService.getInboundMessages(userId);
      setMessages(messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <InteractiveCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Messages Reçus</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Aucun message reçu pour le moment
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-4 bg-white/5 rounded-lg space-y-2"
            >
              <div className="flex justify-between text-sm text-gray-400">
                <span>De : {message.from}</span>
                <span>{formatDate(message.timestamp)}</span>
              </div>
              <p className="text-white">{message.text}</p>
            </div>
          ))}
        </div>
      )}
    </InteractiveCard>
  );
}

export default InboundMessages;