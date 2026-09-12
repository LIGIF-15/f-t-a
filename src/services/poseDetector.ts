import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Keypoint, Pose } from '../types/fitness';

let detectorInstance: poseDetection.PoseDetector | null = null;
let isInitializing = false;

// Standard MoveNet keypoint connections (pairs of indices)
export const SKELETON_PAIRS: [number, number][] = [
  [0, 1], // nose to left_eye
  [0, 2], // nose to right_eye
  [1, 3], // left_eye to left_ear
  [2, 4], // right_eye to right_ear
  [5, 6], // left_shoulder to right_shoulder
  [5, 7], // left_shoulder to left_elbow
  [7, 9], // left_elbow to left_wrist
  [6, 8], // right_shoulder to right_elbow
  [8, 10], // right_elbow to right_wrist
  [5, 11], // left_shoulder to left_hip
  [6, 12], // right_shoulder to right_hip
  [11, 12], // left_hip to right_hip
  [11, 13], // left_hip to left_knee
  [13, 15], // left_knee to left_ankle
  [12, 14], // right_hip to right_knee
  [14, 16] // right_knee to right_ankle
];

/**
 * Initializes MoveNet SinglePose Lightning
 */
export async function getPoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detectorInstance) return detectorInstance;
  if (isInitializing) {
    // Wait until initialized
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (detectorInstance) return detectorInstance;
  }

  isInitializing = true;
  try {
    await tf.ready();
    detectorInstance = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true
      }
    );
    return detectorInstance;
  } finally {
    isInitializing = false;
  }
}

/**
 * Estimates pose from video element
 */
export async function estimatePoseFromVideo(
  detector: poseDetection.PoseDetector,
  video: HTMLVideoElement
): Promise<Pose | null> {
  if (!video || video.readyState < 2) return null;
  try {
    const poses = await detector.estimatePoses(video, {
      maxPoses: 1,
      flipHorizontal: true
    });
    if (poses && poses.length > 0) {
      const p = poses[0];
      return {
        keypoints: p.keypoints.map((k) => ({
          x: k.x,
          y: k.y,
          score: k.score,
          name: k.name
        })),
        score: p.score
      };
    }
    return null;
  } catch (err) {
    console.warn('Pose estimation frame error:', err);
    return null;
  }
}

/**
 * Renders MoveNet skeleton onto an overlay canvas with futuristic neon styling
 */
export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  pose: Pose,
  canvasWidth: number,
  canvasHeight: number,
  options: {
    accentColor?: string;
    isRepActive?: boolean;
    confidenceThreshold?: number;
    highlightJoints?: number[];
  } = {}
) {
  const accentColor = options.accentColor || '#88F78C';
  const confidenceThreshold = options.confidenceThreshold ?? 0.3;
  const isRepActive = options.isRepActive ?? false;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (!pose || !pose.keypoints || pose.keypoints.length === 0) return;

  // Draw skeleton bones
  ctx.save();
  ctx.lineWidth = isRepActive ? 4 : 2.5;
  ctx.strokeStyle = isRepActive ? '#88F78C' : 'rgba(136, 247, 140, 0.75)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [startIdx, endIdx] of SKELETON_PAIRS) {
    const ptA = pose.keypoints[startIdx];
    const ptB = pose.keypoints[endIdx];

    if (
      ptA &&
      ptB &&
      (ptA.score ?? 1) >= confidenceThreshold &&
      (ptB.score ?? 1) >= confidenceThreshold
    ) {
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);
      ctx.stroke();
    }
  }

  // Draw keypoint joints
  pose.keypoints.forEach((kp, idx) => {
    if ((kp.score ?? 1) < confidenceThreshold) return;

    const isHighlighted = options.highlightJoints?.includes(idx);
    const radius = isHighlighted ? (isRepActive ? 7 : 5.5) : 4;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = isHighlighted
      ? 'rgba(136, 247, 140, 0.3)'
      : 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // Solid core dot
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isHighlighted ? '#88F78C' : '#FFFFFF';
    ctx.fill();

    // Dark border for contrast against bright video backgrounds
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#151815';
    ctx.stroke();
  });

  ctx.restore();
}
