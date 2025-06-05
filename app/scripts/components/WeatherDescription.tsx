import React, { useEffect, useRef, FC } from 'react';

// Assuming Skycons is loaded globally or via a script tag.
// Declare it to inform TypeScript about its existence.
declare var Skycons: any; // Use 'any' if specific type definition is not available.
declare global {
  interface Window {
    Skycons?: any;
  }
}


// Re-using WeatherInfo and WeatherCurrently from App.tsx context
// (ideally imported from a shared types file)
interface WeatherCurrently {
  apparentTemperature?: number; // Not used here, but part of the interface
  summary: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

interface WeatherInfo {
  currently: WeatherCurrently;
}

interface WeatherDescriptionProps {
  weatherData: WeatherInfo;
}

const WeatherDescription: FC<WeatherDescriptionProps> = ({ weatherData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconColor = '#fff'; // Default color

  useEffect(() => {
    // Check for weatherData, weatherData.currently, icon, and canvasRef
    if (!weatherData || !weatherData.currently || !weatherData.currently.icon || !canvasRef.current) {
      return;
    }

    const EffectiveSkycons = Skycons || (window && window.Skycons);

    if (!EffectiveSkycons) {
      console.error("Skycons library not loaded.");
      return;
    }

    const skyconsInstance = new EffectiveSkycons({ color: iconColor });
    // Use icon from weatherData.currently, matching WeatherInfo structure
    const iconName = weatherData.currently.icon.toUpperCase().replace(/-/g, "_");

    skyconsInstance.add(canvasRef.current, EffectiveSkycons[iconName] || EffectiveSkycons.CLOUDY);
    skyconsInstance.play();

    return () => {
      if (canvasRef.current && canvasRef.current.parentNode) {
        // Check if skyconsInstance was successfully created before calling remove
        if (skyconsInstance && typeof skyconsInstance.remove === 'function') {
          skyconsInstance.remove(canvasRef.current);
        }
      }
      // Optional: skyconsInstance.pause(); if instance is managed outside useEffect
    };
  }, [weatherData, iconColor]);

  // Ensure weatherData and weatherData.currently exist before trying to render
  if (!weatherData || !weatherData.currently) {
    return null;
  }

  return (
    <h4 className="desc">
      {weatherData.currently.summary} {/* Displaying summary (description) */}
      <canvas ref={canvasRef} width="45" height="45" style={{ marginLeft: '10px', verticalAlign: 'middle' }}></canvas>
    </h4>
  );
};

export default WeatherDescription;
