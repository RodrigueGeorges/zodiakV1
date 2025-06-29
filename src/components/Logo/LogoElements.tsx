import { ReactNode } from 'react';
import { LOGO_CONFIG } from '../constants/LogoConfig';

interface LogoElementProps {
  children: ReactNode;
  className?: string;
}

export const OuterRing = ({ children, className = '' }: LogoElementProps) => (
  <div className={`absolute ${LOGO_CONFIG.sizes.outerRing} rounded-full border-2 border-[${LOGO_CONFIG.colors.ring}] ${LOGO_CONFIG.animations.ring} ${className}`}>
    {children}
  </div>
);

export const MiddleRing = ({ children, className = '' }: LogoElementProps) => (
  <div className={`absolute ${LOGO_CONFIG.sizes.middleRing} rounded-full border-2 border-[${LOGO_CONFIG.colors.ring}] ${LOGO_CONFIG.animations.reverseRing} ${className}`}>
    {children}
  </div>
);

export const CentralSun = ({ children, className = '' }: LogoElementProps) => (
  <div className={`relative ${className}`}>
    <div className={`absolute inset-0 bg-[${LOGO_CONFIG.colors.primary}] rounded-full blur-xl opacity-20 ${LOGO_CONFIG.animations.glow}`} />
    {children}
  </div>
);

export const StarElement = ({ className = '' }: { className?: string }) => (
  <div className={`absolute w-1 h-1 bg-[${LOGO_CONFIG.colors.primary}] rounded-full ${LOGO_CONFIG.animations.twinkle} ${className}`} />
);