/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/scripts/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        // CRT Amber phosphor palette
        crt: {
          black: '#0a0a08',
          darkBg: '#0d0d0a',
          // Amber theme
          amber: '#ffb000',
          amberDim: '#cc8800',
          amberBright: '#ffc832',
          amberGlow: '#ff9500',
          // Green theme (hacker green)
          green: '#00ff41',
          greenDim: '#00cc33',
          greenBright: '#39ff14',
          greenGlow: '#00ff00',
          scanline: 'rgba(0, 0, 0, 0.3)',
        },
      },
      fontFamily: {
        mono: ['VT323', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'crt-flicker': 'crt-flicker 0.15s infinite',
        'text-glow': 'text-glow 1.5s ease-in-out infinite alternate',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'glitch': 'glitch 2s infinite',
        'glitch-skew': 'glitch-skew 2s infinite',
        'scanline': 'scanline 8s linear infinite',
        'boot-up': 'boot-up 0.5s ease-out forwards',
        'type-in': 'type-in 0.5s steps(20) forwards',
      },
      keyframes: {
        'crt-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
          '25%, 75%': { opacity: '0.99' },
        },
        'text-glow': {
          '0%': { textShadow: '0 0 4px var(--glow-color), 0 0 8px var(--glow-color)' },
          '100%': { textShadow: '0 0 8px var(--glow-color), 0 0 16px var(--glow-color), 0 0 24px var(--glow-color)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)', filter: 'hue-rotate(0deg)' },
          '20%': { transform: 'translate(-2px, 2px)', filter: 'hue-rotate(-20deg)' },
          '40%': { transform: 'translate(-2px, -2px)', filter: 'hue-rotate(20deg)' },
          '60%': { transform: 'translate(2px, 2px)', filter: 'hue-rotate(-10deg)' },
          '80%': { transform: 'translate(2px, -2px)', filter: 'hue-rotate(10deg)' },
        },
        'glitch-skew': {
          '0%, 100%': { transform: 'skew(0deg)' },
          '20%': { transform: 'skew(2deg)' },
          '40%': { transform: 'skew(-1deg)' },
          '60%': { transform: 'skew(1deg)' },
          '80%': { transform: 'skew(-2deg)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'boot-up': {
          '0%': { opacity: '0', transform: 'scaleY(0.1)' },
          '50%': { opacity: '0.5', transform: 'scaleY(0.5)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
        'type-in': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      boxShadow: {
        'crt-glow': '0 0 20px rgba(255, 176, 0, 0.3), inset 0 0 60px rgba(255, 176, 0, 0.05)',
        'amber-glow': '0 0 10px rgba(255, 176, 0, 0.5)',
        'green-glow': '0 0 10px rgba(0, 255, 65, 0.5)',
        'text-amber': '0 0 8px #ffb000',
        'text-green': '0 0 8px #00ff41',
      },
    },
  },
  plugins: [],
};
