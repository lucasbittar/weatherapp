import React from 'react';

function UnitConverter({ currentUnit, setCurrentUnit }) {
  if (!setCurrentUnit) {
    return null;
  }

  // Mimic original structure:
  // <div class="units elements-hidden">
  //   <div class="unit active" data-unit="f">˚F</div>
  //   <div class="unit" data-unit="c">˚C</div>
  // </div>
  return (
    <div className="units">
      <div
        className={`unit ${currentUnit === 'F' ? 'active' : ''}`}
        data-unit="f"
        onClick={() => setCurrentUnit('F')}
        style={{ cursor: 'pointer', display: 'inline-block', marginRight: '10px' }} // Basic styling
      >
        ˚F
      </div>
      <div
        className={`unit ${currentUnit === 'C' ? 'active' : ''}`}
        data-unit="c"
        onClick={() => setCurrentUnit('C')}
        style={{ cursor: 'pointer', display: 'inline-block' }} // Basic styling
      >
        ˚C
      </div>
    </div>
  );
}

export default UnitConverter;
