import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherDescription from './WeatherDescription';

describe('WeatherDescription', () => {
  it('shows the weather summary as the status line', () => {
    render(
      <WeatherDescription
        weatherData={{ currently: { summary: 'Partly Cloudy', icon: 'partly-cloudy-day' } }}
        theme="green"
      />
    );

    expect(screen.getByText(/status:/i)).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('renders the ASCII art icon', () => {
    const { container } = render(
      <WeatherDescription weatherData={{ currently: { summary: 'Clear', icon: 'clear-day' } }} theme="amber" />
    );

    // ASCII art isn't text a user "reads" by role, so querying the <pre> it
    // lives in directly is reasonable here.
    const ascii = container.querySelector('pre');
    expect(ascii).toBeInTheDocument();
    expect(ascii?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('still renders an icon for an unknown condition (falls back to cloudy)', () => {
    const { container } = render(
      <WeatherDescription weatherData={{ currently: { summary: 'Mystery', icon: 'not-a-real-icon' } }} theme="green" />
    );

    expect(container.querySelector('pre')?.textContent?.trim()).not.toBe('');
  });

  it('renders nothing without current weather data', () => {
    const { container } = render(
      // @ts-expect-error: deliberately passing invalid data to test the guard
      <WeatherDescription weatherData={{}} theme="green" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
