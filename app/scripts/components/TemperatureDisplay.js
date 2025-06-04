import React from 'react';

function TemperatureDisplay({ weatherData, unit, formatService }) {
  if (!weatherData || !weatherData.currently || !formatService) {
    return null;
  }

  const tempF = Math.round(weatherData.currently.apparentTemperature);
  const tempC = formatService.fahrenheitCelsius(tempF);

  // Mimic original structure:
  // <div class="temp elements-hidden">
  //   <h3 class="temp-f">75</h3>
  //   <h3 class="temp-c">24</h3>
  // </div>
  // Visibility class "elements-hidden" will be handled by overall app state later.
  // Conditional styling for active unit.
  return (
    <div className="temp">
      <h3
        className={`temp-f ${unit === 'F' ? 'active' : ''}`}
        style={{ display: unit === 'F' ? 'inline-block' : 'none' }}
      >
        {tempF}
      </h3>
      <h3
        className={`temp-c ${unit === 'C' ? 'active' : ''}`}
        style={{ display: unit === 'C' ? 'inline-block' : 'none' }}
      >
        {tempC}
      </h3>
    </div>
  );
}

export default TemperatureDisplay;
