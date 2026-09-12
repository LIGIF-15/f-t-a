import React, { useEffect, useState } from 'react';
import { soundEffects } from '../services/audioEffects';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    soundEffects.playCountdownBeep(false);

    const timer1 = setTimeout(() => {
      setCount(2);
      soundEffects.playCountdownBeep(false);
    }, 900);

    const timer2 = setTimeout(() => {
      setCount(1);
      soundEffects.playCountdownBeep(false);
    }, 1800);

    const timer3 = setTimeout(() => {
      setCount(0); // 0 means GO!
      soundEffects.playCountdownBeep(true);
    }, 2700);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div
      id="countdown-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#151815]/75 backdrop-blur-md select-none animate-in fade-in duration-200"
    >
      <div className="text-center flex flex-col items-center">
        <div
          key={count}
          className="font-display font-extrabold text-8xl sm:text-9xl text-white tracking-tighter drop-shadow-[0_0_35px_rgba(136,247,140,0.8)] scale-100 transition-transform duration-300"
        >
          {count > 0 ? (
            <span className="text-white">{count}</span>
          ) : (
            <span className="text-[#88F78C]">GO!</span>
          )}
        </div>
        <p className="text-sm uppercase tracking-widest text-[#88F78C] font-extrabold mt-4">
          {count > 0 ? 'GET INTO POSITION' : 'START REPPING!'}
        </p>
      </div>
    </div>
  );
};
