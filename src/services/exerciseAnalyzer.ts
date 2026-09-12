import { ExerciseAnalysisResult, ExerciseId, Keypoint, Pose, RepStage } from '../types/fitness';

/**
 * Calculates angle in degrees formed by three points: point A, vertex B, point C
 */
export function calculateAngle(pointA: Keypoint, pointB: Keypoint, pointC: Keypoint): number {
  const baX = pointA.x - pointB.x;
  const baY = pointA.y - pointB.y;
  const bcX = pointC.x - pointB.x;
  const bcY = pointC.y - pointB.y;

  const dotProduct = baX * bcX + baY * bcY;
  const magnitudeBA = Math.sqrt(baX * baX + baY * baY);
  const magnitudeBC = Math.sqrt(bcX * bcX + bcY * bcY);

  if (magnitudeBA === 0 || magnitudeBC === 0) return 0;

  const cosTheta = Math.max(-1, Math.min(1, dotProduct / (magnitudeBA * magnitudeBC)));
  const radians = Math.acos(cosTheta);
  return Math.round((radians * 180) / Math.PI);
}

/**
 * Finds keypoint by name or index
 */
export function getKeypoint(pose: Pose, nameOrIndex: string | number): Keypoint | undefined {
  if (typeof nameOrIndex === 'number') {
    return pose.keypoints[nameOrIndex];
  }
  return pose.keypoints.find((k) => k.name === nameOrIndex);
}

/**
 * State machine tracker for exercise reps
 */
export class ExerciseRepTracker {
  private exerciseId: ExerciseId;
  private stage: RepStage = 'ready';
  private repReady: boolean = false;
  private minAngleReached: number = 999;
  private maxAngleReached: number = 0;
  private lastRepTimestamp: number = 0;

  constructor(exerciseId: ExerciseId) {
    this.exerciseId = exerciseId;
  }

  public setExercise(id: ExerciseId) {
    this.exerciseId = id;
    this.reset();
  }

  public reset() {
    this.stage = 'ready';
    this.repReady = false;
    this.minAngleReached = 999;
    this.maxAngleReached = 0;
    this.lastRepTimestamp = 0;
  }

  public analyze(pose: Pose): ExerciseAnalysisResult {
    switch (this.exerciseId) {
      case 'push-ups':
        return this.analyzePushUp(pose);
      case 'bicep-curls':
        return this.analyzeBicepCurl(pose);
      case 'sit-ups':
        return this.analyzeSitUp(pose);
      default:
        return {
          isRepCompleted: false,
          currentStage: 'ready',
          progressPercent: 0,
          feedbackMessage: 'Ready',
          isFormAcceptable: true,
          confidence: 0,
          angles: {}
        };
    }
  }

  // ==========================================
  // PUSH-UP DETECTION
  // ==========================================
  private analyzePushUp(pose: Pose): ExerciseAnalysisResult {
    // MoveNet keypoint indices:
    // 5: left_shoulder, 6: right_shoulder
    // 7: left_elbow, 8: right_elbow
    // 9: left_wrist, 10: right_wrist
    // 11: left_hip, 12: right_hip
    const leftShoulder = getKeypoint(pose, 5) || getKeypoint(pose, 'left_shoulder');
    const leftElbow = getKeypoint(pose, 7) || getKeypoint(pose, 'left_elbow');
    const leftWrist = getKeypoint(pose, 9) || getKeypoint(pose, 'left_wrist');

    const rightShoulder = getKeypoint(pose, 6) || getKeypoint(pose, 'right_shoulder');
    const rightElbow = getKeypoint(pose, 8) || getKeypoint(pose, 'right_elbow');
    const rightWrist = getKeypoint(pose, 10) || getKeypoint(pose, 'right_wrist');

    const leftConf = (leftShoulder?.score || 0) + (leftElbow?.score || 0) + (leftWrist?.score || 0);
    const rightConf = (rightShoulder?.score || 0) + (rightElbow?.score || 0) + (rightWrist?.score || 0);

    const useLeft = leftConf >= rightConf;
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const elbow = useLeft ? leftElbow : rightElbow;
    const wrist = useLeft ? leftWrist : rightWrist;

    const avgConf = (useLeft ? leftConf : rightConf) / 3;

    if (!shoulder || !elbow || !wrist || avgConf < 0.35) {
      return {
        isRepCompleted: false,
        currentStage: this.stage,
        progressPercent: 0,
        feedbackMessage: 'MAKE SURE YOUR BODY IS VISIBLE',
        isFormAcceptable: false,
        confidence: avgConf,
        angles: {}
      };
    }

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);

    // Push-up thresholds:
    // Top position: elbow angle > 150°
    // Bottom position: elbow angle < 95°
    let isRepCompleted = false;
    let feedback = 'LOWER YOUR CHEST';
    let progress = 0;

    const now = Date.now();

    // Progress estimation based on range 155° (0%) down to 90° (100%)
    if (elbowAngle > 155) {
      progress = 0;
    } else if (elbowAngle < 90) {
      progress = 100;
    } else {
      progress = Math.round(((155 - elbowAngle) / (155 - 90)) * 100);
    }

    if (this.stage === 'ready' || this.stage === 'completed') {
      if (elbowAngle > 145) {
        this.repReady = true;
        this.stage = 'starting';
        feedback = 'LOWER DOWN';
      } else {
        feedback = 'PUSH UP TO EXTEND ARMS';
      }
    } else if (this.stage === 'starting') {
      if (elbowAngle < 135) {
        this.stage = 'halfway';
        feedback = 'ALMOST THERE, GO LOWER';
      } else {
        feedback = 'LOWER YOUR CHEST';
      }
    } else if (this.stage === 'halfway') {
      if (elbowAngle <= 95) {
        this.minAngleReached = Math.min(this.minAngleReached, elbowAngle);
        this.stage = 'recovering';
        feedback = 'GREAT DEPTH! NOW PUSH UP';
      } else {
        feedback = 'GO A LITTLE LOWER';
      }
    } else if (this.stage === 'recovering') {
      if (elbowAngle >= 148) {
        // Enforce a debounce of 350ms to prevent double counting
        if (now - this.lastRepTimestamp > 350) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          this.stage = 'completed';
          feedback = 'REP COMPLETE! +2';
        }
      } else {
        feedback = 'PUSH ALL THE WAY UP';
      }
    }

    return {
      isRepCompleted,
      currentStage: this.stage,
      progressPercent: progress,
      feedbackMessage: feedback,
      isFormAcceptable: avgConf >= 0.5,
      confidence: avgConf,
      angles: { elbowAngle }
    };
  }

  // ==========================================
  // BICEP CURL DETECTION
  // ==========================================
  private analyzeBicepCurl(pose: Pose): ExerciseAnalysisResult {
    const leftShoulder = getKeypoint(pose, 5) || getKeypoint(pose, 'left_shoulder');
    const leftElbow = getKeypoint(pose, 7) || getKeypoint(pose, 'left_elbow');
    const leftWrist = getKeypoint(pose, 9) || getKeypoint(pose, 'left_wrist');

    const rightShoulder = getKeypoint(pose, 6) || getKeypoint(pose, 'right_shoulder');
    const rightElbow = getKeypoint(pose, 8) || getKeypoint(pose, 'right_elbow');
    const rightWrist = getKeypoint(pose, 10) || getKeypoint(pose, 'right_wrist');

    const leftConf = (leftShoulder?.score || 0) + (leftElbow?.score || 0) + (leftWrist?.score || 0);
    const rightConf = (rightShoulder?.score || 0) + (rightElbow?.score || 0) + (rightWrist?.score || 0);

    const useLeft = leftConf >= rightConf;
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const elbow = useLeft ? leftElbow : rightElbow;
    const wrist = useLeft ? leftWrist : rightWrist;

    const avgConf = (useLeft ? leftConf : rightConf) / 3;

    if (!shoulder || !elbow || !wrist || avgConf < 0.35) {
      return {
        isRepCompleted: false,
        currentStage: this.stage,
        progressPercent: 0,
        feedbackMessage: 'KEEP YOUR ARMS AND UPPER BODY VISIBLE',
        isFormAcceptable: false,
        confidence: avgConf,
        angles: {}
      };
    }

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);

    // Bicep curl thresholds:
    // Down (extended): > 145°
    // Peak contraction: < 65°
    let isRepCompleted = false;
    let feedback = 'START WITH ARMS DOWN';
    let progress = 0;

    const now = Date.now();

    if (elbowAngle > 145) {
      progress = 0;
    } else if (elbowAngle < 60) {
      progress = 100;
    } else {
      progress = Math.round(((145 - elbowAngle) / (145 - 60)) * 100);
    }

    if (this.stage === 'ready' || this.stage === 'completed') {
      if (elbowAngle > 140) {
        this.repReady = true;
        this.stage = 'starting';
        feedback = 'CURL UPWARD';
      } else {
        feedback = 'EXTEND ARMS FULLY DOWN';
      }
    } else if (this.stage === 'starting') {
      if (elbowAngle < 110) {
        this.stage = 'halfway';
        feedback = 'KEEP CURLING UP';
      } else {
        feedback = 'CURL UPWARD';
      }
    } else if (this.stage === 'halfway') {
      if (elbowAngle <= 65) {
        this.stage = 'recovering';
        feedback = 'PEAK SQUEEZE! NOW LOWER';
      } else {
        feedback = 'CURL A LITTLE HIGHER';
      }
    } else if (this.stage === 'recovering') {
      if (elbowAngle >= 140) {
        if (now - this.lastRepTimestamp > 350) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          this.stage = 'completed';
          feedback = 'REP COMPLETE! +2';
        }
      } else {
        feedback = 'LOWER ALL THE WAY DOWN';
      }
    }

    return {
      isRepCompleted,
      currentStage: this.stage,
      progressPercent: progress,
      feedbackMessage: feedback,
      isFormAcceptable: avgConf >= 0.5,
      confidence: avgConf,
      angles: { elbowAngle }
    };
  }

  // ==========================================
  // SIT-UP DETECTION
  // ==========================================
  private analyzeSitUp(pose: Pose): ExerciseAnalysisResult {
    // 5: left_shoulder, 6: right_shoulder
    // 11: left_hip, 12: right_hip
    // 13: left_knee, 14: right_knee
    const leftShoulder = getKeypoint(pose, 5) || getKeypoint(pose, 'left_shoulder');
    const leftHip = getKeypoint(pose, 11) || getKeypoint(pose, 'left_hip');
    const leftKnee = getKeypoint(pose, 13) || getKeypoint(pose, 'left_knee');

    const rightShoulder = getKeypoint(pose, 6) || getKeypoint(pose, 'right_shoulder');
    const rightHip = getKeypoint(pose, 12) || getKeypoint(pose, 'right_hip');
    const rightKnee = getKeypoint(pose, 14) || getKeypoint(pose, 'right_knee');

    const leftConf = (leftShoulder?.score || 0) + (leftHip?.score || 0) + (leftKnee?.score || 0);
    const rightConf = (rightShoulder?.score || 0) + (rightHip?.score || 0) + (rightKnee?.score || 0);

    const useLeft = leftConf >= rightConf;
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const hip = useLeft ? leftHip : rightHip;
    const knee = useLeft ? leftKnee : rightKnee;

    const avgConf = (useLeft ? leftConf : rightConf) / 3;

    if (!shoulder || !hip || !knee || avgConf < 0.35) {
      return {
        isRepCompleted: false,
        currentStage: this.stage,
        progressPercent: 0,
        feedbackMessage: 'MAKE SURE YOUR TORSO AND LEGS ARE VISIBLE',
        isFormAcceptable: false,
        confidence: avgConf,
        angles: {}
      };
    }

    // Torso-to-thigh angle:
    // Lying down: > 130°
    // Seated / up: < 75°
    const torsoAngle = calculateAngle(shoulder, hip, knee);

    let isRepCompleted = false;
    let feedback = 'LIE BACK TO START';
    let progress = 0;

    const now = Date.now();

    if (torsoAngle > 135) {
      progress = 0;
    } else if (torsoAngle < 70) {
      progress = 100;
    } else {
      progress = Math.round(((135 - torsoAngle) / (135 - 70)) * 100);
    }

    if (this.stage === 'ready' || this.stage === 'completed') {
      if (torsoAngle > 125) {
        this.repReady = true;
        this.stage = 'starting';
        feedback = 'ENGAGE CORE & SIT UP';
      } else {
        feedback = 'LIE FLAT TO RESET';
      }
    } else if (this.stage === 'starting') {
      if (torsoAngle < 105) {
        this.stage = 'halfway';
        feedback = 'KEEP COMING UP';
      } else {
        feedback = 'RAISE YOUR TORSO';
      }
    } else if (this.stage === 'halfway') {
      if (torsoAngle <= 75) {
        this.stage = 'recovering';
        feedback = 'TOP REACHED! NOW LOWER DOWN';
      } else {
        feedback = 'COME UP ALL THE WAY';
      }
    } else if (this.stage === 'recovering') {
      if (torsoAngle >= 125) {
        if (now - this.lastRepTimestamp > 350) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          this.stage = 'completed';
          feedback = 'REP COMPLETE! +2';
        }
      } else {
        feedback = 'LOWER ALL THE WAY BACK';
      }
    }

    return {
      isRepCompleted,
      currentStage: this.stage,
      progressPercent: progress,
      feedbackMessage: feedback,
      isFormAcceptable: avgConf >= 0.5,
      confidence: avgConf,
      angles: { torsoAngle }
    };
  }
}
