import React from 'react';
import { ExerciseId } from '../types/fitness';

interface ExerciseVisualProps {
  exerciseId: ExerciseId;
  isHovered?: boolean;
  isActive?: boolean;
}

export const ExerciseVisual: React.FC<ExerciseVisualProps> = ({
  exerciseId,
  isHovered = false,
  isActive = false
}) => {
  if (exerciseId === 'push-ups') {
    return (
      <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#88F78C_1px,transparent_1px)] [background-size:12px_12px]" />
        <svg
          viewBox="0 0 200 120"
          className={`w-44 h-28 transition-transform duration-500 ease-out ${
            isHovered ? 'scale-105 -translate-y-1' : ''
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground floor line */}
          <line x1="20" y1="105" x2="180" y2="105" stroke="#E1E6E1" strokeWidth="2" strokeDasharray="4 4" />

          {/* Body plank line */}
          <path
            d={isHovered || isActive ? "M45 92 L75 88 L125 72 L160 55" : "M45 95 L75 85 L125 65 L160 50"}
            stroke="#151815"
            strokeWidth="4.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Head */}
          <circle
            cx={isHovered || isActive ? "175" : "175"}
            cy={isHovered || isActive ? "50" : "45"}
            r="9"
            fill="#151815"
            className="transition-all duration-300"
          />

          {/* Arms / Pushup mechanic */}
          {/* Shoulder to elbow to hand */}
          <polyline
            points={
              isHovered || isActive
                ? "155,56 160,82 145,105" // bent elbow, deeper down
                : "155,52 148,78 142,105" // arms more extended
            }
            stroke="#88F78C"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Hands ground contact */}
          <circle cx="145" cy="105" r="3.5" fill="#151815" />
          {/* Feet ground contact */}
          <circle cx="45" cy="103" r="3.5" fill="#151815" />

          {/* Neon joint dots */}
          <circle cx="155" cy={isHovered || isActive ? "56" : "52"} r="3" fill="#88F78C" />
          <circle cx={isHovered || isActive ? "160" : "148"} cy={isHovered || isActive ? "82" : "78"} r="3" fill="#88F78C" />
          <circle cx="125" cy={isHovered || isActive ? "72" : "65"} r="3" fill="#151815" />
        </svg>
      </div>
    );
  }

  if (exerciseId === 'bicep-curls') {
    return (
      <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#88F78C_1px,transparent_1px)] [background-size:12px_12px]" />
        <svg
          viewBox="0 0 200 120"
          className={`w-44 h-28 transition-transform duration-500 ease-out ${
            isHovered ? 'scale-105 -translate-y-1' : ''
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Torso & Head */}
          <circle cx="85" cy="28" r="9" fill="#151815" />
          <line x1="85" y1="38" x2="85" y2="85" stroke="#151815" strokeWidth="4.5" strokeLinecap="round" />
          {/* Legs */}
          <line x1="85" y1="85" x2="75" y2="112" stroke="#151815" strokeWidth="4" strokeLinecap="round" />
          <line x1="85" y1="85" x2="95" y2="112" stroke="#151815" strokeWidth="4" strokeLinecap="round" />

          {/* Left passive arm */}
          <polyline points="85,46 72,68 70,90" stroke="#737973" strokeWidth="3" strokeLinecap="round" />

          {/* Right active arm doing curl */}
          <polyline
            points={
              isHovered || isActive
                ? "85,46 100,68 95,50" // curled up
                : "85,46 100,68 100,92" // extended down
            }
            stroke="#88F78C"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Dumbbell / Hand weight */}
          <rect
            x={isHovered || isActive ? "88" : "93"}
            y={isHovered || isActive ? "42" : "88"}
            width="14"
            height="8"
            rx="2"
            fill="#151815"
            className="transition-all duration-300"
          />

          {/* Joint nodes */}
          <circle cx="85" cy="46" r="3" fill="#151815" />
          <circle cx="100" cy="68" r="3.5" fill="#88F78C" />
          <circle cx={isHovered || isActive ? "95" : "100"} cy={isHovered || isActive ? "50" : "92"} r="3.5" fill="#88F78C" />
        </svg>
      </div>
    );
  }

  // Sit-ups
  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#88F78C_1px,transparent_1px)] [background-size:12px_12px]" />
      <svg
        viewBox="0 0 200 120"
        className={`w-44 h-28 transition-transform duration-500 ease-out ${
          isHovered ? 'scale-105 -translate-y-1' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floor line */}
        <line x1="20" y1="105" x2="180" y2="105" stroke="#E1E6E1" strokeWidth="2" strokeDasharray="4 4" />

        {/* Legs with bent knees */}
        <polyline points="95,102 125,75 145,104" stroke="#151815" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Torso & Head */}
        {isHovered || isActive ? (
          // Seated up posture
          <>
            <polyline points="95,102 75,70 65,52" stroke="#88F78C" strokeWidth="4.5" strokeLinecap="round" className="transition-all duration-300" />
            <circle cx="60" cy="42" r="9" fill="#151815" className="transition-all duration-300" />
            {/* Arms reaching to knees */}
            <polyline points="72,66 90,68 115,75" stroke="#151815" strokeWidth="3" strokeLinecap="round" />
            <circle cx="95" cy="102" r="3.5" fill="#151815" />
            <circle cx="75" cy="70" r="3.5" fill="#88F78C" />
          </>
        ) : (
          // Lying back posture
          <>
            <polyline points="95,102 65,102 40,102" stroke="#88F78C" strokeWidth="4.5" strokeLinecap="round" className="transition-all duration-300" />
            <circle cx="28" cy="98" r="9" fill="#151815" className="transition-all duration-300" />
            {/* Hands near ears */}
            <polyline points="50,100 42,90 32,92" stroke="#151815" strokeWidth="3" strokeLinecap="round" />
            <circle cx="95" cy="102" r="3.5" fill="#151815" />
            <circle cx="65" cy="102" r="3.5" fill="#88F78C" />
          </>
        )}

        {/* Knees node */}
        <circle cx="125" cy="75" r="3" fill="#151815" />
        <circle cx="145" cy="104" r="3" fill="#151815" />
      </svg>
    </div>
  );
};
