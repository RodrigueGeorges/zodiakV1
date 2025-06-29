import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoadingScreen } from '../components/LoadingScreen';
import { GuidanceContent } from '../components/GuidanceContent';
import { useAuth } from '../lib/hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function Guidance() {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Chargement de votre guidance..." />;
  }

  if (!profile) {
    // This can happen briefly during redirects or if profile fetching fails.
    // The useAuth hook ensures user has a profile to get here,
    // but if not, we can show an error or redirect.
    return <LoadingScreen error="Profil non trouvé. Redirection..." />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-cosmic-900"
    >
      <GuidanceContent profile={profile} />
    </motion.div>
  );
}

export default Guidance;