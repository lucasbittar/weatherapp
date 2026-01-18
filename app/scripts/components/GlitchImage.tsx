import { FC, useState, useEffect, useRef } from 'react';
import { Theme } from '../context/ThemeContext';

interface GlitchImageProps {
  imageUrl: string;
  intensity?: 'low' | 'medium' | 'high';
  theme: Theme;
}

interface GlitchState {
  active: boolean;
  sliceTop: number;
  sliceBottom: number;
  baseShift: number;
  linePositions: [number, number, number];
}

const GlitchImage: FC<GlitchImageProps> = ({ imageUrl, intensity = 'medium', theme }) => {
  const [glitch, setGlitch] = useState<GlitchState>({
    active: false,
    sliceTop: 0,
    sliceBottom: 0,
    baseShift: 0,
    linePositions: [30, 50, 70],
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Theme-based colors
  const lineColor = theme === 'amber' ? 'bg-crt-amber' : 'bg-crt-green';
  const lineBrightColor = theme === 'amber' ? 'bg-crt-amberBright' : 'bg-crt-greenBright';
  const hueRotate = theme === 'amber' ? '-10deg' : '75deg';
  const scanlineColor = theme === 'amber' ? 'rgba(255, 176, 0, 0.03)' : 'rgba(0, 255, 65, 0.03)';

  // Random glitch bursts
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // Set all random values at once in state
        setGlitch({
          active: true,
          sliceTop: Math.random() * 10 - 5,
          sliceBottom: Math.random() * 10 - 5,
          baseShift: Math.random() * 4 - 2,
          linePositions: [
            20 + Math.random() * 60,
            10 + Math.random() * 80,
            30 + Math.random() * 40,
          ],
        });

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Deactivate after random duration
        timeoutRef.current = setTimeout(() => {
          setGlitch(prev => ({ ...prev, active: false }));
        }, 150 + Math.random() * 200);
      }
    }, intensity === 'high' ? 500 : intensity === 'medium' ? 1500 : 3000);

    return () => {
      clearInterval(glitchInterval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {/* Base image with theme tint */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: `grayscale(100%) sepia(100%) hue-rotate(${hueRotate}) saturate(300%) brightness(0.4) contrast(1.3)`,
          transform: glitch.active ? `translateX(${glitch.baseShift}px)` : 'none',
        }}
      />

      {/* Glitch slice - top */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: `grayscale(100%) sepia(100%) hue-rotate(${hueRotate}) saturate(400%) brightness(0.5)`,
          clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
          transform: glitch.active ? `translateX(${glitch.sliceTop}px)` : 'none',
          opacity: glitch.active ? 0.8 : 1,
          transition: 'transform 0.05s, opacity 0.05s',
        }}
      />

      {/* Glitch slice - middle with RGB shift */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-screen"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: `grayscale(100%) sepia(100%) hue-rotate(${hueRotate}) saturate(200%) brightness(0.3)`,
          clipPath: 'polygon(0 33%, 100% 33%, 100% 66%, 0 66%)',
          transform: glitch.active ? `translateX(${-glitch.sliceTop}px)` : 'none',
          opacity: glitch.active ? 0.6 : 0.8,
          transition: 'transform 0.05s, opacity 0.05s',
        }}
      />

      {/* Glitch slice - bottom */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: `grayscale(100%) sepia(100%) hue-rotate(${hueRotate}) saturate(300%) brightness(0.4)`,
          clipPath: 'polygon(0 66%, 100% 66%, 100% 100%, 0 100%)',
          transform: glitch.active ? `translateX(${glitch.sliceBottom}px)` : 'none',
          opacity: glitch.active ? 0.7 : 1,
          transition: 'transform 0.05s, opacity 0.05s',
        }}
      />

      {/* Horizontal glitch lines - always rendered but with opacity transition */}
      <div
        className={`absolute left-0 right-0 h-1 ${lineColor}/30 transition-opacity duration-75`}
        style={{
          top: `${glitch.linePositions[0]}%`,
          opacity: glitch.active ? 1 : 0,
        }}
      />
      <div
        className={`absolute left-0 right-0 h-px ${lineBrightColor}/50 transition-opacity duration-75`}
        style={{
          top: `${glitch.linePositions[1]}%`,
          opacity: glitch.active ? 1 : 0,
        }}
      />
      <div
        className={`absolute left-0 right-0 h-0.5 ${lineColor}/20 transition-opacity duration-75`}
        style={{
          top: `${glitch.linePositions[2]}%`,
          opacity: glitch.active ? 1 : 0,
        }}
      />

      {/* Persistent scan distortion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${scanlineColor} 2px,
            ${scanlineColor} 4px
          )`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 8, 0.8) 100%)',
        }}
      />
    </div>
  );
};

export default GlitchImage;
