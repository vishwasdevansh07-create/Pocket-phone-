import React from 'react';
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Home, 
  Save, 
  X,
  Trophy
} from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onSaveGame: () => void;
  onOpenSettings: () => void;
  onOpenPlayStore: () => void;
  onRestartCheckpoint: () => void;
  onExitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onSaveGame,
  onOpenSettings,
  onOpenPlayStore,
  onRestartCheckpoint,
  onExitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950/95 p-6 shadow-2xl flex flex-col items-center text-slate-100">
        <button
          onClick={onResume}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
          <span className="text-xl">🏔️</span>
        </div>

        <h2 className="font-cinzel text-xl font-bold tracking-wide text-amber-200 mb-1">
          EXPEDITION PAUSED
        </h2>
        <p className="text-xs text-slate-400 font-mono-tech mb-6">
          The World That Moves
        </p>

        {/* Buttons List */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume Journey</span>
          </button>

          <button
            onClick={onOpenPlayStore}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Google Play Store & Achievements</span>
          </button>

          <button
            onClick={onSaveGame}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Progress (Slot)</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Settings & Graphics</span>
          </button>

          <button
            onClick={onRestartCheckpoint}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reload Last Campfire</span>
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-3 px-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 text-red-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4 text-red-400" />
            <span>Return to Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

