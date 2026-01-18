import { FC } from 'react';
import { Theme } from '../context/ThemeContext';

interface WeatherStatsProps {
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
  actualTemp?: number;
  unit: string;
  theme: Theme;
}

const WeatherStats: FC<WeatherStatsProps> = ({
  humidity,
  windSpeed,
  feelsLike,
  actualTemp,
  unit,
  theme,
}) => {
  // Theme colors - keeping amber as main
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  // Accent colors for each stat - subtle variety
  const statColors = [
    { accent: '#ff6b9d', glow: 'rgba(255, 107, 157, 0.6)' }, // Pink for wind
    { accent: '#9d6bff', glow: 'rgba(157, 107, 255, 0.6)' }, // Purple for humidity
    { accent: '#6bff9d', glow: 'rgba(107, 255, 157, 0.6)' }, // Mint for actual temp
  ];

  const stats = [];

  if (windSpeed !== undefined) {
    stats.push({
      label: 'WIND',
      value: Math.round(windSpeed),
      unit: 'km/h',
      icon: '≋',
      colorIndex: 0,
    });
  }

  if (humidity !== undefined) {
    stats.push({
      label: 'HUMIDITY',
      value: humidity,
      unit: '%',
      icon: '◈',
      colorIndex: 1,
    });
  }

  if (actualTemp !== undefined && feelsLike !== undefined && actualTemp !== feelsLike) {
    stats.push({
      label: 'ACTUAL',
      value: Math.round(unit === 'C' ? actualTemp : (actualTemp * 9) / 5 + 32),
      unit: `°${unit}`,
      icon: '◉',
      colorIndex: 2,
    });
  }

  if (stats.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-dashed border-crt-amber/30">
      {/* Header */}
      <div className={`font-mono text-sm mb-4`}>
        <span className={dimClass}>[</span>
        <span
          className={brightClass}
          style={{ textShadow: `0 0 8px ${primaryColor}` }}
        >
          ATMOSPHERIC_SENSORS
        </span>
        <span className={dimClass}>]</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const colors = statColors[stat.colorIndex];
          return (
            <div
              key={index}
              className="p-3 text-center border"
              style={{
                borderColor: `${colors.accent}40`,
                background: `linear-gradient(135deg, ${colors.accent}10 0%, ${colors.accent}05 100%)`,
              }}
            >
              {/* Icon */}
              <div
                className="text-2xl mb-1"
                style={{
                  color: colors.accent,
                  textShadow: `0 0 10px ${colors.glow}`,
                }}
              >
                {stat.icon}
              </div>
              {/* Value */}
              <div
                className={`${brightClass} text-2xl font-mono`}
                style={{ textShadow: `0 0 8px ${primaryColor}` }}
              >
                {stat.value}
                <span className={`${dimClass} text-base ml-1`}>{stat.unit}</span>
              </div>
              {/* Label */}
              <div
                className="text-xs font-mono mt-1 tracking-wider"
                style={{ color: `${colors.accent}cc` }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherStats;
