import { FC } from 'react';
import { useTheme, Theme } from '../context/ThemeContext';

const ThemeSwitcher: FC = () => {
  const { theme, setTheme, colors } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center justify-center gap-4 my-4 font-mono">
      <span
        className="text-sm"
        style={{ color: colors.dim }}
      >
        {'>'} THEME:
      </span>

      <button
        className={`px-4 py-2 border transition-all duration-200 text-sm ${
          theme === 'amber'
            ? 'border-crt-amber bg-crt-amber/20 text-crt-amberBright'
            : 'border-crt-amberDim/40 text-crt-amberDim hover:border-crt-amber hover:text-crt-amber'
        }`}
        onClick={() => handleThemeChange('amber')}
        style={theme === 'amber' ? {
          textShadow: '0 0 8px #ffb000',
          boxShadow: '0 0 10px rgba(255, 176, 0, 0.3), inset 0 0 20px rgba(255, 176, 0, 0.1)',
        } : undefined}
      >
        [A] AMBER
      </button>

      <button
        className={`px-4 py-2 border transition-all duration-200 text-sm ${
          theme === 'green'
            ? 'border-crt-green bg-crt-green/20 text-crt-greenBright'
            : 'border-crt-greenDim/40 text-crt-greenDim hover:border-crt-green hover:text-crt-green'
        }`}
        onClick={() => handleThemeChange('green')}
        style={theme === 'green' ? {
          textShadow: '0 0 8px #00ff41',
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
        } : undefined}
      >
        [G] GREEN
      </button>
    </div>
  );
};

export default ThemeSwitcher;
