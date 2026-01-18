import { FC } from 'react';
import { TipsResponse } from '../services/tips.service';

interface WeatherTipsProps {
  tips: TipsResponse;
  isLoading: boolean;
  error: string | null;
  theme?: 'amber' | 'green';
}

const WeatherTips: FC<WeatherTipsProps> = ({ tips, isLoading, error, theme = 'amber' }) => {
  // Use cyan/teal accent to contrast with amber theme and make AI tips pop
  const accentColor = '#00d4ff';
  const accentColorDim = '#00a3c4';
  const accentGlow = 'rgba(0, 212, 255, 0.6)';

  // Keep some theme awareness for harmony
  const dimColor = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-6 pt-4">
        <div
          className="p-4 border"
          style={{
            borderColor: accentColorDim,
            background: 'rgba(0, 212, 255, 0.03)',
          }}
        >
          <div className="font-mono text-sm mb-3" style={{ color: accentColor }}>
            <span>{'>'}</span> QUERYING AI_ASSISTANT...
          </div>
          <div className="font-mono text-xs flex items-center gap-2" style={{ color: accentColorDim }}>
            <span className="inline-block animate-pulse">█</span>
            <span>Processing weather intelligence</span>
            <span className="animate-pulse">...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!tips) {
    return null;
  }

  return (
    <div className="mt-6 pt-4">
      {/* AI Tips Container with accent border */}
      <div
        className="border relative overflow-hidden"
        style={{
          borderColor: accentColor,
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(0, 212, 255, 0.02) 100%)',
          boxShadow: `0 0 20px rgba(0, 212, 255, 0.15), inset 0 0 30px rgba(0, 212, 255, 0.03)`,
        }}
      >
        {/* Header bar */}
        <div
          className="px-4 py-2 border-b flex items-center justify-between"
          style={{
            borderColor: `${accentColor}40`,
            background: 'rgba(0, 212, 255, 0.1)',
          }}
        >
          <div className="font-mono text-sm flex items-center gap-2">
            <span
              style={{
                color: accentColor,
                textShadow: `0 0 10px ${accentGlow}`,
              }}
            >
              ◆
            </span>
            <span
              style={{
                color: accentColor,
                textShadow: `0 0 8px ${accentGlow}`,
                letterSpacing: '0.05em',
              }}
            >
              WHAT SHOULD I DO TODAY?
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Outfit Section */}
          <div>
            <div
              className="font-mono text-xs mb-2 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span style={{ textShadow: `0 0 6px ${accentGlow}` }}>►</span>
              <span className="uppercase tracking-wider">WEAR_CONFIG</span>
            </div>
            <ul className="space-y-1 pl-4">
              {tips.outfit.map((item, index) => (
                <li
                  key={index}
                  className={`font-mono text-md ${dimColor} flex items-start gap-2`}
                >
                  <span style={{ color: accentColorDim }}>-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities Section */}
          <div>
            <div
              className="font-mono text-xs mb-2 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span style={{ textShadow: `0 0 6px ${accentGlow}` }}>►</span>
              <span className="uppercase tracking-wider">ACTIVITY_SUGGESTIONS</span>
            </div>
            <ul className="space-y-1 pl-4">
              {tips.activities.map((activity, index) => (
                <li
                  key={index}
                  className={`font-mono text-md ${dimColor} flex items-start gap-2`}
                >
                  <span style={{ color: accentColorDim }}>-</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Points of Interest Section */}
          <div>
            <div
              className="font-mono text-xs mb-2 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span style={{ textShadow: `0 0 6px ${accentGlow}` }}>►</span>
              <span className="uppercase tracking-wider">NEARBY_LOCATIONS</span>
            </div>
            <ul className="space-y-1 pl-4">
              {tips.pointsOfInterest.map((poi, index) => (
                <li
                  key={index}
                  className={`font-mono text-md ${dimColor} flex items-start gap-2`}
                >
                  <span style={{ color: accentColorDim }}>-</span>
                  <span>{poi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherTips;
