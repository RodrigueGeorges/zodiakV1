import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  'aria-label'?: string;
}

export function InteractiveCard({ children, className = '', onClick, tabIndex, 'aria-label': ariaLabel }: InteractiveCardProps) {
  return (
    <motion.div
      className={`relative bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 shadow-xl ${className}`}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: onClick ? 'manipulation' : 'auto'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}