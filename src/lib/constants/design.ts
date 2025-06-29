// ATTENTION: NE PAS MODIFIER CE FICHIER
// Ces constantes définissent l'identité visuelle de l'application

export const DESIGN_TOKENS = {
  // Couleurs principales
  colors: {
    primary: '#F5CBA7',
    secondary: '#D4A373',
    cosmic: {
      900: '#0B1120',
      800: '#1a1f2e',
      700: '#2a2f3e',
      600: '#3a3f4e',
      500: '#4a4f5e',
    }
  },

  // Typographie
  fonts: {
    cinzel: 'Cinzel',
    montserrat: 'Montserrat',
    openSans: 'Open Sans',
  },

  // Animations
  animations: {
    duration: {
      slow: '20s',
      medium: '3s',
      fast: '1.5s',
    },
    timing: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'ease-in-out',
    },
    keyframes: {
      float: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `,
      glow: `
        @keyframes glow {
          0%, 100% { 
            filter: drop-shadow(0 0 15px #F5CBA7);
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 30px #F5CBA7);
            transform: scale(1.1);
          }
        }
      `,
      spinSlow: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `,
      reverseSpin: `
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `,
      cosmicPulse: `
        @keyframes cosmic-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `,
    }
  },

  // Composants de base
  components: {
    card: {
      background: 'bg-white/5',
      backdropBlur: 'backdrop-blur-lg',
      border: 'border border-white/10',
      rounded: 'rounded-lg',
      shadow: 'shadow-xl',
    },
    button: {
      base: [
        'px-4 py-2 rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ].join(' '),
      primary: [
        'bg-gradient-to-r from-[#F5CBA7] to-[#D4A373]',
        'text-gray-900 font-semibold',
        'hover:opacity-90',
        'focus:ring-[#F5CBA7]/50'
      ].join(' '),
      secondary: [
        'bg-white/5 hover:bg-white/10',
        'text-white',
        'focus:ring-white/50'
      ].join(' ')
    },
    input: {
      base: [
        'w-full px-4 py-3 rounded-lg',
        'bg-white/5 backdrop-blur-lg',
        'border border-white/10',
        'text-white placeholder-gray-400',
        'focus:border-[#F5CBA7] focus:ring-2 focus:ring-[#F5CBA7]/50',
        'transition-all duration-200'
      ].join(' ')
    }
  },

  // Effets visuels
  effects: {
    gradients: {
      primary: 'bg-gradient-to-r from-[#F5CBA7] via-[#D4A373] to-[#F5CBA7]',
      cosmic: 'bg-gradient-to-b from-[#0f172a] to-[#1e293b]',
    },
    text: {
      gradient: 'text-transparent bg-clip-text',
      cosmic: 'animate-cosmic-text',
    }
  }
} as const;

// Fonction utilitaire pour accéder aux tokens de design
export function getDesignToken(path: string): string {
  return path.split('.').reduce((obj, key) => obj[key], DESIGN_TOKENS as any);
}