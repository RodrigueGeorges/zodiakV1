import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Icône Facebook SVG inline
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
  </svg>
);

// Icône WhatsApp SVG inline
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

// Icône Twitter/X SVG inline
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidance: string;
  userName: string;
}

export function ShareModal({ isOpen, onClose, guidance, userName }: ShareModalProps) {
  const [sharePhone, setSharePhone] = useState('');

  const handleShareViaSMS = async () => {
    if (!sharePhone.trim()) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: sharePhone,
          message: `🌟 Guidance du jour de ${userName} : ${guidance}`
        }),
      });

      if (response.ok) {
        toast.success('Guidance envoyée par SMS !');
        onClose();
        setSharePhone('');
      } else {
        toast.error('Erreur lors de l\'envoi du SMS');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du SMS');
    }
  };

  const handleShareViaWhatsApp = () => {
    const text = encodeURIComponent(`🌟 Guidance du jour de ${userName} : ${guidance}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    onClose();
  };

  const handleShareViaTwitter = () => {
    const text = encodeURIComponent(`🌟 Ma guidance du jour : ${guidance}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    onClose();
  };

  const handleShareViaFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Ma guidance du jour : ${guidance}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-cinzel text-primary">Partager ma guidance</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Partage par SMS */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Envoyer par SMS
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              value={sharePhone}
              onChange={(e) => setSharePhone(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleShareViaSMS}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              SMS
            </button>
          </div>
        </div>

        {/* Options de partage social */}
        <div className="space-y-3">
          <button
            onClick={handleShareViaWhatsApp}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 justify-center font-semibold"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Partager sur WhatsApp
          </button>
          
          <button
            onClick={handleShareViaFacebook}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3 justify-center font-semibold"
          >
            <FacebookIcon className="w-5 h-5" />
            Partager sur Facebook
          </button>
          
          <button
            onClick={handleShareViaTwitter}
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 justify-center font-semibold"
          >
            <TwitterIcon className="w-5 h-5" />
            Partager sur X (Twitter)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ShareModal; 