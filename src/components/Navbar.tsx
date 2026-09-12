import React, { useState } from 'react';
import { Activity, Flame, Info, Trophy, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../services/audioEffects';

interface NavbarProps {
  activeTab: 'workout' | 'progress' | 'about';
  onSelectTab: (tab: 'workout' | 'progress' | 'about') => void;
  bestScore: number;
  highestStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  bestScore,
  highestStreak
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(soundEffects.isEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    soundEffects.setEnabled(next);
    setSoundOn(next);
    if (next) {
      soundEffects.playRepSound();
    }
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-[#F5F7F5]/90 backdrop-blur-md border-b border-[#E1E6E1] transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div
          id="brand-logo"
          onClick={() => onSelectTab('workout')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#151815] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <span className="font-display font-extrabold text-[#88F78C] text-sm tracking-tighter">
              //
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-[#151815]">
              REP<span className="text-[#35A83D]">//</span>AI
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#737973] font-semibold -mt-1">
              Pose Vision
            </span>
          </div>
        </div>

        {/* Minimal Navigation */}
        <nav id="nav-menu" className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-full border border-[#E1E6E1] shadow-xs">
          <button
            id="nav-workout-btn"
            onClick={() => onSelectTab('workout')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'workout'
                ? 'bg-[#151815] text-[#FFFFFF] shadow-xs'
                : 'text-[#737973] hover:text-[#151815] hover:bg-[#F5F7F5]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#88F78C]" />
            Workout
          </button>

          <button
            id="nav-progress-btn"
            onClick={() => onSelectTab('progress')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'progress'
                ? 'bg-[#151815] text-[#FFFFFF] shadow-xs'
                : 'text-[#737973] hover:text-[#151815] hover:bg-[#F5F7F5]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#88F78C]" />
            Progress
          </button>

          <button
            id="nav-about-btn"
            onClick={() => onSelectTab('about')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-[#151815] text-[#FFFFFF] shadow-xs'
                : 'text-[#737973] hover:text-[#151815] hover:bg-[#F5F7F5]'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-[#88F78C]" />
            About
          </button>
        </nav>

        {/* Right side controls: Sound & Best stats badge */}
        <div className="flex items-center gap-3">
          {/* Quick Best Streak badge */}
          {highestStreak > 0 && (
            <div
              id="header-streak-badge"
              className="hidden sm:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E1E6E1] text-xs font-bold text-[#151815] shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[#737973] font-medium">BEST</span>
              <span className="tabular-nums font-extrabold text-[#151815]">{highestStreak}</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            id="header-sound-toggle"
            onClick={toggleSound}
            aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
            className="w-9 h-9 rounded-full bg-white border border-[#E1E6E1] flex items-center justify-center text-[#151815] hover:border-[#88F78C] hover:bg-[#F5F7F5] transition-all cursor-pointer shadow-xs"
            title={soundOn ? 'Sound FX On' : 'Sound FX Muted'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-[#151815]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#737973]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
