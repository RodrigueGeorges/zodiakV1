/** @type {import('tailwindcss').Config} */
import { DESIGN_TOKENS } from './src/lib/constants/design';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: DESIGN_TOKENS.colors,
      fontFamily: {
        cinzel: [DESIGN_TOKENS.fonts.cinzel, 'serif'],
        montserrat: [DESIGN_TOKENS.fonts.montserrat, 'sans-serif'],
        'open-sans': [DESIGN_TOKENS.fonts.openSans, 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin-slow 20s linear infinite',
        'reverse-spin': 'reverse-spin 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out infinite 1.5s',
        'float-reverse': 'float 3s ease-in-out infinite reverse',
        'float-reverse-delayed': 'float 3s ease-in-out infinite reverse 1.5s',
        'glow': 'glow 3s ease-in-out infinite',
        'cosmic-pulse': 'cosmic-pulse 4s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'reverse-spin': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0) rotate(0deg)',
            filter: 'brightness(1)'
          },
          '50%': { 
            transform: 'translateY(-10px) rotate(5deg)',
            filter: 'brightness(1.3)'
          }
        },
        'glow': {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 15px #F5CBA7) brightness(1)',
            transform: 'scale(1) rotate(0deg)'
          },
          '50%': { 
            filter: 'drop-shadow(0 0 30px #F5CBA7) brightness(1.3)',
            transform: 'scale(1.1) rotate(5deg)'
          }
        },
        'cosmic-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.5',
            filter: 'drop-shadow(0 0 5px #F5CBA7) brightness(1)'
          },
          '50%': { 
            transform: 'scale(1.2)',
            opacity: '1',
            filter: 'drop-shadow(0 0 15px #F5CBA7) brightness(1.3)'
          }
        },
        'twinkle': {
          '0%, 100%': { 
            opacity: '0.2',
            transform: 'scale(0.8)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.2)'
          }
        }
      }
    }
  },
  plugins: [],
};