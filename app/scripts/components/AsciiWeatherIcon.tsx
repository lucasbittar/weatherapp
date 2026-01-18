import React, { FC } from 'react';

interface AsciiWeatherIconProps {
  icon: string;
  className?: string;
}

const asciiIcons: Record<string, string[]> = {
  CLEAR_DAY: [
    '    \\   |   /    ',
    '      .---.      ',
    '  -- (     ) --  ',
    '      `---\'      ',
    '    /   |   \\    ',
  ],
  CLEAR_NIGHT: [
    '       _.-.      ',
    '      (    ).    ',
    '     /       \\   ',
    '    |    *    |  ',
    '     \\ .____./ * ',
  ],
  PARTLY_CLOUDY_DAY: [
    '   \\  /         ',
    ' _ /\"\".-.       ',
    '   \\_( _ ).     ',
    '   /(___(__) )   ',
    '              ',
  ],
  PARTLY_CLOUDY_NIGHT: [
    '     _  .-.      ',
    '    (_)(   ).    ',
    '      (___(__) ) ',
    '                 ',
    '                 ',
  ],
  CLOUDY: [
    '                 ',
    '      .--.       ',
    '   .-(    ).     ',
    '  (___.__)__)    ',
    '                 ',
  ],
  RAIN: [
    '      .--.       ',
    '   .-(    ).     ',
    '  (___.__)__)    ',
    '   ‚ ‚ ‚ ‚ ‚     ',
    '  ‚ ‚ ‚ ‚ ‚      ',
  ],
  SNOW: [
    '      .--.       ',
    '   .-(    ).     ',
    '  (___.__)__)    ',
    '   * * * * *     ',
    '  * * * * *      ',
  ],
  SLEET: [
    '      .--.       ',
    '   .-(    ).     ',
    '  (___.__)__)    ',
    '   ‚ * ‚ * ‚     ',
    '  * ‚ * ‚ *      ',
  ],
  THUNDERSTORM_SHOWERS_DAY: [
    '      .--.       ',
    '   .-(    ).     ',
    '  (___.__)__)    ',
    '    ⚡‚ ‚⚡‚      ',
    '   ‚ ‚⚡‚ ‚       ',
  ],
  FOG: [
    '                 ',
    '  _ - _ - _ -    ',
    '   _ - _ - _     ',
    '  _ - _ - _ -    ',
    '                 ',
  ],
};

// Large ASCII art for main display
const largeAsciiIcons: Record<string, string[]> = {
  CLEAR_DAY: [
    '        \\   |   /        ',
    '         \\  |  /         ',
    '      --- .---. ---      ',
    '         (     )         ',
    '      --- `---\' ---      ',
    '         /  |  \\         ',
    '        /   |   \\        ',
  ],
  CLOUDY: [
    '                         ',
    '          .-~~~-.        ',
    '      .-(        )-.     ',
    '     (              )    ',
    '      `-.__    __.-\'     ',
    '    .-(    `--\'    )-.   ',
    '   (__________________)  ',
  ],
  RAIN: [
    '          .-~~~-.        ',
    '      .-(        )-.     ',
    '     (              )    ',
    '      `-.________.-\'     ',
    '       ‚  ‚  ‚  ‚  ‚     ',
    '      ‚  ‚  ‚  ‚  ‚      ',
    '       ‚  ‚  ‚  ‚  ‚     ',
  ],
  SNOW: [
    '          .-~~~-.        ',
    '      .-(        )-.     ',
    '     (              )    ',
    '      `-.________.-\'     ',
    '       *  *  *  *  *     ',
    '      *  *  *  *  *      ',
    '       *  *  *  *  *     ',
  ],
  THUNDERSTORM_SHOWERS_DAY: [
    '          .-~~~-.        ',
    '      .-(        )-.     ',
    '     (              )    ',
    '      `-.________.-\'     ',
    '        ⚡  ‚  ⚡  ‚      ',
    '       ‚  ⚡  ‚  ⚡       ',
    '        ‚  ‚  ‚  ‚       ',
  ],
};

const AsciiWeatherIcon: FC<AsciiWeatherIconProps> = ({ icon, className = '' }) => {
  const iconKey = icon.toUpperCase().replace(/-/g, '_');
  const asciiArt = asciiIcons[iconKey] || asciiIcons.CLOUDY;

  return (
    <pre className={`font-mono text-crt-amber leading-none text-xs sm:text-sm ${className}`} style={{
      textShadow: '0 0 8px #ffb000, 0 0 16px rgba(255, 176, 0, 0.5)',
    }}>
      {asciiArt.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  );
};

// Large version for main display
export const LargeAsciiWeatherIcon: FC<AsciiWeatherIconProps> = ({ icon, className = '' }) => {
  const iconKey = icon.toUpperCase().replace(/-/g, '_');
  // Fall back to small icon if large doesn't exist
  const asciiArt = largeAsciiIcons[iconKey] || largeAsciiIcons.CLOUDY || asciiIcons[iconKey] || asciiIcons.CLOUDY;

  return (
    <pre className={`font-mono text-crt-amberBright leading-tight text-sm sm:text-base ${className}`} style={{
      textShadow: '0 0 10px #ffb000, 0 0 20px rgba(255, 176, 0, 0.6), 0 0 30px rgba(255, 150, 0, 0.3)',
    }}>
      {asciiArt.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  );
};

export default AsciiWeatherIcon;
