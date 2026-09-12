import React from 'react';
import { ArrowLeft, ArrowRight, Clock, Infinity as InfinityIcon, Target, Zap } from 'lucide-react';
import { ExerciseConfig, WorkoutMode } from '../types/fitness';

interface ModeSelectionModalProps {
  exercise: ExerciseConfig;
  onSelectMode: (mode: WorkoutMode) => void;
  onBack: () => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  exercise,
  onSelectMode,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <button
        id="mode-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#737973] hover:text-[#151815] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> BACK TO EXERCISES
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E1E6E1] text-xs font-bold text-[#35A83D] mb-3 shadow-xs">
          <span>SELECTED: {exercise.name}</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#151815] tracking-tight mb-2">
          CHOOSE YOUR MODE
        </h2>
        <p className="text-sm text-[#737973]">
          Select how you want to train today with computer vision tracking
        </p>
      </div>

      {/* Two Big Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE PLAY */}
        <div
          id="mode-card-free-play"
          onClick={() => onSelectMode('free-play')}
          className="group relative bg-white rounded-2xl border border-[#E1E6E1] p-8 flex flex-col justify-between hover:border-[#88F78C] hover:shadow-[0_12px_32px_-8px_rgba(136,247,140,0.3)] transition-all duration-300 cursor-pointer"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <InfinityIcon className="w-8 h-8 text-[#151815]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#737973]">
                ENDURANCE
              </span>
            </div>

            <h3 className="font-display text-3xl font-extrabold text-[#151815] tracking-tight mb-2">
              FREE PLAY
            </h3>
            <p className="text-sm text-[#737973] font-medium mb-6 leading-relaxed">
              No time limit. Just keep going. The AI counts every valid rep, tracks your streaks, and lets you push your own threshold.
            </p>

            <ul className="space-y-2 mb-8 text-xs text-[#151815] font-semibold">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#88F78C]" />
                Count reps continuously
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#88F78C]" />
                +15 bonus every 10 reps in a row
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#88F78C]" />
                Finish whenever you choose
              </li>
            </ul>
          </div>

          <button
            id="start-free-play-btn"
            className="w-full py-3.5 px-6 rounded-xl bg-[#151815] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 group-hover:bg-[#88F78C] group-hover:text-[#151815] transition-all shadow-xs"
          >
            START FREE PLAY <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 30 SEC CHALLENGE */}
        <div
          id="mode-card-challenge"
          onClick={() => onSelectMode('challenge-30s')}
          className="group relative bg-white rounded-2xl border-2 border-[#88F78C] p-8 flex flex-col justify-between shadow-[0_8px_30px_-6px_rgba(136,247,140,0.35)] hover:shadow-[0_16px_40px_-6px_rgba(136,247,140,0.5)] transition-all duration-300 cursor-pointer"
        >
          {/* Badge */}
          <div className="absolute top-4 right-4 bg-[#88F78C] text-[#151815] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <Zap className="w-3 h-3 fill-[#151815]" />
            ARCADE SPRINT
          </div>

          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#88F78C]/20 border border-[#88F78C] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-[#151815]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#35A83D]">
                00:30 TIMER
              </span>
            </div>

            <h3 className="font-display text-3xl font-extrabold text-[#151815] tracking-tight mb-2 flex items-center gap-2">
              30S CHALLENGE
            </h3>
            <p className="text-sm text-[#737973] font-medium mb-6 leading-relaxed">
              25 reps in 30 seconds. Beat the clock. Rapid fire pace with heightened urgency effects as the countdown reaches the final seconds.
            </p>

            <div className="p-3.5 rounded-xl bg-[#F5F7F5] border border-[#E1E6E1] mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-[#35A83D]" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#737973] block">GOAL</span>
                  <span className="font-display font-extrabold text-sm text-[#151815]">25 REPS</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#737973] block">TIME LIMIT</span>
                <span className="font-display font-extrabold text-sm text-[#151815] tabular-nums">30.0 SEC</span>
              </div>
            </div>
          </div>

          <button
            id="start-challenge-btn"
            className="w-full py-3.5 px-6 rounded-xl bg-[#88F78C] text-[#151815] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#151815] hover:text-[#88F78C] transition-all shadow-xs"
          >
            START CHALLENGE <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
