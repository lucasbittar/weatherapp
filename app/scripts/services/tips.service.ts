/**
 * Project Name: Weather App | Tips Service
 * Author: Lucas Bittar Magnani
 * Created: 2026-01-17
 */
'use strict';

export interface TipsRequest {
  temperature: number;
  temperatureUnit: 'C' | 'F';
  weatherSummary: string;
  cityName: string;
  stateName?: string;
  countryName?: string;
  humidity?: number;
  windSpeed?: number;
}

export interface TipsResponse {
  outfit: string[];
  activities: string[];
  pointsOfInterest: string[];
}

const getTips = async (request: TipsRequest): Promise<TipsResponse> => {
  const response = await fetch('/api/tips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch tips: ${response.status}`
    );
  }

  return response.json() as Promise<TipsResponse>;
};

interface TipsService {
  getTips: (request: TipsRequest) => Promise<TipsResponse>;
}

const tipsServiceInstance: TipsService = {
  getTips,
};

export default tipsServiceInstance;
