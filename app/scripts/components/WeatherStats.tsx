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
  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const borderClass = theme === 'amber' ? 'border-crt-amber/40' : 'border-crt-green/40';
  const bgClass = theme === 'amber' ? 'bg-crt-amber/5' : 'bg-crt-green/5';

  const stats = [];

  if (windSpeed !== undefined) {
    stats.push({
      label: 'WIND',
      value: Math.round(windSpeed),
      unit: 'km/h',
      icon: '≋',
    });
  }

  if (humidity !== undefined) {
    stats.push({
      label: 'HUMIDITY',
      value: humidity,
      unit: '%',
      icon: '◈',
    });
  }

  if (actualTemp !== undefined && feelsLike !== undefined && actualTemp !== feelsLike) {
    stats.push({
      label: 'ACTUAL',
      value: Math.round(unit === 'C' ? actualTemp : (actualTemp * 9) / 5 + 32),
      unit: `°${unit}`,
      icon: '◉',
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
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${bgClass} border ${borderClass} p-3 text-center`}
          >
            {/* Icon */}
            <div
              className={`${primaryClass} text-2xl mb-1`}
              style={{ textShadow: `0 0 10px ${primaryColor}` }}
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
            <div className={`${dimClass} text-xs font-mono mt-1 tracking-wider`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherStats;
