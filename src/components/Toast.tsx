import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, AlertCircle, XCircle, X as CloseIcon } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const toastConfig = {
    success: {
      icon: <Check className="w-5 h-5" />,
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    error: {
      icon: <X className="w-5 h-5" />,
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      text: 'text-primary',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    }
  };

  const config = toastConfig[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          duration: 0.3 
        }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg border ${config.bg} ${config.border} ${config.text} font-medium text-base max-w-sm mx-4`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.iconBg} ${config.iconColor}`}>
            {config.icon}
          </div>
          <span className="flex-1">{message}</span>
          <motion.button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${config.text}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <CloseIcon className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Barre de progression */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${config.iconBg} rounded-b-xl`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </motion.div>
    </AnimatePresence>
  );
} 