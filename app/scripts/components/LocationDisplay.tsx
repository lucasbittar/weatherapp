import { FC } from 'react';
import { Theme } from '../context/ThemeContext';

interface LocationInfo {
  latitude?: number;
  longitude?: number;
  cityName: string;
  countryName?: string;
  regionName?: string;
  stateAbbreviation?: string;
}

interface FormatService {
  getDay: (dayIndex: number) => string;
  getMonth: (monthIndex: number) => string;
}

interface LocationDisplayProps {
  locationData: LocationInfo;
  formatService: FormatService;
  theme: Theme;
}

const LocationDisplay: FC<LocationDisplayProps> = ({
  locationData,
  formatService,
  theme,
}) => {
  if (!locationData || !formatService) {
    return null;
  }

  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  const today = new Date();
  const day = formatService.getDay(today.getDay());
  const month = formatService.getMonth(today.getMonth());
  const date = today.getDate();
  const year = today.getFullYear();
  const hours = today.getHours().toString().padStart(2, '0');
  const minutes = today.getMinutes().toString().padStart(2, '0');

  // Format location string
  const stateOrRegion = locationData.stateAbbreviation || locationData.regionName;
  const locationString = stateOrRegion
    ? `${locationData.cityName}, ${stateOrRegion}`
    : locationData.cityName;

  return (
    <div className="font-mono text-center mb-4">
      {/* Location */}
      <div className={`${primaryClass} text-xl tracking-wide`} style={{
        textShadow: `0 0 8px ${primaryColor}, 0 0 16px ${primaryColor}66`,
      }}>
        <span className={dimClass}>{'>'}</span> LOCATION:{' '}
        <span className={brightClass}>{locationString.toUpperCase()}</span>
      </div>

      {/* Date and Time */}
      <div className={`${dimClass} text-sm mt-1`}>
        <span className={dimClass}>{'>'}</span> {day.substring(0, 3).toUpperCase()}, {date} {month.substring(0, 3).toUpperCase()} {year}
        <span className="ml-4">
          {hours}:{minutes}
        </span>
      </div>

      {/* Coordinates */}
      {locationData.latitude && locationData.longitude && (
        <div className={`${dimClass} opacity-60 text-xs mt-1`}>
          {'>'} COORDS: {locationData.latitude.toFixed(4)}°N, {Math.abs(locationData.longitude).toFixed(4)}°W
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
