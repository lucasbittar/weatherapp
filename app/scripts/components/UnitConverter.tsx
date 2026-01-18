import { FC, Dispatch, SetStateAction } from 'react';
import { Theme } from '../context/ThemeContext';

interface UnitConverterProps {
  currentUnit: string;
  setCurrentUnit: Dispatch<SetStateAction<string>>;
  theme: Theme;
}

const UnitConverter: FC<UnitConverterProps> = ({
  currentUnit,
  setCurrentUnit,
  theme,
}) => {
  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';
  const activeClass = theme === 'amber'
    ? 'border-crt-amber bg-crt-amber/20 text-crt-amberBright'
    : 'border-crt-green bg-crt-green/20 text-crt-greenBright';
  const inactiveClass = theme === 'amber'
    ? 'border-crt-amberDim/40 text-crt-amberDim hover:border-crt-amber hover:text-crt-amber'
    : 'border-crt-greenDim/40 text-crt-greenDim hover:border-crt-green hover:text-crt-green';

  return (
    <div className="flex items-center justify-center gap-4 my-4 font-mono">
      <span className={`${dimClass} text-sm`}>{'>'} UNIT:</span>

      <button
        className={`px-4 py-2 border transition-all duration-200 text-sm ${
          currentUnit === 'C' ? activeClass : inactiveClass
        }`}
        onClick={() => setCurrentUnit('C')}
        style={currentUnit === 'C' ? {
          textShadow: `0 0 8px ${primaryColor}`,
          boxShadow: `0 0 10px ${primaryColor}4D, inset 0 0 20px ${primaryColor}1A`,
        } : undefined}
      >
        [C] CELSIUS
      </button>

      <button
        className={`px-4 py-2 border transition-all duration-200 text-sm ${
          currentUnit === 'F' ? activeClass : inactiveClass
        }`}
        onClick={() => setCurrentUnit('F')}
        style={currentUnit === 'F' ? {
          textShadow: `0 0 8px ${primaryColor}`,
          boxShadow: `0 0 10px ${primaryColor}4D, inset 0 0 20px ${primaryColor}1A`,
        } : undefined}
      >
        [F] FAHRENHEIT
      </button>
    </div>
  );
};

export default UnitConverter;
