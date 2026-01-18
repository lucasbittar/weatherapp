import React, { FC, useState } from 'react';
import { TipsResponse } from '../services/tips.service';

interface WeatherTipsProps {
  tips: TipsResponse;
  isLoading: boolean;
  error: string | null;
}

const WeatherTips: FC<WeatherTipsProps> = ({ tips, isLoading, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="tips-container mt-6 w-full max-w-md mx-auto px-4 z-10 relative">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150" />
            <span className="text-white/80 text-sm ml-2">Getting AI tips...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!tips) {
    return null;
  }

  return (
    <div className="tips-container mt-6 w-full max-w-md mx-auto px-4 z-10 relative">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
        >
          <span className="font-semibold text-lg">AI Weather Tips</span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 space-y-4">
            {/* Outfit Section */}
            <div>
              <h4 className="text-white/90 font-semibold text-sm uppercase tracking-wide mb-2 flex items-center">
                <span className="mr-2">👕</span> What to Wear
              </h4>
              <ul className="space-y-1">
                {tips.outfit.map((item, index) => (
                  <li
                    key={index}
                    className="text-white/80 text-sm pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-white/40"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Activities Section */}
            <div>
              <h4 className="text-white/90 font-semibold text-sm uppercase tracking-wide mb-2 flex items-center">
                <span className="mr-2">🎯</span> Activities
              </h4>
              <ul className="space-y-1">
                {tips.activities.map((activity, index) => (
                  <li
                    key={index}
                    className="text-white/80 text-sm pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-white/40"
                  >
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Points of Interest Section */}
            <div>
              <h4 className="text-white/90 font-semibold text-sm uppercase tracking-wide mb-2 flex items-center">
                <span className="mr-2">📍</span> Places to Visit
              </h4>
              <ul className="space-y-1">
                {tips.pointsOfInterest.map((poi, index) => (
                  <li
                    key={index}
                    className="text-white/80 text-sm pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-white/40"
                  >
                    {poi}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherTips;
