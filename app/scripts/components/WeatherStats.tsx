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
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  return (
    <div className="font-mono text-sm mt-6">
      {/* Stats box */}
      <div className={dimClass}>
        ╔══════════════════════════════════╗
      </div>
      <div className={dimClass}>
        ║ <span className={primaryClass}>ATMOSPHERIC DATA</span>
        {' '.repeat(17)}║
      </div>
      <div className={dimClass}>
        ╠══════════════════════════════════╣
      </div>

      {windSpeed !== undefined && (
        <div className={dimClass}>
          ║ {'>'} WIND SPEED:{' '}
          <span className={brightClass} style={{ textShadow: `0 0 5px ${primaryColor}` }}>
            {Math.round(windSpeed)} km/h
          </span>
          {' '.repeat(Math.max(0, 12 - String(Math.round(windSpeed)).length))}║
        </div>
      )}

      {humidity !== undefined && (
        <div className={dimClass}>
          ║ {'>'} HUMIDITY:{' '}
          <span className={brightClass} style={{ textShadow: `0 0 5px ${primaryColor}` }}>
            {humidity}%
          </span>
          {' '.repeat(Math.max(0, 16 - String(humidity).length))}║
        </div>
      )}

      {actualTemp !== undefined && feelsLike !== undefined && actualTemp !== feelsLike && (
        <div className={dimClass}>
          ║ {'>'} REAL TEMP:{' '}
          <span className={brightClass} style={{ textShadow: `0 0 5px ${primaryColor}` }}>
            {Math.round(unit === 'C' ? actualTemp : (actualTemp * 9) / 5 + 32)}°{unit}
          </span>
          {' '.repeat(Math.max(0, 14 - String(Math.round(actualTemp)).length))}║
        </div>
      )}

      <div className={dimClass}>
        ╚══════════════════════════════════╝
      </div>
    </div>
  );
};

export default WeatherStats;
