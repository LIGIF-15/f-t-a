import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, Flame, RotateCcw, Target, Trophy, XCircle, Zap } from 'lucide-react';
import { ExerciseConfig, WorkoutStats } from '../types/fitness';

interface ResultsScreenProps {
  stats: WorkoutStats;
  exercise: ExerciseConfig;
  personalBestReps: number;
  isNewPersonalBestReps: boolean;
  onPlayAgain: () => void;
  onChangeExercise: () => void;
  onViewProgress: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  stats,
  exercise,
  personalBestReps,
  isNewPersonalBestReps,
  onPlayAgain,
  onChangeExercise,
  onViewProgress
}) => {
  const isChallenge = stats.mode === 'challenge-30s';
  const challengePassed = isChallenge && stats.totalReps >= 25;
  const repsShort = isChallenge ? Math.max(0, 25 - stats.totalReps) : 0;
  const repsFromBest = Math.max(0, personalBestReps - stats.totalReps);

  useEffect(() => {
    if (challengePassed || isNewPersonalBestReps) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#88F78C', '#35A83D', '#FFFFFF', '#FFD700']
        });
      } catch {}
    }
  }, [challengePassed, isNewPersonalBestReps]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Celebration Header Card */}
      <div className="bg-white rounded-3xl border border-[#E1E6E1] p-6 sm:p-10 shadow-sm text-center relative overflow-hidden mb-6">
        {/* Neon accent top border bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#88F78C]" />

        {/* Challenge outcome banner */}
        {isChallenge && (
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
            {challengePassed ? (
              <span className="bg-[#88F78C] text-[#151815] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> 25 / 25 CHALLENGE COMPLETE
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> TIME'S UP • {repsShort} REPS SHORT
              </span>
            )}
          </div>
        )}

        <h2 className="font-display font-black text-3xl sm:text-5xl text-[#151815] tracking-tight mb-2">
          {challengePassed ? 'CHALLENGE CRUSHED!' : 'WORKOUT COMPLETE'}
        </h2>
        <p className="text-sm font-semibold text-[#737973] uppercase tracking-wider mb-8">
          {exercise.name} • {isChallenge ? '30 SECOND CHALLENGE' : 'FREE PLAY'}
        </p>

        {/* Primary Reps & Score Big Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Reps */}
          <div className="p-6 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1]">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#737973] block mb-1">
              TOTAL REPS
            </span>
            <span
              id="result-reps-count"
              className="font-display font-black text-5xl sm:text-6xl text-[#151815] tabular-nums block leading-none"
            >
              {stats.totalReps}
            </span>
            {isChallenge && (
              <span className="text-[11px] font-bold text-[#737973] mt-2 block">
                Target: 25 Reps
              </span>
            )}
          </div>

          {/* Final Score */}
          <div className="p-6 rounded-2xl bg-[#151815] text-white border border-[#151815]">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#88F78C] block mb-1">
              TOTAL SCORE
            </span>
            <span
              id="result-score-count"
              className="font-display font-black text-5xl sm:text-6xl text-white tabular-nums block leading-none"
            >
              {stats.score}
            </span>
            <span className="text-[11px] font-bold text-[#88F78C] mt-2 block">
              {stats.bonusCount > 0 ? `+${stats.bonusCount * 15} Streak Bonuses` : '2 pts per rep'}
            </span>
          </div>

          {/* Best Streak */}
          <div className="p-6 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#737973] block">
                BEST STREAK
              </span>
            </div>
            <span
              id="result-streak-count"
              className="font-display font-black text-5xl sm:text-6xl text-[#151815] tabular-nums block leading-none"
            >
              {stats.highestStreak}
            </span>
            <span className="text-[11px] font-bold text-[#737973] mt-2 block">
              Consecutive Reps
            </span>
          </div>
        </div>

        {/* Personal Record Comparison Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1] mb-8 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737973] block">
                PERSONAL BEST COMPARISON
              </span>
              {isNewPersonalBestReps ? (
                <span className="font-display font-extrabold text-base text-[#35A83D] flex items-center gap-1">
                  🏆 NEW PERSONAL BEST! ({stats.totalReps} Reps)
                </span>
              ) : (
                <span className="font-bold text-sm text-[#151815]">
                  Personal Best: {personalBestReps} Reps{' '}
                  <span className="text-[#737973] font-normal">
                    ({repsFromBest === 0 ? 'Tied your record' : `${repsFromBest} reps away`})
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737973] block">
              DURATION
            </span>
            <span className="font-display font-bold text-base text-[#151815] tabular-nums">
              {formatDuration(stats.timeElapsed)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="result-play-again-btn"
            onClick={onPlayAgain}
            className="py-3.5 px-5 rounded-xl bg-[#88F78C] text-[#151815] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#151815] hover:text-[#88F78C] transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>

          <button
            id="result-change-exercise-btn"
            onClick={onChangeExercise}
            className="py-3.5 px-5 rounded-xl bg-[#151815] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#88F78C] hover:text-[#151815] transition-all shadow-xs cursor-pointer"
          >
            CHANGE EXERCISE
          </button>

          <button
            id="result-view-progress-btn"
            onClick={onViewProgress}
            className="py-3.5 px-5 rounded-xl bg-white border border-[#E1E6E1] text-[#151815] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-[#88F78C] hover:bg-[#F5F7F5] transition-all shadow-xs cursor-pointer"
          >
            VIEW PROGRESS <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
