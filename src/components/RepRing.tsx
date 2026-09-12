import React from 'react';

interface RepRingProps {
  current: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  isGlowing?: boolean;
  accentColor?: string;
}

export const RepRing: React.FC<RepRingProps> = ({
  current,
  max,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  isGlowing = false,
  accentColor = '#88F78C'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedCurrent = Math.max(0, current);
  const progressRatio = max > 0 ? Math.min(1, clampedCurrent / max) : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div
      id="rep-ring-container"
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E6EAE6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-dashoffset 300ms cubic-bezier(0.16, 1, 0.3, 1), stroke 300ms ease'
          }}
          className={isGlowing ? 'drop-shadow-[0_0_8px_rgba(136,247,140,0.8)]' : ''}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        {label ? (
          <span className="font-display font-bold text-3xl text-[#151815] leading-none tabular-nums">
            {label}
          </span>
        ) : (
          <span className="font-display font-bold text-3xl text-[#151815] leading-none tabular-nums">
            {current}
          </span>
        )}
        {sublabel && (
          <span className="text-[11px] font-semibold tracking-wider text-[#737973] uppercase mt-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
