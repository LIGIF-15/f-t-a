import React from 'react';
import { Award, Camera, CheckCircle2, Cpu, Eye, Flame, ShieldCheck, X, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151815]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="about-modal-container"
        className="bg-white rounded-3xl border border-[#E1E6E1] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
      >
        {/* Close button */}
        <button
          id="about-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F7F5] flex items-center justify-center text-[#151815] hover:bg-[#E1E6E1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#151815] flex items-center justify-center">
            <span className="font-display font-extrabold text-[#88F78C] text-sm">//</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#151815]">
            HOW REP//AI WORKS
          </h2>
        </div>
        <p className="text-xs text-[#737973] mb-6">
          The future of fitness training games powered by on-device computer vision.
        </p>

        {/* Core Pillars */}
        <div className="space-y-4 mb-6 text-xs">
          {/* Pillar 1: MoveNet Vision */}
          <div className="p-4 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1] flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-[#35A83D]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#151815] mb-1">
                MoveNet Real-Time Pose Estimation
              </h3>
              <p className="text-[#737973] leading-relaxed">
                REP//AI uses TensorFlow.js MoveNet Lightning to detect 17 anatomical keypoints directly in your browser at up to 30+ frames per second. No video is ever recorded or uploaded.
              </p>
            </div>
          </div>

          {/* Pillar 2: State-Machine Rep Counter */}
          <div className="p-4 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1] flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-[#35A83D]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#151815] mb-1">
                Deterministic Biomechanics State Machine
              </h3>
              <p className="text-[#737973] leading-relaxed">
                Reps are never counted by mere motion. A valid repetition requires transitioning smoothly from <strong>Start Extension → Descent / Flexion → Peak Contraction → Full Return</strong>. This prevents accidental double counting or half-movements.
              </p>
            </div>
          </div>

          {/* Pillar 3: Scoring System */}
          <div className="p-4 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1] flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#35A83D]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#151815] mb-1">
                Arcade Scoring & Streak Multipliers
              </h3>
              <div className="text-[#737973] space-y-1 mt-1 leading-relaxed">
                <p>• <strong>+2 points</strong> for every valid repetition.</p>
                <p>• <strong>+15 bonus points</strong> every time you hit another multiple of 10 in your current streak (10, 20, 30...).</p>
                <p>• <strong>30s Challenge:</strong> Push for 25 repetitions before the clock hits zero!</p>
              </div>
            </div>
          </div>

          {/* Pillar 4: Privacy & Safety */}
          <div className="p-4 rounded-2xl bg-[#F5F7F5] border border-[#E1E6E1] flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E1E6E1] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#35A83D]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#151815] mb-1">
                100% Privacy & Safety Notice
              </h3>
              <p className="text-[#737973] leading-relaxed">
                Your camera stream stays strictly inside your browser sandbox. REP//AI is a fun gamified movement tracker designed for motivation; it is not a medical or physical therapy diagnosis device. Always listen to your body and exercise safely.
              </p>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <button
          id="about-got-it-btn"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-[#151815] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#88F78C] hover:text-[#151815] transition-all cursor-pointer"
        >
          GOT IT, LET'S TRAIN
        </button>
      </div>
    </div>
  );
};
