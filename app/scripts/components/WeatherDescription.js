import React, { useEffect, useRef } from 'react';
// Attempt to import Skycons. This path assumes skycons.js is in app/vendor/
// and that Webpack can process it or it correctly attaches to global scope.
import Skycons from '../../vendor/skycons';

function WeatherDescription({ weatherData }) {
  const canvasRef = useRef(null);

  // Default color from original app's CSS for .weather-bg h4
  const iconColor = '#fff';

  useEffect(() => {
    if (!weatherData || !weatherData.current || !weatherData.current.icon || !canvasRef.current) {
      return;
    }

    // Check if Skycons constructor is available
    // It might be available globally (window.Skycons) if the import did not work as expected
    const EffectiveSkycons = Skycons || (window && window.Skycons);

    if (!EffectiveSkycons) {
      console.error("Skycons library not loaded.");
      return;
    }

    const skyconsInstance = new EffectiveSkycons({ color: iconColor });
    const iconName = weatherData.current.icon.toUpperCase().replace(/-/g, "_");

    skyconsInstance.add(canvasRef.current, EffectiveSkycons[iconName] || EffectiveSkycons.CLOUDY); // Fallback to CLOUDY
    skyconsInstance.play();

    return () => {
      skyconsInstance.remove(canvasRef.current);
      // It's also good practice to call pause if the instance is stored and reused.
      // skyconsInstance.pause();
    };
  }, [weatherData, iconColor]); // Rerun if weatherData or color changes

  if (!weatherData || !weatherData.current) {
    return null;
  }

  // Mimic original structure: <h4 class="desc elements-hidden">Cloudy <canvas width="45" height="45"></canvas></h4>
  return (
    <h4 className="desc">
      {Math.floor(weatherData.current.temperature_2m)}
      <canvas ref={canvasRef} width="45" height="45" style={{ marginLeft: '10px', verticalAlign: 'middle' }}></canvas>
    </h4>
  );
}

export default WeatherDescription;
