import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, Play, RefreshCw, Shield, Sparkles, VideoOff } from 'lucide-react';
import { ExerciseConfig, WorkoutMode } from '../types/fitness';
import { drawPoseSkeleton, estimatePoseFromVideo, getPoseDetector } from '../services/poseDetector';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface CameraCheckScreenProps {
  exercise: ExerciseConfig;
  mode: WorkoutMode;
  onReadyToStart: (useSimulation?: boolean) => void;
  onBack: () => void;
}

export const CameraCheckScreen: React.FC<CameraCheckScreenProps> = ({
  exercise,
  mode,
  onReadyToStart,
  onBack
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);

  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'denied' | 'error'>('requesting');
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [poseConfidence, setPoseConfidence] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Start webcam
  const startCamera = async () => {
    setCameraState('requesting');
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState('active');
    } catch (err: unknown) {
      console.warn('Webcam access error:', err);
      const errStr = (err as Error)?.message || '';
      if (errStr.includes('denied') || errStr.includes('NotAllowedError') || (err as Error)?.name === 'NotAllowedError') {
        setCameraState('denied');
      } else {
        setCameraState('error');
        setErrorMessage(errStr || 'Camera unavailable');
      }
    }
  };

  // Load MoveNet detector
  useEffect(() => {
    let isMounted = true;
    getPoseDetector()
      .then((det) => {
        if (isMounted) {
          detectorRef.current = det;
          setModelLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load MoveNet model:', err);
        if (isMounted) {
          setModelLoading(false);
        }
      });

    startCamera();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Frame detection loop for calibration check
  useEffect(() => {
    let active = true;

    const detectLoop = async () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;

      if (video && canvas && detector && video.readyState >= 2 && !video.paused) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const pose = await estimatePoseFromVideo(detector, video);
        if (pose && active) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawPoseSkeleton(ctx, pose, canvas.width, canvas.height, {
              accentColor: '#88F78C',
              confidenceThreshold: 0.25
            });
          }

          const score = pose.score || 0;
          setPoseConfidence(score);
          if (score >= 0.35) {
            setIsReady(true);
          }
        }
      }

      if (active) {
        animFrameIdRef.current = requestAnimationFrame(detectLoop);
      }
    };

    if (cameraState === 'active' && !modelLoading) {
      animFrameIdRef.current = requestAnimationFrame(detectLoop);
    }

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [cameraState, modelLoading]);

  // Clean up streams when navigating back or moving to workout
  const handleStartWorkout = (simulated: boolean = false) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onReadyToStart(simulated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="camera-check-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#737973] hover:text-[#151815] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> CHANGE MODE / EXERCISE
        </button>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[#737973] uppercase">EXERCISE:</span>
          <span className="text-[#151815] bg-white px-2 py-0.5 rounded-md border border-[#E1E6E1]">
            {exercise.name}
          </span>
          <span className="text-[#35A83D] bg-[#88F78C]/20 px-2 py-0.5 rounded-md">
            {mode === 'challenge-30s' ? '30S CHALLENGE' : 'FREE PLAY'}
          </span>
        </div>
      </div>

      {/* Camera feed or permission screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Camera Viewport */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E1E6E1] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#151815]" />
              <h3 className="font-display font-bold text-sm tracking-tight text-[#151815]">
                CAMERA CALIBRATION
              </h3>
            </div>

            {/* Pose model status */}
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              {modelLoading ? (
                <span className="text-[#737973] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Loading MoveNet...
                </span>
              ) : (
                <span className="text-[#35A83D] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> MoveNet Ready
                </span>
              )}
            </div>
          </div>

          {/* Camera Frame Container */}
          <div className="relative aspect-4/3 w-full bg-[#151815] rounded-xl overflow-hidden flex items-center justify-center border border-[#151815]">
            {/* Live Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                cameraState === 'active' ? 'block' : 'hidden'
              }`}
            />

            {/* Skeleton Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 ${
                cameraState === 'active' ? 'block' : 'hidden'
              }`}
            />

            {/* Calibration Target Outline */}
            {cameraState === 'active' && (
              <div className="absolute inset-6 border border-dashed border-white/20 rounded-xl pointer-events-none flex flex-col items-center justify-between p-4">
                <div className="text-[11px] font-bold text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  POSITION YOURSELF INSIDE THE FRAME
                </div>

                {/* Status Pill */}
                <div className="flex items-center gap-2">
                  {isReady ? (
                    <div className="bg-[#88F78C] text-[#151815] px-4 py-1.5 rounded-full font-display font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_16px_rgba(136,247,140,0.8)]">
                      <CheckCircle2 className="w-4 h-4" /> BODY DETECTED — READY
                    </div>
                  ) : (
                    <div className="bg-black/60 text-white/90 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/10">
                      Step into camera view...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* State: Permission Denied or Error */}
            {(cameraState === 'denied' || cameraState === 'error') && (
              <div className="p-6 text-center max-w-sm flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 text-[#88F78C]">
                  <VideoOff className="w-7 h-7" />
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">
                  CAMERA ACCESS NEEDED
                </h4>
                <p className="text-xs text-white/70 mb-5 leading-relaxed">
                  REP//AI uses your camera to count your movements in real-time. Your video stays entirely on your device and is never uploaded.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    id="enable-camera-retry-btn"
                    onClick={startCamera}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#88F78C] text-[#151815] font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                  >
                    ENABLE CAMERA
                  </button>
                  <button
                    id="fallback-simulation-btn"
                    onClick={() => handleStartWorkout(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/15 text-white font-semibold text-xs hover:bg-white/25 transition-colors cursor-pointer"
                  >
                    OR RUN IN SENSOR SIMULATION MODE
                  </button>
                </div>
              </div>
            )}

            {/* State: Requesting */}
            {cameraState === 'requesting' && (
              <div className="p-6 text-center flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-[#88F78C] animate-spin mb-3" />
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Requesting Camera Access...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Guidance and Start Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Instructions Card */}
          <div className="bg-white rounded-2xl border border-[#E1E6E1] p-6 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#737973] block mb-1">
              GUIDELINES
            </span>
            <h4 className="font-display text-lg font-extrabold text-[#151815] mb-3">
              POSITION YOURSELF
            </h4>

            <div className="p-3.5 bg-[#F5F7F5] rounded-xl border border-[#E1E6E1] text-xs font-semibold text-[#151815] mb-4">
              🎯 {exercise.prepMessage}
            </div>

            <div className="space-y-2 mb-6">
              {exercise.positioningTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#737973]">
                  <span className="font-bold text-[#151815] mt-0.5">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            {/* Privacy note */}
            <div className="flex items-center gap-2 text-[11px] text-[#737973] border-t border-[#E1E6E1] pt-3">
              <Shield className="w-3.5 h-3.5 text-[#35A83D] shrink-0" />
              <span>Camera frames stay strictly inside your browser tab.</span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="bg-white rounded-2xl border border-[#E1E6E1] p-6 shadow-xs">
            <button
              id="start-workout-session-btn"
              onClick={() => handleStartWorkout(false)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isReady || cameraState === 'active'
                  ? 'bg-[#88F78C] text-[#151815] shadow-[0_0_20px_rgba(136,247,140,0.5)] hover:bg-[#151815] hover:text-[#88F78C]'
                  : 'bg-[#151815] text-white hover:bg-[#88F78C] hover:text-[#151815]'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              START WORKOUT
            </button>

            {cameraState === 'active' && (
              <button
                id="camera-simulate-test-btn"
                onClick={() => handleStartWorkout(true)}
                className="w-full mt-2.5 py-2 px-3 text-[11px] font-semibold text-[#737973] hover:text-[#151815] transition-colors"
              >
                Switch to Simulator Test Mode
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
