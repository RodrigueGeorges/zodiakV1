import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface MagicButtonXProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const MagicButtonX = forwardRef<HTMLButtonElement, MagicButtonXProps>(
  function MagicButtonX({ children, className = '', ...props }, ref) {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
); 