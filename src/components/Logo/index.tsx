import { memo } from 'react';
import { Moon, Sun, Star, Sparkle } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};
const ringMap = {
  sm: 'w-12 h-12',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};
const middleMap = {
  sm: 'w-8 h-8',
  md: 'w-24 h-24',
  lg: 'w-36 h-36',
};
const sunMap = {
  sm: 'w-6 h-6',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};
const centerStarMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};
const moonMap = {
  sm: 'w-3 h-3',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};
const sparkleMap = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

const Logo = memo(function Logo({ size = 'md' }: LogoProps) {
  const isMobile = size === 'sm';
  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} group`}>
      {/* Outer cosmic ring */}
      <div className={`absolute ${ringMap[size]} rounded-full border-2 border-[#F5CBA7]/30 animate-spin-slow group-hover:border-[#F5CBA7]/50 transition-colors duration-500`}>
        <Star className={`absolute -top-1.5 left-1/2 -translate-x-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-cosmic-pulse`} />
        <Star className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-cosmic-pulse`} />
        <Star className={`absolute top-1/2 -left-1.5 -translate-y-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-cosmic-pulse`} />
        <Star className={`absolute top-1/2 -right-1.5 -translate-y-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-cosmic-pulse`} />
      </div>

      {/* Middle cosmic ring */}
      <div className={`absolute ${middleMap[size]} rounded-full border-2 border-[#F5CBA7]/30 animate-reverse-spin group-hover:border-[#F5CBA7]/50 transition-colors duration-500`}>
        <Moon className={`absolute top-1/2 -left-3 -translate-y-1/2 ${moonMap[size]} text-[#F5CBA7] animate-float`} />
        <Moon className={`absolute top-1/2 -right-3 -translate-y-1/2 ${moonMap[size]} text-[#F5CBA7] animate-float-reverse`} />
      </div>

      {/* Central sun with glowing effect */}
      <div className="relative transform group-hover:scale-110 transition-transform duration-500">
        <div className="absolute inset-0 bg-[#F5CBA7] rounded-full blur-xl opacity-20 animate-glow group-hover:opacity-30 transition-opacity duration-500" />
        <Sun className={`${sunMap[size]} text-[#F5CBA7] animate-glow relative z-10`} />
        <Star className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${centerStarMap[size]} text-white/90`} />
      </div>

      {/* Fixed sparkles - masqués sur mobile */}
      {!isMobile && <>
        <Sparkle className={`absolute -top-4 left-1/2 -translate-x-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-float`} />
        <Sparkle className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-float-delayed`} />
        <Sparkle className={`absolute top-1/2 -left-4 -translate-y-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-float-reverse`} />
        <Sparkle className={`absolute top-1/2 -right-4 -translate-y-1/2 ${sparkleMap[size]} text-[#F5CBA7] animate-float-reverse-delayed`} />
      </>}

      {/* Decorative stars - masqués sur mobile */}
      {!isMobile && [...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#F5CBA7] rounded-full animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
});

export { Logo };