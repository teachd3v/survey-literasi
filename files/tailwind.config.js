// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors from Sekolah Literasi Indonesia Logo
        brand: {
          navy: '#2a3e63',      // Dark navy blue (primary dark)
          blue: '#2e66a3',      // Medium blue (secondary)
          cyan: '#39a0c9',      // Medium cyan blue (primary)
          light: '#7dcbe1',     // Light cyan (accent)
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #2a3e63 0%, #2e66a3 50%, #39a0c9 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #39a0c9 0%, #2e66a3 50%, #2a3e63 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #39a0c9 0%, #7dcbe1 100%)',
        'gradient-blue': 'linear-gradient(135deg, #2e66a3 0%, #39a0c9 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)' 
          },
          '25%': { 
            transform: 'translate(20px, -50px) scale(1.1)' 
          },
          '50%': { 
            transform: 'translate(-20px, 20px) scale(0.9)' 
          },
          '75%': { 
            transform: 'translate(50px, 50px) scale(1.05)' 
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-20px)' 
          },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
        'glow-cyan': '0 0 20px rgba(125, 203, 225, 0.5)',
        'glow-blue': '0 0 20px rgba(57, 160, 201, 0.5)',
      },
    },
  },
  plugins: [
    // Custom Glassmorphism Utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.2)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-strong': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.text-gradient-brand': {
          'background': 'linear-gradient(135deg, #39a0c9 0%, #7dcbe1 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
