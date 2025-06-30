import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

function Toast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 5000 
}: ToastProps) {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'flex items-center gap-3 p-4 rounded-lg shadow-lg border';
    
    switch (type) {
      case 'success':
        return cn(baseStyles, 'bg-green-900/90 border-green-700 text-green-100');
      case 'error':
        return cn(baseStyles, 'bg-red-900/90 border-red-700 text-red-100');
      default:
        return cn(baseStyles, 'bg-blue-900/90 border-blue-700 text-blue-100');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={getStyles()}>
            {getIcon()}
            <span className="flex-1 text-sm font-medium">{message}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast; 