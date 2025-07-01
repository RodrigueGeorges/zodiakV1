import React from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { loadStripe } from '@stripe/stripe-js';

interface StripeSubscriptionProps {
  className?: string;
}

declare global {
  interface Window {
    Stripe: typeof import('@stripe/stripe-js');
  }
  
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
        },
        HTMLElement
      >;
    }
  }
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
      <stripe-pricing-table
        pricing-table-id="prctbl_1QnFrwFKEJoowlXm29BlXOVy"
        publishable-key="pk_test_51QnFJTFKEJoowlXmmAV5pdyk5rDT1PpxAqBLcbgBllRWN6wKcMUPWc4zEWCUkshohp6ukNP5Fc6RhP6zzPoRoaCd00d7IHI01J"
      />
    </motion.div>
  );
}

export default StripeSubscription;