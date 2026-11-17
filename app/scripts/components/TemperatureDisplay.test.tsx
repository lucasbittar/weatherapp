import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TemperatureDisplay from './TemperatureDisplay';
import formatService from '../services/format.service';

const weatherData = { currently: { apparentTemperature: 21.7 } };

describe('TemperatureDisplay', () => {
  it('shows the temperature in Celsius, rounded down', () => {
    render(
      <TemperatureDisplay weatherData={weatherData} unit="C" formatService={formatService} theme="green" />
    );

    // 21.7 -> Math.floor -> 21
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('converts to Fahrenheit using the real format service', () => {
    render(
      <TemperatureDisplay weatherData={weatherData} unit="F" formatService={formatService} theme="green" />
    );

    // 21°C -> 69.8°F -> floored to 69
    expect(screen.getByText('69')).toBeInTheDocument();
    expect(screen.getByText('°F')).toBeInTheDocument();
  });

  it('delegates the conversion to the injected formatService', () => {
    // Because the component receives `formatService` as a prop (dependency
    // injection), we can hand it a fake and check how it's used, with no
    // module mocking needed.
    const fakeFormatService = { celsiusFahrenheit: vi.fn().mockReturnValue(999) };

    render(
      <TemperatureDisplay weatherData={weatherData} unit="F" formatService={fakeFormatService} theme="amber" />
    );

    expect(fakeFormatService.celsiusFahrenheit).toHaveBeenCalledWith(21);
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('renders nothing when weather data is missing', () => {
    const { container } = render(
      // @ts-expect-error: deliberately passing invalid data to test the guard
      <TemperatureDisplay weatherData={undefined} unit="C" formatService={formatService} theme="green" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
