import React from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface StripeSubscriptionProps {
  className?: string;
}

// Extension des types pour Stripe
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    'pricing-table-id'?: string;
    'publishable-key'?: string;
  }
}

export function StripeSubscription({ className }: StripeSubscriptionProps) {
  useEffect(() => {
    // Charger le script Stripe
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full', className)}
    >
      <div
        data-pricing-table-id="prctbl_1QnFrwFKEJoowlXm29BlXOVy"
        data-publishable-key="pk_test_51QnFJTFKEJoowlXmmAV5pdyk5rDT1PpxAqBLcbgBllRWN6wKcMUPWc4zEWCUkshohp6ukNP5Fc6RhP6zzPoRoaCd00d7IHI01J"
        id="stripe-pricing-table"
      />
    </motion.div>
  );
}

export default StripeSubscription;