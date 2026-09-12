import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { ExerciseAnalysisResult, ExerciseConfig, WorkoutMode, WorkoutStats } from '../types/fitness';
import { drawPoseSkeleton, estimatePoseFromVideo, getPoseDetector } from '../services/poseDetector';
import { ExerciseRepTracker } from '../services/exerciseAnalyzer';
import { soundEffects } from '../services/audioEffects';
import { RepRing } from './RepRing';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface WorkoutScreenProps {
  exercise: ExerciseConfig;
  mode: WorkoutMode;
  personalBestReps: number;
  personalBestStreak: number;
  useSimulation?: boolean;
  onFinishWorkout: (stats: WorkoutStats) => void;
}

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({
  exercise,
  mode,
  personalBestReps,
  personalBestStreak,
  useSimulation = false,
  onFinishWorkout
}) => {
  // Video & Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const trackerRef = useRef<ExerciseRepTracker>(new ExerciseRepTracker(exercise.id));

  // Workout state
  const [reps, setReps] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [bonusCount, setBonusCount] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(soundEffects.isEnabled());

  // Challenge timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  // Micro-interaction animations
  const [repBounce, setRepBounce] = useState<boolean>(false);
  const [showPlusTwo, setShowPlusTwo] = useState<boolean>(false);
  const [streakBonusActive, setStreakBonusActive] = useState<{ show: boolean; reps: number }>({
    show: false,
    reps: 0
  });
  const [screenFlash, setScreenFlash] = useState<boolean>(false);
  const [guidanceMessage, setGuidanceMessage] = useState<string>(exercise.prepMessage);
  const [repProgressPercent, setRepProgressPercent] = useState<number>(0);

  // Simulation mode support
  const [isSimulated, setIsSimulated] = useState<boolean>(useSimulation);

  // Sound toggle
  const toggleSound = () => {
    const next = !soundOn;
    soundEffects.setEnabled(next);
    setSoundOn(next);
  };

  // Trigger rep completion
  const handleRepCompleted = useCallback(() => {
    setReps((prevReps) => {
      const newReps = prevReps + 1;

      // Update streak
      setStreak((prevStreak) => {
        const nextStreak = prevStreak + 1;
        setHighestStreak((prevHigh) => Math.max(prevHigh, nextStreak));

        // Streak bonus check: every multiple of 10
        if (nextStreak > 0 && nextStreak % 10 === 0) {
          setScore((s) => s + 2 + 15);
          setBonusCount((b) => b + 1);

          // Audio and visual celebration
          soundEffects.playStreakBonusSound();
          setStreakBonusActive({ show: true, reps: nextStreak });
          setScreenFlash(true);

          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#88F78C', '#35A83D', '#FFFFFF']
            });
          } catch {
            // Safe fallback
          }

          setTimeout(() => {
            setStreakBonusActive({ show: false, reps: 0 });
            setScreenFlash(false);
          }, 1200);
        } else {
          setScore((s) => s + 2);
          soundEffects.playRepSound(Math.min(nextStreak, 10));
        }

        return nextStreak;
      });

      // Visual micro-interaction
      setRepBounce(true);
      setShowPlusTwo(true);
      setTimeout(() => setRepBounce(false), 250);
      setTimeout(() => setShowPlusTwo(false), 650);

      // Check challenge target completion
      if (mode === 'challenge-30s' && newReps >= 25) {
        soundEffects.playChallengeVictory();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#88F78C', '#35A83D', '#FFFFFF', '#FFD700']
          });
        } catch {}
      }

      return newReps;
    });
  }, [mode]);

  // Finish Workout Action
  const finishSession = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    const finalStats: WorkoutStats = {
      exerciseId: exercise.id,
      mode,
      totalReps: reps,
      score,
      currentStreak: streak,
      highestStreak,
      targetReps: 25,
      timeElapsed,
      timeRemaining: mode === 'challenge-30s' ? timeRemaining : 0,
      isNewPersonalBest: reps > personalBestReps,
      bonusCount,
      startTime: startTimeRef.current,
      endTime: Date.now()
    };

    onFinishWorkout(finalStats);
  }, [
    exercise.id,
    mode,
    reps,
    score,
    streak,
    highestStreak,
    timeElapsed,
    timeRemaining,
    personalBestReps,
    bonusCount,
    onFinishWorkout
  ]);

  // Check Challenge Completion or Timeout
  useEffect(() => {
    if (mode === 'challenge-30s' && reps >= 25) {
      const timer = setTimeout(() => {
        finishSession();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [reps, mode, finishSession]);

  // Challenge Timer Countdown Loop
  useEffect(() => {
    if (mode !== 'challenge-30s' || isPaused) return;

    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        setTimeElapsed((t) => t + 1);

        // Sound urgency in last 5 seconds
        if (next <= 5 && next > 0) {
          soundEffects.playTimerTick();
        }

        if (next <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimeout(() => {
            finishSession();
          }, 500);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [mode, isPaused, finishSession]);

  // Free play elapsed timer
  useEffect(() => {
    if (mode === 'challenge-30s' || isPaused) return;

    const timer = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isPaused]);

  // Camera & MoveNet detection setup
  useEffect(() => {
    if (isSimulated) return;

    let active = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSimulated(true);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });

        streamRef.current = stream;
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        const detector = await getPoseDetector();
        if (active) {
          detectorRef.current = detector;
        }
      } catch (err) {
        console.warn('Camera failed to start in workout view, using simulator fallback:', err);
        if (active) setIsSimulated(true);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSimulated]);

  // MoveNet detection frame loop
  useEffect(() => {
    if (isSimulated) return;

    let active = true;

    const runDetection = async () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;
      const tracker = trackerRef.current;

      if (video && canvas && detector && video.readyState >= 2 && !video.paused && !isPaused) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const pose = await estimatePoseFromVideo(detector, video);
        if (pose && active) {
          const analysis: ExerciseAnalysisResult = tracker.analyze(pose);

          setGuidanceMessage(analysis.feedbackMessage);
          setRepProgressPercent(analysis.progressPercent);

          if (analysis.isRepCompleted) {
            handleRepCompleted();
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawPoseSkeleton(ctx, pose, canvas.width, canvas.height, {
              accentColor: '#88F78C',
              isRepActive: analysis.progressPercent > 30,
              confidenceThreshold: 0.25
            });
          }
        }
      }

      if (active) {
        animFrameIdRef.current = requestAnimationFrame(runDetection);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(runDetection);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isSimulated, isPaused, handleRepCompleted]);

  // Formatted timer string
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Streak glow intensity class
  const getStreakBadgeClass = () => {
    if (streak >= 10) {
      return 'bg-[#88F78C] text-[#151815] shadow-[0_0_20px_rgba(136,247,140,0.85)] animate-pulse';
    }
    if (streak >= 5) {
      return 'bg-amber-100 text-amber-900 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    }
    return 'bg-white text-[#151815] border border-[#E1E6E1]';
  };

  return (
    <div
      id="workout-screen"
      className={`relative min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 ${
        screenFlash ? 'bg-[#88F78C]/20' : 'bg-[#F5F7F5]'
      }`}
    >
      {/* Top HUD Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4 mb-4">
        {/* Left: Exercise & Mode info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#151815] flex items-center justify-center shadow-xs">
            <span className="font-display font-extrabold text-[#88F78C] text-sm">//</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#151815]">
                {exercise.name}
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#E1E6E1] text-[#35A83D]">
                {mode === 'challenge-30s' ? '30S CHALLENGE' : 'FREE PLAY'}
              </span>
            </div>
            <p className="text-[11px] text-[#737973] font-medium hidden sm:block">
              {isSimulated ? 'Running in Sensor Simulator mode' : 'Live MoveNet AI pose tracking active'}
            </p>
          </div>
        </div>

        {/* Right: Controls & Finish Button */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            id="workout-pause-btn"
            onClick={() => setIsPaused(!isPaused)}
            className="w-10 h-10 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center text-[#151815] hover:border-[#88F78C] transition-all cursor-pointer shadow-xs"
            title={isPaused ? 'Resume Workout' : 'Pause Workout'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            id="workout-sound-btn"
            onClick={toggleSound}
            className="w-10 h-10 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center text-[#151815] hover:border-[#88F78C] transition-all cursor-pointer shadow-xs"
            title={soundOn ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#737973]" />}
          </button>

          {/* Finish Button */}
          <button
            id="workout-finish-btn"
            onClick={finishSession}
            className="px-4 py-2 rounded-xl bg-[#151815] text-white font-bold text-xs tracking-wider uppercase hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>FINISH</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Dominant Video Feed + Skeleton + Rep Overlay */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="relative w-full aspect-16/10 max-h-[62vh] sm:max-h-[68vh] bg-[#151815] rounded-3xl overflow-hidden shadow-xl border border-[#151815] flex items-center justify-center">
          {/* Live Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isSimulated ? 'hidden' : 'block'
            }`}
          />

          {/* Pose Skeleton Overlay */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 ${
              isSimulated ? 'hidden' : 'block'
            }`}
          />

          {/* Simulated Mode Visualizer if no camera */}
          {isSimulated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#151815] via-[#1a1f1b] to-[#151815]">
              <div className="w-24 h-24 rounded-full bg-[#88F78C]/15 border border-[#88F78C] flex items-center justify-center mb-4 glow-neon-pulse">
                <span className="font-display font-black text-2xl text-[#88F78C]">AI</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white mb-1">
                SENSOR SIMULATION ACTIVE
              </h3>
              <p className="text-xs text-white/70 max-w-sm mb-6">
                Click "Simulate Rep (+1)" or press Spacebar to trigger AI repetitions and test the entire streak, scoring, and challenge progression!
              </p>
              <button
                id="simulate-rep-action-btn"
                onClick={handleRepCompleted}
                className="px-6 py-3 rounded-xl bg-[#88F78C] text-[#151815] font-extrabold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(136,247,140,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                + SIMULATE VALID REP
              </button>
            </div>
          )}

          {/* Streak Bonus Celebration Explosion Overlay */}
          {streakBonusActive.show && (
            <div
              id="streak-bonus-overlay"
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs animate-streak-bonus pointer-events-none"
            >
              <div className="text-amber-300 text-3xl mb-1">✦ ✦ ✦</div>
              <div className="font-display font-black text-4xl sm:text-6xl text-[#88F78C] tracking-tighter drop-shadow-[0_0_30px_rgba(136,247,140,0.9)]">
                STREAK BONUS
              </div>
              <div className="font-display font-extrabold text-7xl sm:text-8xl text-white my-1 drop-shadow-lg">
                +15
              </div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#88F78C] tracking-wider">
                {streakBonusActive.reps} REPS IN A ROW!
              </div>
            </div>
          )}

          {/* Floating "+2" Floating Score Pill */}
          {showPlusTwo && (
            <div
              id="rep-plus-two-indicator"
              className="absolute top-10 right-10 z-20 font-display font-black text-3xl sm:text-4xl text-[#88F78C] drop-shadow-[0_0_16px_rgba(136,247,140,0.85)] animate-bounce"
            >
              +2
            </div>
          )}

          {/* Top Overlays on Video: Timer (for Challenge) or Form Guidance */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            {/* Form Guidance Pill */}
            <div className="bg-black/60 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#88F78C] animate-ping" />
              <span>{guidanceMessage}</span>
            </div>

            {/* In Challenge Mode: Urgent Timer HUD */}
            {mode === 'challenge-30s' && (
              <div
                id="challenge-timer-hud"
                className={`px-4 py-2 rounded-2xl backdrop-blur-md border transition-all ${
                  timeRemaining <= 5
                    ? 'bg-red-500/90 text-white border-red-400 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                    : timeRemaining <= 15
                    ? 'bg-amber-500/80 text-white border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-black/65 text-[#88F78C] border-[#88F78C]/40'
                }`}
              >
                <div className="text-[9px] font-extrabold uppercase tracking-widest block text-center opacity-80">
                  TIME REMAINING
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl tabular-nums text-center leading-none">
                  {formatTimer(timeRemaining)}
                </div>
              </div>
            )}
          </div>

          {/* Giant Center Rep Counter HUD (Overlaid subtly or positioned clearly) */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
            {/* Giant Rep Counter */}
            <div className="flex items-center gap-4 bg-black/65 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
              {/* Animated Rep Ring */}
              <div className="shrink-0">
                <RepRing
                  current={mode === 'challenge-30s' ? reps : streak % 10}
                  max={mode === 'challenge-30s' ? 25 : 10}
                  size={76}
                  strokeWidth={7}
                  label={String(reps)}
                  sublabel={mode === 'challenge-30s' ? '/25' : 'REPS'}
                  isGlowing={streak >= 5}
                  accentColor="#88F78C"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span
                    id="workout-rep-count-display"
                    className={`font-display font-black text-5xl sm:text-6xl text-white tabular-nums tracking-tighter transition-transform duration-150 ${
                      repBounce ? 'scale-115 text-[#88F78C]' : 'scale-100'
                    }`}
                  >
                    {reps}
                  </span>
                  <span className="font-display font-extrabold text-sm uppercase text-[#88F78C] tracking-wider">
                    {mode === 'challenge-30s' ? `/ 25 TARGET` : 'REPS'}
                  </span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-[#88F78C] h-full transition-all duration-150 rounded-full"
                    style={{ width: `${Math.min(100, repProgressPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Score & Streak Block */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Score card */}
              <div className="bg-black/65 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#88F78C] block">
                  SCORE
                </span>
                <span
                  id="workout-score-display"
                  className="font-display font-black text-2xl sm:text-3xl text-white tabular-nums leading-none"
                >
                  {score}
                </span>
              </div>

              {/* Streak card */}
              <div
                id="workout-streak-card"
                className={`px-4 py-2.5 rounded-2xl backdrop-blur-md text-center min-w-[90px] transition-all ${
                  streak >= 10
                    ? 'bg-[#88F78C] text-[#151815] shadow-[0_0_20px_rgba(136,247,140,0.85)]'
                    : 'bg-black/65 text-white border border-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Flame
                    className={`w-3.5 h-3.5 ${
                      streak >= 10
                        ? 'text-[#151815] fill-[#151815]'
                        : 'text-amber-400 fill-amber-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                      streak >= 10 ? 'text-[#151815]' : 'text-amber-400'
                    }`}
                  >
                    STREAK
                  </span>
                </div>
                <span
                  id="workout-streak-display"
                  className="font-display font-black text-2xl sm:text-3xl tabular-nums leading-none"
                >
                  {streak}
                </span>
              </div>

              {/* Best streak */}
              <div className="bg-black/65 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[80px] hidden md:block">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737973] block">
                  BEST
                </span>
                <span className="font-display font-extrabold text-xl sm:text-2xl text-white/90 tabular-nums leading-none">
                  {Math.max(highestStreak, personalBestStreak)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar: Testing fallback button & stats summary */}
      <div className="max-w-6xl mx-auto w-full mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#737973]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-[#151815]">
            <span className="w-2 h-2 rounded-full bg-[#88F78C]" />
            2 PTS / REP
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-[#151815]">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            +15 BONUS AT 10 REPS
          </span>
          {bonusCount > 0 && (
            <span className="bg-[#88F78C]/25 text-[#35A83D] font-bold px-2 py-0.5 rounded-full text-[11px]">
              {bonusCount}× BONUSES HIT!
            </span>
          )}
        </div>

        {/* Quick simulator rep trigger for keyboard/tap test */}
        <div className="flex items-center gap-2">
          <button
            id="manual-test-rep-btn"
            onClick={handleRepCompleted}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E6E1] text-[#151815] font-bold text-[11px] hover:border-[#88F78C] hover:bg-[#F5F7F5] transition-all cursor-pointer shadow-xs"
            title="Trigger a valid rep count for testing"
          >
            + SIMULATE REP
          </button>
        </div>
      </div>
    </div>
  );
};
