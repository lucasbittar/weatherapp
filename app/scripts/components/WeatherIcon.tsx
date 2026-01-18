import React, { FC } from 'react';

interface WeatherIconProps {
  icon: string;
  size?: number;
  className?: string;
}

// Beautiful, minimal weather icons as SVG components
const SunIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Sun rays */}
    <g className="animate-pulse-soft" style={{ transformOrigin: 'center' }}>
      <line x1="50" y1="5" x2="50" y2="20" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="80" x2="50" y2="95" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="5" y1="50" x2="20" y2="50" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="50" x2="95" y2="50" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="18" x2="28" y2="28" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="72" y1="72" x2="82" y2="82" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="82" x2="28" y2="72" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
      <line x1="72" y1="28" x2="82" y2="18" stroke="#FFB347" strokeWidth="3" strokeLinecap="round" />
    </g>
    {/* Sun circle */}
    <circle cx="50" cy="50" r="22" fill="#FFB347" />
    <circle cx="50" cy="50" r="18" fill="#FFD700" />
  </svg>
);

const PartlyCloudyIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Sun behind */}
    <circle cx="35" cy="35" r="18" fill="#FFB347" />
    <circle cx="35" cy="35" r="14" fill="#FFD700" />
    {/* Cloud */}
    <ellipse cx="60" cy="60" rx="28" ry="18" fill="white" />
    <ellipse cx="45" cy="55" rx="18" ry="15" fill="white" />
    <ellipse cx="70" cy="55" rx="15" ry="12" fill="white" />
    <ellipse cx="55" cy="50" rx="12" ry="10" fill="white" />
    {/* Cloud outline */}
    <ellipse cx="60" cy="60" rx="28" ry="18" stroke="#E5E7EB" strokeWidth="1" fill="none" />
  </svg>
);

const CloudyIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Main cloud */}
    <ellipse cx="50" cy="55" rx="32" ry="20" fill="#E5E7EB" />
    <ellipse cx="32" cy="50" rx="20" ry="16" fill="#E5E7EB" />
    <ellipse cx="65" cy="48" rx="18" ry="14" fill="#E5E7EB" />
    <ellipse cx="48" cy="42" rx="14" ry="12" fill="#F3F4F6" />
    {/* Highlights */}
    <ellipse cx="42" cy="45" rx="10" ry="8" fill="#F9FAFB" />
  </svg>
);

const RainIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Cloud */}
    <ellipse cx="50" cy="40" rx="28" ry="18" fill="#94A3B8" />
    <ellipse cx="35" cy="36" rx="16" ry="13" fill="#94A3B8" />
    <ellipse cx="62" cy="35" rx="14" ry="11" fill="#94A3B8" />
    {/* Rain drops */}
    <line x1="35" y1="60" x2="32" y2="75" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="62" x2="47" y2="80" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
    <line x1="65" y1="60" x2="62" y2="75" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SnowIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Cloud */}
    <ellipse cx="50" cy="38" rx="28" ry="18" fill="#CBD5E1" />
    <ellipse cx="35" cy="34" rx="16" ry="13" fill="#CBD5E1" />
    <ellipse cx="62" cy="33" rx="14" ry="11" fill="#CBD5E1" />
    {/* Snowflakes */}
    <circle cx="35" cy="68" r="4" fill="#E0F2FE" stroke="#93C5FD" strokeWidth="1" />
    <circle cx="50" cy="75" r="4" fill="#E0F2FE" stroke="#93C5FD" strokeWidth="1" />
    <circle cx="65" cy="68" r="4" fill="#E0F2FE" stroke="#93C5FD" strokeWidth="1" />
  </svg>
);

const ThunderstormIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Dark cloud */}
    <ellipse cx="50" cy="38" rx="28" ry="18" fill="#64748B" />
    <ellipse cx="35" cy="34" rx="16" ry="13" fill="#64748B" />
    <ellipse cx="62" cy="33" rx="14" ry="11" fill="#64748B" />
    {/* Lightning bolt */}
    <path d="M55 48 L48 62 L54 62 L47 80 L60 58 L52 58 L60 48 Z" fill="#FCD34D" />
    {/* Rain */}
    <line x1="32" y1="58" x2="30" y2="68" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    <line x1="68" y1="58" x2="66" y2="68" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FogIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Fog lines */}
    <line x1="20" y1="35" x2="80" y2="35" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
    <line x1="25" y1="48" x2="75" y2="48" stroke="#D1D5DB" strokeWidth="4" strokeLinecap="round" />
    <line x1="20" y1="61" x2="80" y2="61" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
    <line x1="30" y1="74" x2="70" y2="74" stroke="#F3F4F6" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const SleetIcon: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Cloud */}
    <ellipse cx="50" cy="38" rx="28" ry="18" fill="#94A3B8" />
    <ellipse cx="35" cy="34" rx="16" ry="13" fill="#94A3B8" />
    <ellipse cx="62" cy="33" rx="14" ry="11" fill="#94A3B8" />
    {/* Mixed precipitation */}
    <line x1="35" y1="58" x2="32" y2="70" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="70" r="3" fill="#E0F2FE" stroke="#93C5FD" strokeWidth="1" />
    <line x1="65" y1="58" x2="62" y2="70" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const WeatherIcon: FC<WeatherIconProps> = ({ icon, size = 80, className = '' }) => {
  const iconMap: Record<string, FC<{ size: number }>> = {
    CLEAR_DAY: SunIcon,
    CLEAR_NIGHT: SunIcon, // Could be moon in future
    PARTLY_CLOUDY_DAY: PartlyCloudyIcon,
    PARTLY_CLOUDY_NIGHT: PartlyCloudyIcon,
    CLOUDY: CloudyIcon,
    RAIN: RainIcon,
    SNOW: SnowIcon,
    SLEET: SleetIcon,
    THUNDERSTORM_SHOWERS_DAY: ThunderstormIcon,
    FOG: FogIcon,
  };

  const IconComponent = iconMap[icon] || CloudyIcon;

  return (
    <div className={`animate-float ${className}`}>
      <IconComponent size={size} />
    </div>
  );
};

export default WeatherIcon;
