import React, { FC, ReactNode } from 'react';

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const TerminalWindow: FC<TerminalWindowProps> = ({
  title = 'WEATHER_TERMINAL',
  children,
  className = '',
}) => {
  return (
    <div className={`terminal-box rounded-sm bg-crt-black/80 backdrop-blur-sm ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-crt-amber/40">
        <div className="flex items-center gap-3">
          {/* Decorative buttons */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-crt-amber/60 shadow-amber-glow" />
            <div className="w-2.5 h-2.5 rounded-full border border-crt-amber/40" />
            <div className="w-2.5 h-2.5 rounded-full border border-crt-amber/40" />
          </div>
          {/* Title */}
          <span className="amber-text font-mono text-sm tracking-wider">
            {title} v3.0
          </span>
        </div>
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-crt-amberDim text-xs font-mono">ONLINE</span>
          <div className="w-2 h-2 rounded-full bg-crt-amber animate-pulse shadow-amber-glow" />
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 font-mono">
        {children}
      </div>
    </div>
  );
};

// Terminal text line component
export const TerminalLine: FC<{
  prefix?: string;
  label?: string;
  value?: string | number;
  className?: string;
  children?: ReactNode;
}> = ({ prefix = '>', label, value, className = '', children }) => {
  if (children) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-crt-amberDim">{prefix}</span>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-crt-amberDim">{prefix}</span>
      {label && <span className="text-crt-amber">{label}:</span>}
      {value !== undefined && (
        <span className="amber-text-bright">{value}</span>
      )}
    </div>
  );
};

// ASCII box component
export const AsciiBox: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`font-mono text-crt-amber ${className}`}>
      <div className="text-crt-amberDim">╔{'═'.repeat(36)}╗</div>
      <div className="flex">
        <span className="text-crt-amberDim">║</span>
        <div className="flex-1 px-2">{children}</div>
        <span className="text-crt-amberDim">║</span>
      </div>
      <div className="text-crt-amberDim">╚{'═'.repeat(36)}╝</div>
    </div>
  );
};

export default TerminalWindow;
