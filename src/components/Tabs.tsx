import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, MessageSquare } from 'lucide-react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

// Icônes par défaut pour chaque type d'onglet
const getDefaultIcon = (key: string) => {
  switch (key) {
    case 'profile':
      return <User className="w-4 h-4" />;
    case 'natal':
      return <Sparkles className="w-4 h-4" />;
    case 'guidance':
      return <MessageSquare className="w-4 h-4" />;
    default:
      return null;
  }
};

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <motion.div 
      className="flex justify-center gap-2 mb-8 p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-md mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;
        const icon = tab.icon || getDefaultIcon(tab.key);
        
        return (
          <motion.button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            className={`relative px-4 py-3 rounded-lg font-cinzel font-medium outline-none transition-all duration-300 flex items-center gap-2 min-w-[120px] justify-center ${
              isActive
                ? 'text-black'
                : 'text-white hover:text-primary'
            }`}
            onClick={() => onTabChange(tab.key)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onTabChange(tab.key);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Fond animé pour l'onglet actif */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg"
                  layoutId="activeTab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>
            
            {/* Contenu de l'onglet */}
            <div className="relative z-10 flex items-center gap-2">
              {icon && (
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? 360 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {icon}
                </motion.div>
              )}
              <span className="font-medium">{tab.label}</span>
            </div>
            
            {/* Indicateur de sélection */}
            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default Tabs; 