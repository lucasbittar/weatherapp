import React, { FC } from 'react';

interface LoadingIndicatorProps {
  hidden: boolean;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ hidden }) => {
  const visibilityClass = hidden ? 'elements-hidden' : 'elements-show';

  return (
    <div className={`loader-container ${visibilityClass}`}>
      <span className="loader">fetching your location...</span>
    </div>
  );
};

export default LoadingIndicator;
