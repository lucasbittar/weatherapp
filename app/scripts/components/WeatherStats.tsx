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
  const borderClass = theme === 'amber' ? 'border-crt-amber/30' : 'border-crt-green/30';

  const stats = [];

  if (windSpeed !== undefined) {
    stats.push({
      label: 'WIND',
      value: `${Math.round(windSpeed)} km/h`,
    });
  }

  if (humidity !== undefined) {
    stats.push({
      label: 'HUMIDITY',
      value: `${humidity}%`,
    });
  }

  if (actualTemp !== undefined && feelsLike !== undefined && actualTemp !== feelsLike) {
    stats.push({
      label: 'REAL TEMP',
      value: `${Math.round(unit === 'C' ? actualTemp : (actualTemp * 9) / 5 + 32)}°${unit}`,
    });
  }

  if (stats.length === 0) return null;

  return (
    <div className={`font-mono text-sm mt-6 border-t ${borderClass} pt-4`}>
      <div className={`${dimClass} text-xs mb-3`}>
        {'>'} ATMOSPHERIC_DATA:
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`${dimClass} text-xs mb-1`}>{stat.label}</div>
            <div
              className={`${brightClass} text-lg`}
              style={{ textShadow: `0 0 8px ${primaryColor}` }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherStats;
