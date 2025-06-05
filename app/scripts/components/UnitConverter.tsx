import React, { FC, Dispatch, SetStateAction } from 'react';

interface UnitConverterProps {
  currentUnit: string; // 'F' or 'C'
  setCurrentUnit: Dispatch<SetStateAction<string>>;
}

const UnitConverter: FC<UnitConverterProps> = ({ currentUnit, setCurrentUnit }) => {
  return (
    <div className="units">
      <div
        className={`unit ${currentUnit === 'F' ? 'active' : ''}`}
        data-unit="f"
        onClick={() => setCurrentUnit('F')}
        style={{ cursor: 'pointer', display: 'inline-block', marginRight: '10px' }}
      >
        ˚F
      </div>
      <div
        className={`unit ${currentUnit === 'C' ? 'active' : ''}`}
        data-unit="c"
        onClick={() => setCurrentUnit('C')}
        style={{ cursor: 'pointer', display: 'inline-block' }}
      >
        ˚C
      </div>
    </div>
  );
};

export default UnitConverter;
