import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { DeliveryReceipt } from '../lib/types/supabase';

interface DeliveryStatusProps {
  messageId: string;
}

function DeliveryStatus({ messageId }: DeliveryStatusProps) {
  const [status, setStatus] = useState<DeliveryReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    // Rafraîchir le statut toutes les 5 secondes jusqu'à ce qu'il soit final
    const interval = setInterval(() => {
      if (!status || !['delivered', 'failed'].includes(status.status)) {
        loadStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [messageId, status]);

  const loadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('message_delivery_receipts')
        .select('*')
        .eq('message_id', messageId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span>En attente...</span>
      </div>
    );
  }

  const statusConfig = {
    submitted: {
      icon: Clock,
      text: 'Envoyé',
      color: 'text-gray-400'
    },
    delivered: {
      icon: CheckCircle,
      text: 'Délivré',
      color: 'text-green-400'
    },
    failed: {
      icon: XCircle,
      text: 'Échec',
      color: 'text-red-400'
    },
    rejected: {
      icon: XCircle,
      text: 'Rejeté',
      color: 'text-red-400'
    },
    accepted: {
      icon: Clock,
      text: 'Accepté',
      color: 'text-blue-400'
    },
    buffered: {
      icon: Clock,
      text: 'En attente',
      color: 'text-yellow-400'
    }
  };

  const config = statusConfig[status.status as keyof typeof statusConfig] || statusConfig.submitted;
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', config.color)}>
      <Icon className="w-4 h-4" />
      <span>{config.text}</span>
      {status.error_code && (
        <span className="text-sm text-red-400">
          (Erreur: {status.error_code})
        </span>
      )}
    </div>
  );
}

export default DeliveryStatus;