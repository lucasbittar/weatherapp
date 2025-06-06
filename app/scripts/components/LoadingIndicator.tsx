import React, { FC } from 'react';

interface LoadingIndicatorProps {
  hidden: boolean;
  error: string;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ hidden, error }) => {
  const visibilityClass = hidden ? 'elements-hidden' : 'elements-show';

  return (
    <div className={`loader-container ${visibilityClass}`}>
      { error !== '' ? (
        <span className="loader">{error}</span>
      ) : (
        <span className="loader">fetching your location...</span>
      )}
    </div>
  );
};

export default LoadingIndicator;
