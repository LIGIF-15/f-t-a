import React from 'react';
import { Award, Calendar, Flame, Target, Trophy, Zap } from 'lucide-react';
import { UserStats } from '../types/fitness';
import { EXERCISES } from '../services/exerciseConfig';
import { getThisWeekActivity, getTodayStats } from '../services/storage';

interface ProgressDashboardProps {
  stats: UserStats;
  onStartTraining: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  onStartTraining
}) => {
  const today = getTodayStats(stats);
  const weekDays = getThisWeekActivity(stats);
  const maxWeekReps = Math.max(1, ...weekDays.map((d) => d.reps));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#737973]">
            ACTIVITY & RECORDS
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#151815] tracking-tight">
            PROGRESS DASHBOARD
          </h1>
        </div>
        <button
          id="dashboard-start-training-btn"
          onClick={onStartTraining}
          className="px-5 py-2.5 rounded-xl bg-[#151815] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#88F78C] hover:text-[#151815] transition-all cursor-pointer shadow-xs"
        >
          START NEW WORKOUT
        </button>
      </div>

      {/* TODAY SECTION */}
      <section className="mb-8">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#737973] mb-3">
          TODAY'S SUMMARY
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E1E6E1] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737973] block mb-1">
              TODAY'S REPS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl sm:text-5xl text-[#151815] tabular-nums">
                {today.reps}
              </span>
              <span className="text-xs font-bold text-[#737973] uppercase">REPS</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E1E6E1] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737973] block mb-1">
              TODAY'S POINTS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl sm:text-5xl text-[#151815] tabular-nums">
                {today.points}
              </span>
              <span className="text-xs font-bold text-[#35A83D] uppercase">PTS</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E1E6E1] shadow-xs">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737973] block">
                BEST STREAK
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl sm:text-5xl text-[#151815] tabular-nums">
                {today.bestStreak}
              </span>
              <span className="text-xs font-bold text-[#737973] uppercase">IN A ROW</span>
            </div>
          </div>
        </div>
      </section>

      {/* THIS WEEK MINIMALIST ACTIVITY BARS */}
      <section className="mb-10 bg-white rounded-2xl border border-[#E1E6E1] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737973] block">
              WEEKLY VOLUME
            </span>
            <h3 className="font-display text-xl font-extrabold text-[#151815]">
              THIS WEEK
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737973]">
            <span className="w-3 h-3 rounded-sm bg-[#88F78C]" />
            <span>Rep Count</span>
          </div>
        </div>

        {/* Minimalist Bar Chart */}
        <div className="space-y-3">
          {weekDays.map((day) => {
            const barWidthPercent = day.reps > 0 ? Math.max(10, Math.round((day.reps / maxWeekReps) * 100)) : 0;
            const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

            return (
              <div key={day.dateStr} className="flex items-center gap-4 text-xs">
                <span className={`w-10 font-bold uppercase ${isToday ? 'text-[#35A83D]' : 'text-[#737973]'}`}>
                  {day.dayShort}
                </span>

                <div className="flex-1 bg-[#F5F7F5] h-7 rounded-lg overflow-hidden flex items-center p-1 border border-[#E1E6E1]/50">
                  {day.reps > 0 ? (
                    <div
                      className="bg-[#88F78C] h-full rounded-md transition-all duration-500 flex items-center px-2 shadow-xs"
                      style={{ width: `${barWidthPercent}%` }}
                    >
                      <span className="font-display font-extrabold text-[11px] text-[#151815] tabular-nums">
                        {day.reps}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#A5ABA5] text-[11px] font-mono pl-2">—</span>
                  )}
                </div>

                <span className="w-12 text-right font-display font-bold text-[#151815] tabular-nums">
                  {day.reps > 0 ? `${day.reps} reps` : '0'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* EXERCISE-SPECIFIC PERSONAL RECORDS */}
      <section className="mb-10">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#737973] mb-3">
          EXERCISE PERSONAL RECORDS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['push-ups', 'bicep-curls', 'sit-ups'] as const).map((exId) => {
            const exConfig = EXERCISES[exId];
            const record = stats.records[exId];
            return (
              <div key={exId} className="bg-white rounded-2xl border border-[#E1E6E1] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-extrabold text-base text-[#151815]">
                    {exConfig.name}
                  </h4>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#F5F7F5]">
                    <span className="text-[#737973]">Best Reps</span>
                    <span className="font-display font-extrabold text-sm text-[#151815] tabular-nums">
                      {record?.bestReps ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#F5F7F5]">
                    <span className="text-[#737973]">Best Streak</span>
                    <span className="font-display font-extrabold text-sm text-[#151815] tabular-nums flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {record?.bestStreak ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#F5F7F5]">
                    <span className="text-[#737973]">Best Score</span>
                    <span className="font-display font-extrabold text-sm text-[#35A83D] tabular-nums">
                      {record?.bestScore ?? 0} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#737973]">30s Challenge Best</span>
                    <span className="font-display font-extrabold text-sm text-[#151815] tabular-nums">
                      {record?.bestChallengeReps ?? 0} / 25
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT WORKOUTS HISTORY */}
      {stats.history.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#E1E6E1] p-6 shadow-xs">
          <h3 className="font-display text-base font-extrabold text-[#151815] mb-4">
            RECENT WORKOUTS
          </h3>

          <div className="divide-y divide-[#E1E6E1]/60">
            {stats.history.slice(0, 8).map((h) => {
              const exName = EXERCISES[h.exerciseId]?.name || h.exerciseId;
              return (
                <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-[#151815] mr-2">{exName}</span>
                    <span className="text-[10px] uppercase font-bold text-[#737973] bg-[#F5F7F5] px-2 py-0.5 rounded-md">
                      {h.mode === 'challenge-30s' ? '30s Challenge' : 'Free Play'}
                    </span>
                    <span className="text-[#737973] ml-2 block sm:inline text-[11px]">{h.date}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-display font-extrabold text-sm text-[#151815] tabular-nums">
                        {h.reps}
                      </span>{' '}
                      <span className="text-[10px] text-[#737973]">REPS</span>
                    </div>
                    <div>
                      <span className="font-display font-extrabold text-sm text-[#35A83D] tabular-nums">
                        +{h.score}
                      </span>{' '}
                      <span className="text-[10px] text-[#737973]">PTS</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
