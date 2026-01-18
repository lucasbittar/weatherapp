import { FC } from 'react';
import { Theme } from '../context/ThemeContext';

interface AsciiWeatherIconProps {
  icon: string;
  theme: Theme;
  size?: 'small' | 'large';
  className?: string;
}

// Impressive multi-line ASCII weather icons
const asciiIcons: Record<string, string[]> = {
  'clear-day': [
    '       \\   |   /       ',
    '        \\  |  /        ',
    '     ----     ----     ',
    '   --    .---.    --   ',
    '  -    (       )    -  ',
    '   --   `---\`   --   ',
    '     ----     ----     ',
    '        /  |  \\        ',
    '       /   |   \\       ',
  ],
  'clear-night': [
    '            *          ',
    '        _..._    *     ',
    '      .\'     `.        ',
    '     /    *    \\   *   ',
    '    |           |      ',
    '    |   *       |      ',
    '     \\         /       ',
    '   *  `._____.\' *      ',
    '            *          ',
  ],
  'partly-cloudy-day': [
    '      \\  |  /          ',
    '       .---.           ',
    '    --(     )  .---.   ',
    '       `---\'.-\'    `-. ',
    '          (          ) ',
    '           `-.____.-\' )',
    '         (___________) ',
    '                       ',
  ],
  'partly-cloudy-night': [
    '         _..._         ',
    '       .\'  *  `.       ',
    '      /    .----.      ',
    '     |  .-\'      `-.   ',
    '      `(            )  ',
    '        `-.______.-\')  ',
    '       (______________)',
    '                       ',
  ],
  'cloudy': [
    '                       ',
    '         .---.         ',
    '      .-\'     `-.      ',
    '    .\'           `.    ',
    '   (               )   ',
    '    `-.         .-\'    ',
    '   .--`-._____.-\'      ',
    '  (________________)   ',
    '                       ',
  ],
  'rain': [
    '         .---.         ',
    '      .-\'     `-.      ',
    '    (             )    ',
    '     `-.______.-\'      ',
    '   (______________)    ',
    '    /  /  /  /  /      ',
    '   /  /  /  /  /       ',
    '  /  /  /  /  /        ',
    '                       ',
  ],
  'heavy-rain': [
    '         .---.         ',
    '      .-\'     `-.      ',
    '    (             )    ',
    '     `-.______.-\'      ',
    '   (______________)    ',
    '   ||| ||| ||| |||     ',
    '   ||| ||| ||| |||     ',
    '   ||| ||| ||| |||     ',
    '                       ',
  ],
  'snow': [
    '         .---.         ',
    '      .-\'     `-.      ',
    '    (             )    ',
    '     `-.______.-\'      ',
    '   (______________)    ',
    '    *  *  *  *  *      ',
    '   *  *  *  *  *       ',
    '    *  *  *  *  *      ',
    '                       ',
  ],
  'sleet': [
    '         .---.         ',
    '      .-\'     `-.      ',
    '    (             )    ',
    '     `-.______.-\'      ',
    '   (______________)    ',
    '    /  *  /  *  /      ',
    '   *  /  *  /  *       ',
    '    /  *  /  *  /      ',
    '                       ',
  ],
  'wind': [
    '                       ',
    '    ~~~~>              ',
    '  ========>            ',
    '    ~~~~>    =====>    ',
    '  ============>        ',
    '      ~~~~>   ====>    ',
    '  ========>            ',
    '      ~~~~>            ',
    '                       ',
  ],
  'fog': [
    '                       ',
    '   _______________     ',
    '  =================    ',
    '   _______________     ',
    '  =================    ',
    '   _______________     ',
    '  =================    ',
    '                       ',
    '                       ',
  ],
  'thunderstorm': [
    '         .---.         ',
    '      .-\'     `-.      ',
    '    (             )    ',
    '     `-.______.-\'      ',
    '   (______________)    ',
    '      /\\  /  /        ',
    '     /  \\/  /  /       ',
    '    /   /\\ /  /        ',
    '             \\/        ',
  ],
  'hail': [
    '         .---.         ',
    '      .-\'     `-.      ',
    '    (             )    ',
    '     `-.______.-\'      ',
    '   (______________)    ',
    '    o  o  o  o  o      ',
    '   o  o  o  o  o       ',
    '    o  o  o  o  o      ',
    '                       ',
  ],
  'tornado': [
    '      .========.       ',
    '       \\      /        ',
    '        \\    /         ',
    '         \\  /          ',
    '          \\/           ',
    '          ||           ',
    '          ||           ',
    '          ||           ',
    '          \\/           ',
  ],
  'hurricane': [
    '        .---.          ',
    '      ./     \\.        ',
    '     / .-\"\"\"-. \\       ',
    '    | /   @   \\ |      ',
    '    | \\       / |      ',
    '     \\ `-...-\' /       ',
    '      \\.     ./        ',
    '        `---\'          ',
    '                       ',
  ],
};

// Compact icons for smaller displays
const compactIcons: Record<string, string[]> = {
  'clear-day': [
    '  \\ | /  ',
    ' --   -- ',
    ' (     ) ',
    ' --   -- ',
    '  / | \\  ',
  ],
  'clear-night': [
    '    *    ',
    '  .---.  ',
    ' /  *  \\ ',
    ' \\     / ',
    '  `---\'  ',
  ],
  'cloudy': [
    '  .---.  ',
    ' (     ) ',
    '(______) ',
  ],
  'rain': [
    '  .---.  ',
    ' (_____))',
    ' / / / / ',
    '/ / / /  ',
  ],
  'snow': [
    '  .---.  ',
    ' (_____))',
    ' * * * * ',
    '* * * *  ',
  ],
  'thunderstorm': [
    '  .---.  ',
    ' (_____))',
    '  /\\/ /  ',
    ' /  \\/   ',
  ],
  'fog': [
    ' _______ ',
    '========= ',
    ' _______ ',
    '========= ',
  ],
  'wind': [
    '  ~~~>   ',
    '=====>   ',
    '  ~~~>   ',
  ],
};

// Fallback mapping for icon names
const iconAliases: Record<string, string> = {
  'partly-cloudy-day': 'partly-cloudy-day',
  'partly-cloudy-night': 'partly-cloudy-night',
  'thunderstorm-showers-day': 'thunderstorm',
  'thunderstorm-showers-night': 'thunderstorm',
  'showers-day': 'rain',
  'showers-night': 'rain',
  'heavy-rain': 'heavy-rain',
  'light-rain': 'rain',
  'drizzle': 'rain',
  'flurries': 'snow',
  'light-snow': 'snow',
  'heavy-snow': 'snow',
  'blizzard': 'snow',
  'freezing-rain': 'sleet',
  'ice': 'hail',
  'dust': 'fog',
  'smoke': 'fog',
  'haze': 'fog',
  'mist': 'fog',
};

const getIconKey = (icon: string): string => {
  const normalized = icon.toLowerCase().replace(/_/g, '-');
  return iconAliases[normalized] || normalized;
};

const AsciiWeatherIcon: FC<AsciiWeatherIconProps> = ({
  icon,
  theme,
  size = 'large',
  className = ''
}) => {
  const iconKey = getIconKey(icon);
  const icons = size === 'large' ? asciiIcons : compactIcons;
  const asciiArt = icons[iconKey] || icons['cloudy'] || asciiIcons['cloudy'];

  // Theme colors
  const colorClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const glowColor = theme === 'amber'
    ? '0 0 10px #ffb000, 0 0 20px rgba(255, 176, 0, 0.6), 0 0 30px rgba(255, 150, 0, 0.3)'
    : '0 0 10px #00ff41, 0 0 20px rgba(0, 255, 65, 0.6), 0 0 30px rgba(0, 255, 0, 0.3)';

  return (
    <pre
      className={`font-mono leading-none whitespace-pre ${colorClass} ${className}`}
      style={{
        textShadow: glowColor,
        fontSize: size === 'large' ? '0.75rem' : '0.625rem',
      }}
    >
      {asciiArt.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  );
};

export default AsciiWeatherIcon;
