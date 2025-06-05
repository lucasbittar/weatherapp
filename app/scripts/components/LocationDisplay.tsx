import React, { FC } from 'react';

// Assuming LocationInfo is defined in a shared types file or App.tsx
// For now, let's redefine a local version or import if it were in a .d.ts file
interface LocationInfo {
  latitude?: number; // Making optional if not all parts of LocationInfo are needed
  longitude?: number; // Making optional
  cityName: string;
  countryName?: string;
  regionName?: string;
  stateAbbreviation?: string; // Used here
}

interface FormatService {
  getDay: (dayIndex: number) => string;
  getMonth: (monthIndex: number) => string;
  // Add other methods if used by this component
}

interface LocationDisplayProps {
  locationData: LocationInfo;
  formatService: FormatService;
}

const LocationDisplay: FC<LocationDisplayProps> = ({ locationData, formatService }) => {
  if (!locationData || !formatService) {
    return null;
  }

  const today = new Date();
  const day = formatService.getDay(today.getDay());
  const month = formatService.getMonth(today.getMonth());
  const date = today.getDate();
  const year = today.getFullYear();

  return (
    <h2 className="city">
      {locationData.cityName}, {locationData.stateAbbreviation || locationData.regionName || ''} - {day.substring(0,3)}, {date} {month.substring(0,3)} {year}
    </h2>
  );
};

export default LocationDisplay;
