import React, { useState, useEffect } from 'react';
import { ExerciseConfig, ExerciseId, UserStats, WorkoutMode, WorkoutPhase, WorkoutStats } from './types/fitness';
import { EXERCISES } from './services/exerciseConfig';
import { loadUserStats, recordWorkoutCompletion } from './services/storage';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { CameraCheckScreen } from './components/CameraCheckScreen';
import { CountdownOverlay } from './components/CountdownOverlay';
import { WorkoutScreen } from './components/WorkoutScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AboutModal } from './components/AboutModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'progress' | 'about'>('workout');
  const [workoutPhase, setWorkoutPhase] = useState<WorkoutPhase>('idle');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig>(EXERCISES['push-ups']);
  const [selectedMode, setSelectedMode] = useState<WorkoutMode>('free-play');
  const [useSimulation, setUseSimulation] = useState<boolean>(false);

  // User stats & persistent data
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [latestWorkoutStats, setLatestWorkoutStats] = useState<WorkoutStats | null>(null);
  const [isNewPersonalBestReps, setIsNewPersonalBestReps] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);

  // Reload stats if needed
  useEffect(() => {
    setStats(loadUserStats());
  }, []);

  // Handle exercise selection from home
  const handleSelectExercise = (exercise: ExerciseConfig) => {
    setSelectedExercise(exercise);
    setWorkoutPhase('mode-select');
    setActiveTab('workout');
  };

  // Handle mode selection
  const handleSelectMode = (mode: WorkoutMode) => {
    setSelectedMode(mode);
    setWorkoutPhase('camera-check');
  };

  // Handle ready to start after camera preparation
  const handleReadyToStart = (simulated: boolean = false) => {
    setUseSimulation(simulated);
    setWorkoutPhase('countdown');
  };

  // Handle countdown complete
  const handleCountdownComplete = () => {
    setWorkoutPhase('active');
  };

  // Handle finish workout session
  const handleFinishWorkout = (finishedStats: WorkoutStats) => {
    setLatestWorkoutStats(finishedStats);

    const { stats: updatedStats, isNewPersonalBestReps: isNewPB } = recordWorkoutCompletion({
      exerciseId: finishedStats.exerciseId,
      mode: finishedStats.mode,
      reps: finishedStats.totalReps,
      score: finishedStats.score,
      highestStreak: finishedStats.highestStreak,
      challengeCompleted: finishedStats.mode === 'challenge-30s' && finishedStats.totalReps >= 25,
      durationSeconds: finishedStats.timeElapsed
    });

    setStats(updatedStats);
    setIsNewPersonalBestReps(isNewPB);
    setWorkoutPhase('complete');
  };

  // Restart same exercise & mode
  const handlePlayAgain = () => {
    setWorkoutPhase('countdown');
  };

  // Change exercise
  const handleChangeExercise = () => {
    setWorkoutPhase('idle');
  };

  // Navigation tab click
  const handleSelectTab = (tab: 'workout' | 'progress' | 'about') => {
    if (tab === 'about') {
      setAboutOpen(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'workout' && workoutPhase === 'complete') {
      setWorkoutPhase('idle');
    }
  };

  // Current record for active exercise
  const currentRecord = stats.records[selectedExercise.id];

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#151815] flex flex-col font-sans selection:bg-[#88F78C] selection:text-[#151815]">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        bestScore={stats.overallScore}
        highestStreak={stats.highestEverStreak}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <ProgressDashboard
            stats={stats}
            onStartTraining={() => {
              setActiveTab('workout');
              setWorkoutPhase('idle');
            }}
          />
        )}

        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <>
            {/* Phase 1: Home Screen / Exercise Selection */}
            {workoutPhase === 'idle' && (
              <HomeScreen
                records={stats.records}
                onSelectExercise={handleSelectExercise}
                onOpenAbout={() => setAboutOpen(true)}
              />
            )}

            {/* Phase 2: Mode Selection */}
            {workoutPhase === 'mode-select' && (
              <ModeSelectionModal
                exercise={selectedExercise}
                onSelectMode={handleSelectMode}
                onBack={() => setWorkoutPhase('idle')}
              />
            )}

            {/* Phase 3: Camera Calibration Check */}
            {workoutPhase === 'camera-check' && (
              <CameraCheckScreen
                exercise={selectedExercise}
                mode={selectedMode}
                onReadyToStart={handleReadyToStart}
                onBack={() => setWorkoutPhase('mode-select')}
              />
            )}

            {/* Phase 4: 3-2-1-GO! Countdown Overlay */}
            {workoutPhase === 'countdown' && (
              <CountdownOverlay onComplete={handleCountdownComplete} />
            )}

            {/* Phase 5: Active Workout Screen with Live Pose Estimation */}
            {workoutPhase === 'active' && (
              <WorkoutScreen
                exercise={selectedExercise}
                mode={selectedMode}
                personalBestReps={currentRecord?.bestReps ?? 0}
                personalBestStreak={currentRecord?.bestStreak ?? 0}
                useSimulation={useSimulation}
                onFinishWorkout={handleFinishWorkout}
              />
            )}

            {/* Phase 6: Post-Workout Results & Personal Best Comparison */}
            {workoutPhase === 'complete' && latestWorkoutStats && (
              <ResultsScreen
                stats={latestWorkoutStats}
                exercise={selectedExercise}
                personalBestReps={currentRecord?.bestReps ?? 0}
                isNewPersonalBestReps={isNewPersonalBestReps}
                onPlayAgain={handlePlayAgain}
                onChangeExercise={handleChangeExercise}
                onViewProgress={() => setActiveTab('progress')}
              />
            )}
          </>
        )}
      </main>

      {/* About & Instructions Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
