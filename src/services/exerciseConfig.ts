import { ExerciseConfig, ExerciseId } from '../types/fitness';

export const EXERCISES: Record<ExerciseId, ExerciseConfig> = {
  'push-ups': {
    id: 'push-ups',
    name: 'PUSH-UPS',
    tagline: 'Build upper-body strength',
    category: 'Upper Body & Core',
    description: 'Track chest and tricep movement through complete elbow flexion and extension.',
    requiredLandmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'left_hip'],
    cameraGuidance: 'Place your camera side-on (profile view) at floor level or slightly raised. Make sure your upper body, arms, and hips are clearly visible.',
    positioningTips: [
      'Position camera 6-8 feet away at side angle',
      'Ensure hands, shoulders, and chest stay in frame',
      'Lower chest until elbows bend to approx 90°',
      'Push all the way back up to full arm extension'
    ],
    prepMessage: 'Make sure your upper body and arms are visible.'
  },
  'bicep-curls': {
    id: 'bicep-curls',
    name: 'BICEP CURLS',
    tagline: 'Train your arms',
    category: 'Upper Body',
    description: 'Calculate elbow angle from full extension to peak contraction.',
    requiredLandmarks: ['shoulder', 'elbow', 'wrist'],
    cameraGuidance: 'Stand facing the camera or slightly angled so your arm, elbow, and shoulder joints are clearly illuminated and visible.',
    positioningTips: [
      'Stand 5-7 feet from camera with arms visible',
      'Start with arms fully extended downwards (>150°)',
      'Curl upward until forearm approaches bicep (<65°)',
      'Lower under control back to starting position'
    ],
    prepMessage: 'Keep your arms and upper body visible.'
  },
  'sit-ups': {
    id: 'sit-ups',
    name: 'SIT-UPS',
    tagline: 'Train your core',
    category: 'Core & Abdominals',
    description: 'Recognise torso angle transitions between supine and upright seated position.',
    requiredLandmarks: ['shoulder', 'hip', 'knee'],
    cameraGuidance: 'Position camera side-on so your shoulders, torso, hips, and knees remain in frame throughout the entire movement.',
    positioningTips: [
      'Position camera at side angle on the floor',
      'Start lying back with knees bent (>130° torso angle)',
      'Engage core and raise torso up towards knees (<75° angle)',
      'Lower all the way back down to reset'
    ],
    prepMessage: 'Make sure your torso and legs are visible.'
  }
};

export const EXERCISE_LIST = Object.values(EXERCISES);
