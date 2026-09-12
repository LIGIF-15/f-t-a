export type ExerciseId = 'push-ups' | 'bicep-curls' | 'sit-ups';

export type WorkoutMode = 'free-play' | 'challenge-30s';

export type WorkoutPhase =
  | 'idle'
  | 'mode-select'
  | 'camera-check'
  | 'countdown'
  | 'active'
  | 'paused'
  | 'complete'
  | 'timeout';

export interface ExerciseConfig {
  id: ExerciseId;
  name: string;
  tagline: string;
  category: string;
  description: string;
  requiredLandmarks: string[];
  cameraGuidance: string;
  positioningTips: string[];
  prepMessage: string;
}

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export type RepStage = 'ready' | 'starting' | 'halfway' | 'recovering' | 'completed';

export interface ExerciseAnalysisResult {
  isRepCompleted: boolean;
  currentStage: RepStage;
  progressPercent: number; // 0 to 100% of current rep
  feedbackMessage: string;
  isFormAcceptable: boolean;
  confidence: number;
  angles: Record<string, number>;
}

export interface WorkoutStats {
  exerciseId: ExerciseId;
  mode: WorkoutMode;
  totalReps: number;
  score: number;
  currentStreak: number;
  highestStreak: number;
  targetReps: number; // 25 for challenge
  timeElapsed: number; // in seconds
  timeRemaining: number; // 30s countdown for challenge
  isNewPersonalBest: boolean;
  bonusCount: number; // number of +15 bonuses hit
  startTime: number;
  endTime?: number;
}

export interface PersonalRecord {
  exerciseId: ExerciseId;
  bestReps: number;
  bestScore: number;
  bestStreak: number;
  bestChallengeReps: number;
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  timestamp: number;
  exerciseId: ExerciseId;
  mode: WorkoutMode;
  reps: number;
  score: number;
  highestStreak: number;
  challengeCompleted?: boolean;
  durationSeconds: number;
}

export interface UserStats {
  overallReps: number;
  overallScore: number;
  highestEverStreak: number;
  records: Record<ExerciseId, PersonalRecord>;
  history: WorkoutHistoryEntry[];
}
