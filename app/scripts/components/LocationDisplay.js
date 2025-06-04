import React from 'react';

function LocationDisplay({ locationData, formatService }) {
  if (!locationData || !formatService) {
    return null; // Or some placeholder/loading state if preferred
  }

  const today = new Date();
  const day = formatService.getDay(today.getDay());
  const month = formatService.getMonth(today.getMonth());
  const date = today.getDate();
  const year = today.getFullYear();

  // Mimic original structure: <h2 class="city elements-hidden">New York, NY - Mon, 01 Jan 2023</h2>
  // Visibility class "elements-hidden" will be handled by overall app state later if needed.
  return (
    <h2 className="city">
      {locationData.cityName}, {locationData.stateAbbreviation} - {day.substring(0,3)}, {date} {month.substring(0,3)} {year}
    </h2>
  );
}

export default LocationDisplay;
