import { ExerciseId, PersonalRecord, UserStats, WorkoutHistoryEntry } from '../types/fitness';

const STORAGE_KEY = 'rep_ai_user_stats_v1';

const DEFAULT_RECORDS: Record<ExerciseId, PersonalRecord> = {
  'push-ups': { exerciseId: 'push-ups', bestReps: 0, bestScore: 0, bestStreak: 0, bestChallengeReps: 0 },
  'bicep-curls': { exerciseId: 'bicep-curls', bestReps: 0, bestScore: 0, bestStreak: 0, bestChallengeReps: 0 },
  'sit-ups': { exerciseId: 'sit-ups', bestReps: 0, bestScore: 0, bestStreak: 0, bestChallengeReps: 0 }
};

const DEFAULT_STATS: UserStats = {
  overallReps: 0,
  overallScore: 0,
  highestEverStreak: 0,
  records: DEFAULT_RECORDS,
  history: []
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      records: {
        ...DEFAULT_RECORDS,
        ...(parsed.records || {})
      },
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch (e) {
    console.error('Failed to load stats from localStorage:', e);
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats to localStorage:', e);
  }
}

export function recordWorkoutCompletion(entry: Omit<WorkoutHistoryEntry, 'id' | 'date' | 'timestamp'>): {
  stats: UserStats;
  isNewPersonalBestReps: boolean;
  isNewPersonalBestScore: boolean;
  isNewPersonalBestStreak: boolean;
} {
  const current = loadUserStats();
  const now = new Date();
  const fullEntry: WorkoutHistoryEntry = {
    ...entry,
    id: `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: now.toISOString().split('T')[0],
    timestamp: Date.now()
  };

  const exerciseRec = current.records[entry.exerciseId] || {
    exerciseId: entry.exerciseId,
    bestReps: 0,
    bestScore: 0,
    bestStreak: 0,
    bestChallengeReps: 0
  };

  const isNewPersonalBestReps = entry.reps > exerciseRec.bestReps;
  const isNewPersonalBestScore = entry.score > exerciseRec.bestScore;
  const isNewPersonalBestStreak = entry.highestStreak > exerciseRec.bestStreak;

  const updatedRec: PersonalRecord = {
    exerciseId: entry.exerciseId,
    bestReps: Math.max(exerciseRec.bestReps, entry.reps),
    bestScore: Math.max(exerciseRec.bestScore, entry.score),
    bestStreak: Math.max(exerciseRec.bestStreak, entry.highestStreak),
    bestChallengeReps:
      entry.mode === 'challenge-30s'
        ? Math.max(exerciseRec.bestChallengeReps, entry.reps)
        : exerciseRec.bestChallengeReps
  };

  const updatedStats: UserStats = {
    overallReps: current.overallReps + entry.reps,
    overallScore: current.overallScore + entry.score,
    highestEverStreak: Math.max(current.highestEverStreak, entry.highestStreak),
    records: {
      ...current.records,
      [entry.exerciseId]: updatedRec
    },
    history: [fullEntry, ...current.history].slice(0, 100) // retain latest 100
  };

  saveUserStats(updatedStats);

  return {
    stats: updatedStats,
    isNewPersonalBestReps,
    isNewPersonalBestScore,
    isNewPersonalBestStreak
  };
}

export function getTodayStats(stats: UserStats): { reps: number; points: number; bestStreak: number } {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntries = stats.history.filter((h) => h.date === todayStr);

  return {
    reps: todayEntries.reduce((sum, h) => sum + h.reps, 0),
    points: todayEntries.reduce((sum, h) => sum + h.score, 0),
    bestStreak: todayEntries.reduce((max, h) => Math.max(max, h.highestStreak), 0)
  };
}

export interface DayActivity {
  dayLabel: string;
  dayShort: string;
  reps: number;
  dateStr: string;
}

export function getThisWeekActivity(stats: UserStats): DayActivity[] {
  const now = new Date();
  // Get Monday of current week
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const days: DayActivity[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const repsForDay = stats.history
      .filter((h) => h.date === dateStr)
      .reduce((sum, h) => sum + h.reps, 0);

    days.push({
      dayLabel: dayNames[i],
      dayShort: dayNames[i],
      reps: repsForDay,
      dateStr
    });
  }

  return days;
}
