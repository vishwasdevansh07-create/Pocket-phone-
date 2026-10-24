import React from 'react';
import { 
  Play, 
  Sparkles, 
  Settings, 
  Compass, 
  HardDrive, 
  ShieldCheck, 
  Flame,
  Trophy
} from 'lucide-react';
import { SaveManager } from '../game/save/SaveManager';

interface MainMenuProps {
  onContinue: () => void;
  onNewGame: () => void;
  onOpenSettings: () => void;
  onOpenPlayStore: () => void;
  hasExistingSave: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onContinue,
  onNewGame,
  onOpenSettings,
  onOpenPlayStore,
  hasExistingSave,
}) => {
  const activeSlot = SaveManager.getActiveSlot();
  const currentSave = SaveManager.getSave(activeSlot);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none bg-[#070b12]">
      {/* Animated Atmospheric Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0a111c] to-[#05080e] pointer-events-none" />
      
      {/* Distant Painterly Silhouette */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

      {/* Floating Luminescent Dust particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-cyan-400 animate-pulse opacity-70" />
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
      </div>

      {/* Top Header Badge & Play Store Button */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-600/30 text-amber-300 text-xs font-mono-tech shadow-lg">
          <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>Living World Adventure Engine v1.2</span>
        </div>

        {/* Google Play Store Top Button */}
        <button
          onClick={onOpenPlayStore}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg transition-all active:scale-95 group"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M3.6 1.8L14.4 12.6L3.6 23.4C3.2 23 3 22.4 3 21.6V3.6C3 2.8 3.2 2.2 3.6 1.8Z" fill="#20A05A" />
            <path d="M17.9 9.1L4.8 1.6C4.4 1.3 4 1.2 3.6 1.3L14.4 12.1L17.9 9.1Z" fill="#EA4335" />
            <path d="M17.9 15.1L14.4 12.1L3.6 22.9C4 23 4.4 22.9 4.8 22.6L17.9 15.1Z" fill="#4285F4" />
            <path d="M21.5 12.1L17.9 9.1L14.4 12.1L17.9 15.1L21.5 12.1C22.1 11.7 22.1 12.5 21.5 12.1Z" fill="#FBBC04" />
          </svg>
          <span className="font-sans font-bold">Google Play Store</span>
        </button>
      </div>

      {/* Center Hero Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-mono-tech text-xs tracking-widest uppercase">
            A Cinematic Shifting Realm
          </span>
          <Sparkles className="w-4 h-4" />
        </div>

        <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-wider text-amber-100 text-glow-gold leading-tight drop-shadow-2xl">
          THE WORLD THAT MOVES
        </h1>

        <p className="mt-3 max-w-lg text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          Forests wander, mountains migrate, and oceans redraw the map.
          <br className="hidden sm:inline" />
          Explore a realm where the world itself is alive.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-xs sm:max-w-md">
          {hasExistingSave && (
            <button
              onClick={onContinue}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-cinzel font-bold text-sm sm:text-base shadow-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all box-glow-rune"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Continue Expedition</span>
            </button>
          )}

          <button
            onClick={onNewGame}
            className={`w-full py-3.5 px-6 rounded-2xl font-cinzel font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 active:scale-95 transition-all ${
              !hasExistingSave
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 box-glow-rune'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200'
            }`}
          >
            <Flame className="w-5 h-5 text-amber-400" />
            <span>New Journey</span>
          </button>
        </div>

        {/* Save Slot Info Pill */}
        {currentSave && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono-tech bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Slot {activeSlot}: {currentSave.title} ({currentSave.discoveredLandmarks.length} Discovered • {currentSave.playerStats.shiftingShards} Shards)
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-5">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Saves</span>
          </button>

          <button
            onClick={onOpenPlayStore}
            className="flex items-center gap-1.5 hover:text-emerald-300 text-slate-300 transition-colors"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Google Play Store</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono-tech">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
          <span>Google Play Verified • 60 FPS</span>
        </div>
      </div>
    </div>
  );
};
