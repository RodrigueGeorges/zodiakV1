import { Moon, Sun, Star, Sparkle } from 'lucide-react';

export function Logo() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Outer cosmic ring */}
      <div className="absolute w-full h-full rounded-full border-2 border-[#F5CBA7]/30 animate-spin-slow">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <Star className="w-3 h-3 text-[#F5CBA7] animate-cosmic-pulse" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <Star className="w-3 h-3 text-[#F5CBA7] animate-cosmic-pulse" />
        </div>
        <div className="absolute -left-1 top-1/2 -translate-y-1/2">
          <Star className="w-3 h-3 text-[#F5CBA7] animate-cosmic-pulse" />
        </div>
        <div className="absolute -right-1 top-1/2 -translate-y-1/2">
          <Star className="w-3 h-3 text-[#F5CBA7] animate-cosmic-pulse" />
        </div>
      </div>

      {/* Middle cosmic ring */}
      <div className="absolute w-24 h-24 rounded-full border-2 border-[#D4A373]/30 animate-reverse-spin">
        <div className="absolute top-1/2 -translate-y-1/2 -left-3">
          <Moon className="w-6 h-6 text-[#F5CBA7] animate-float" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -right-3">
          <Moon className="w-6 h-6 text-[#F5CBA7] animate-float-reverse" />
        </div>
      </div>

      {/* Central sun with glowing effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#F5CBA7] rounded-full blur-xl opacity-20 animate-glow" />
        <Sun className="w-16 h-16 text-[#F5CBA7] animate-glow relative z-10" />
        <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/90" />
      </div>

      {/* Floating sparkles */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <Sparkle className="w-5 h-5 text-[#F5CBA7] animate-float" />
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
        <Sparkle className="w-5 h-5 text-[#F5CBA7] animate-float-delayed" />
      </div>
      <div className="absolute top-1/2 -left-4 -translate-y-1/2">
        <Sparkle className="w-5 h-5 text-[#F5CBA7] animate-float-reverse" />
      </div>
      <div className="absolute top-1/2 -right-4 -translate-y-1/2">
        <Sparkle className="w-5 h-5 text-[#F5CBA7] animate-float-reverse-delayed" />
      </div>

      {/* Additional decorative stars */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
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
    </div>
  );
}