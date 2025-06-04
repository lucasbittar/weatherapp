import React from 'react';

function LoadingIndicator({ hidden }) {
  const visibilityClass = hidden ? 'elements-hidden' : 'elements-show';

  // The root div of this component will now get the animation classes.
  // The main.css should define the transition for .loader-container.elements-hidden and .loader-container.elements-show
  // or more generically for .elements-hidden and .elements-show if applied to a div.
  // The span with class "loader" is for the text styling itself.
  return (
    <div
      className={`loader-container ${visibilityClass}`} // Apply visibility classes to the container
      style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '1.5em',
        // Removed inline opacity and transition, assuming CSS handles it via visibilityClass
      }}
    >
      <span className="loader">fetching your location...</span> {/* Inner span keeps its "loader" class for text styling */}
    </div>
  );
}

export default LoadingIndicator;
