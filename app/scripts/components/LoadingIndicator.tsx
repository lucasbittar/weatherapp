import { FC, useState, useEffect } from 'react';
import { Theme } from '../context/ThemeContext';

interface LoadingIndicatorProps {
  hidden: boolean;
  error: string;
  theme: Theme;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ hidden, error, theme }) => {
  const [dots, setDots] = useState('');
  const [bootText, setBootText] = useState<string[]>([]);

  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  // Animated dots
  useEffect(() => {
    if (hidden) return;

    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);

    return () => clearInterval(interval);
  }, [hidden]);

  // Boot sequence text
  useEffect(() => {
    if (hidden || error) return;

    const bootSequence = [
      'INITIALIZING WEATHER_TERMINAL v3.0...',
      'ESTABLISHING SATELLITE UPLINK...',
      'ACQUIRING GPS COORDINATES...',
      'FETCHING ATMOSPHERIC DATA...',
      'PROCESSING WEATHER MATRICES...',
    ];

    let index = 0;
    const addLine = () => {
      if (index < bootSequence.length) {
        setBootText(prev => [...prev, bootSequence[index]]);
        index++;
        setTimeout(addLine, 400 + Math.random() * 300);
      }
    };

    setBootText([]);
    setTimeout(addLine, 200);
  }, [hidden, error]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-crt-black z-[999999] transition-all duration-500 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* CRT effects */}
      <div className="crt-scanlines" />
      <div className="crt-curve" />

      <div className="font-mono text-center px-6 max-w-md">
        {error !== '' ? (
          <div>
            {/* Error display */}
            <div className="text-red-500 mb-4" style={{
              textShadow: '0 0 10px #ef4444, 0 0 20px rgba(239, 68, 68, 0.5)',
            }}>
              <pre className="text-left text-sm">
{`╔════════════════════════════════════╗
║  ██████  ERROR  ██████             ║
╠════════════════════════════════════╣
║                                    ║`}
              </pre>
              <pre className="text-left text-sm whitespace-pre-wrap px-2">
                ║  {error.split('\n').join('\n║  ')}
              </pre>
              <pre className="text-left text-sm">
{`║                                    ║
╚════════════════════════════════════╝`}
              </pre>
            </div>
            <div className={`${dimClass} text-sm`}>
              {'>'} PRESS REFRESH TO RETRY_
            </div>
          </div>
        ) : (
          <div>
            {/* Boot sequence */}
            <div className="text-left mb-6">
              {bootText.map((line, i) => (
                <div key={i} className={`${primaryClass} text-sm mb-1`} style={{
                  textShadow: `0 0 5px ${primaryColor}`,
                }}>
                  {'>'} {line} <span className={brightClass}>OK</span>
                </div>
              ))}
            </div>

            {/* Loading indicator */}
            <div className={brightClass} style={{
              textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80`,
              fontSize: '1.125rem',
            }}>
              {'>'} LOADING WEATHER DATA{dots}
              <span className="animate-cursor-blink">█</span>
            </div>

            {/* ASCII loading bar */}
            <div className={`mt-4 ${dimClass} text-sm`}>
              [{'█'.repeat(Math.min(bootText.length, 5))}{'░'.repeat(Math.max(0, 5 - bootText.length))}]
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingIndicator;
