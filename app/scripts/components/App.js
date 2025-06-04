import React, { useState, useEffect } from 'react';
import locationService from '../services/location.service';
import weatherService from '../services/weather.service';
import imageService from '../services/image.service';
import formatService from '../services/format.service'; // For date formatting, etc.

// Import components
import LoadingIndicator from './LoadingIndicator';
import LocationDisplay from './LocationDisplay';
import TemperatureDisplay from './TemperatureDisplay';
import WeatherDescription from './WeatherDescription';
import UnitConverter from './UnitConverter';
import '../../styles/main.css';

function App() {
  const [locationInfo, setLocationInfo] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUnit, setCurrentUnit] = useState('F');
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // setIsLoading(true); // Already true by default
    locationService.getInfo()
      .then(locData => {
        // Ensure locData and its properties are valid before proceeding
        if (!locData || !locData.latitude || !locData.longitude || !locData.cityName) {
          throw new Error("Invalid location data received");
        }
        setLocationInfo(locData);
        return Promise.all([
          weatherService.getInfo(locData.latitude, locData.longitude),
          imageService.search(locData.cityName)
        ]);
      })
      .then(([weatherData, imageData]) => {
        setWeatherInfo(weatherData);
        setImageInfo(imageData);
        setIsLoading(false);
        setContentVisible(true);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err.message || 'Failed to fetch data');
        setIsLoading(false);
        setContentVisible(true);
      });
  }, []); // Empty dependency array to run only on mount

  if (error) {
    // Attempt to match original styling for error messages if possible
    return (
      <div className="weather-bg">
        <span className="loader elements-show">Error: {error}</span>
      </div>
    );
  }

  // Basic rendering - detailed props will be passed in later steps
  return (
    <div className={`weather-app-react ${contentVisible ? 'content-visible' : 'content-hidden'}`}>
      <LoadingIndicator hidden={!isLoading} />
      <div className="weather-border" style={{ backgroundColor: isLoading ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0)' }}></div>
      <div className="weather-bg-animation" style={{ background: imageInfo && imageInfo.url && formatService ? `linear-gradient(344deg, rgba(255,255,255,0), #${formatService.getFormat().backgroundColor})` : '' }}></div>
      <div className="weather-bg" style={{ background: imageInfo && imageInfo.url ? `url(${imageInfo.url}) no-repeat 50% center / cover` : '' }}>
        {formatService && <h1 className="greeting">{formatService.getFormat().greeting}</h1>}
        {locationInfo && formatService && <LocationDisplay locationData={locationInfo} formatService={formatService} />}
        {weatherInfo && formatService && <TemperatureDisplay weatherData={weatherInfo} unit={currentUnit} formatService={formatService} />}
        {weatherInfo && <WeatherDescription weatherData={weatherInfo} />} {/* Skycons color is handled internally for now */}
        {currentUnit && setCurrentUnit && <UnitConverter currentUnit={currentUnit} setCurrentUnit={setCurrentUnit} />}
      </div>
      <div className="credits">
        created by
        <a href="https://github.com/lucasbittar/" target="_blank" style={{ paddingLeft: '3px' }}>Lucas Bittar</a>.
      </div>
    </div>
  );
}

export default App;
