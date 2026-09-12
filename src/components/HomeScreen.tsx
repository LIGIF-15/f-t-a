import React, { useState } from 'react';
import { ArrowRight, Flame, Sparkles, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { ExerciseConfig, ExerciseId, PersonalRecord } from '../types/fitness';
import { EXERCISE_LIST } from '../services/exerciseConfig';
import { ExerciseVisual } from './ExerciseVisual';

interface HomeScreenProps {
  records: Record<ExerciseId, PersonalRecord>;
  onSelectExercise: (exercise: ExerciseConfig) => void;
  onOpenAbout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  records,
  onSelectExercise,
  onOpenAbout
}) => {
  const [hoveredExercise, setHoveredExercise] = useState<ExerciseId | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E1E6E1] text-xs font-semibold text-[#151815] mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#88F78C] animate-pulse" />
          <span>MoveNet Computer Vision Pose Estimation</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-[#151815] leading-[1.08] mb-4">
          TRAIN. COUNT.{' '}
          <span className="relative inline-block">
            <span className="relative z-10">BEAT YOUR STREAK.</span>
            <span className="absolute left-0 bottom-1.5 w-full h-3 bg-[#88F78C]/55 -z-10 rounded-sm" />
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#737973] max-w-xl mx-auto mb-8 leading-relaxed font-normal">
          AI-powered movement tracking that turns your workout into a game. Real-time webcam pose detection, zero video uploads, pure arcade momentum.
        </p>

        {/* Quick Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#151815] mb-6">
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E1E6E1]">
            <Zap className="w-3.5 h-3.5 text-[#35A83D]" /> +2 pts per rep
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E1E6E1]">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> +15 pts streak bonus
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E1E6E1]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#35A83D]" /> 100% on-device vision
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <a
            href="#exercise-selection"
            id="hero-start-btn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#151815] text-white font-bold text-sm hover:bg-[#88F78C] hover:text-[#151815] transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(136,247,140,0.5)] cursor-pointer"
          >
            CHOOSE EXERCISE <ArrowRight className="w-4 h-4" />
          </a>
          <button
            id="hero-how-it-works-btn"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#151815] border border-[#E1E6E1] font-semibold text-sm hover:border-[#88F78C] hover:bg-[#F5F7F5] transition-all cursor-pointer shadow-xs"
          >
            HOW IT WORKS
          </button>
        </div>
      </section>

      {/* Exercise Selection Grid */}
      <section id="exercise-selection" className="mb-14 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#737973]">
              Step 1 of 2
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151815] tracking-tight">
              CHOOSE YOUR EXERCISE
            </h2>
          </div>
          <p className="text-xs font-medium text-[#737973]">
            Select an exercise to initialize computer vision tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXERCISE_LIST.map((exercise) => {
            const isHovered = hoveredExercise === exercise.id;
            const record = records[exercise.id];
            const bestReps = record?.bestReps ?? 0;
            const bestStreak = record?.bestStreak ?? 0;

            return (
              <div
                key={exercise.id}
                id={`exercise-card-${exercise.id}`}
                onMouseEnter={() => setHoveredExercise(exercise.id)}
                onMouseLeave={() => setHoveredExercise(null)}
                onClick={() => onSelectExercise(exercise)}
                className={`group relative bg-white rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer ${
                  isHovered
                    ? 'border-[#88F78C] -translate-y-1.5 shadow-[0_12px_30px_-8px_rgba(136,247,140,0.35)]'
                    : 'border-[#E1E6E1] shadow-xs hover:border-[#88F78C]'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737973]">
                    {exercise.category}
                  </span>
                  {bestReps > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#151815] bg-[#F5F7F5] px-2 py-0.5 rounded-md">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>BEST {bestReps}</span>
                    </div>
                  )}
                </div>

                {/* Animated Visual */}
                <ExerciseVisual exerciseId={exercise.id} isHovered={isHovered} />

                {/* Info Block */}
                <div className="mt-4">
                  <h3 className="font-display text-xl font-extrabold text-[#151815] tracking-tight mb-1 group-hover:text-[#35A83D] transition-colors">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-[#737973] font-medium mb-4 line-clamp-2">
                    {exercise.description}
                  </p>

                  {/* Scoring stats */}
                  <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-xl bg-[#F5F7F5] border border-[#E1E6E1]/60 mb-5 text-[11px]">
                    <div>
                      <span className="text-[#737973] block text-[10px]">SCORING</span>
                      <span className="font-bold text-[#151815]">2 PTS / REP</span>
                    </div>
                    <div>
                      <span className="text-[#737973] block text-[10px]">BEST STREAK</span>
                      <span className="font-bold text-[#151815]">
                        {bestStreak > 0 ? `${bestStreak} reps` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Start Action Button */}
                  <button
                    id={`start-btn-${exercise.id}`}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                      isHovered
                        ? 'bg-[#88F78C] text-[#151815] shadow-xs'
                        : 'bg-[#151815] text-white group-hover:bg-[#88F78C] group-hover:text-[#151815]'
                    }`}
                  >
                    START {exercise.name}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern Arcade Gamification Banner */}
      <section className="bg-white rounded-2xl border border-[#E1E6E1] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F7F5] border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <span className="font-display font-extrabold text-[#35A83D] text-lg">2×</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#151815] mb-0.5">2 Points Every Rep</h4>
              <p className="text-xs text-[#737973]">
                Full range of motion verified through calibrated joint angles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F7F5] border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#151815] mb-0.5">+15 Streak Bonus</h4>
              <p className="text-xs text-[#737973]">
                Every 10 reps in a row triggers an arcade explosion and +15 combo score.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F7F5] border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#35A83D]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#151815] mb-0.5">30s / 25 Rep Challenge</h4>
              <p className="text-xs text-[#737973]">
                Beat the clock in our intense arcade sprint mode with urgent timer progression.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
