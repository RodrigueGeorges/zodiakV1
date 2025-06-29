import { COLORS } from './theme';

export const LOGO_CONFIG = {
  sizes: {
    container: 'w-32 h-32',
    outerRing: 'w-full h-full',
    middleRing: 'w-24 h-24',
    centralSun: 'w-16 h-16',
    star: 'w-3 h-3',
    moon: 'w-6 h-6',
    sparkle: 'w-5 h-5',
    centerStar: 'w-8 h-8',
  },
  colors: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    ring: `${COLORS.primary}30`,
    glow: `${COLORS.primary}20`,
  },
  animations: {
    ring: 'animate-spin-slow',
    reverseRing: 'animate-reverse-spin',
    float: 'animate-float',
    floatReverse: 'animate-float-reverse',
    glow: 'animate-glow',
    pulse: 'animate-cosmic-pulse',
    twinkle: 'animate-twinkle',
  },
  decorativeStars: 8,
} as const;