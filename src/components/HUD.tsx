import React, { memo } from 'react';
import { PlayerStats, WeatherType, TimeOfDay } from '../types/game';
import { Enemy } from '../game/entities/Enemies';
import { 
  Heart, 
  Zap, 
  Map as MapIcon, 
  BookOpen, 
  Pause, 
  Sparkles, 
  Sun, 
  Moon, 
  CloudRain, 
  Wind, 
  Cloud,
  Compass
} from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  companionMood: string;
  interactPrompt: string | null;
  activeBoss: Enemy | null;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenPause: () => void;
  onOpenPlayStore: () => void;
  onTriggerCompanionPulse: () => void;
}

export const HUD: React.FC<HUDProps> = memo(({
  stats,
  weather,
  timeOfDay,
  companionMood,
  interactPrompt,
  activeBoss,
  onOpenMap,
  onOpenJournal,
  onOpenPause,
  onOpenPlayStore,
  onTriggerCompanionPulse,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (stats.stamina / stats.maxStamina) * 100));
  const bondPercent = Math.max(0, Math.min(100, stats.bondXp));

  const getWeatherIcon = () => {
    switch (weather) {
      case 'rain':
      case 'storm':
        return <CloudRain className="w-3.5 h-3.5 text-cyan-400" />;
      case 'windy':
        return <Wind className="w-3.5 h-3.5 text-teal-300" />;
      case 'fog':
        return <Cloud className="w-3.5 h-3.5 text-slate-300" />;
      default:
        return timeOfDay === 'night' ? (
          <Moon className="w-3.5 h-3.5 text-amber-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Bar: Player Vitality & Companion & Quick Actions */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Health, Stamina & Shards */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Health & Stamina Bars */}
          <div className="bg-slate-950/75 backdrop-blur-md border border-slate-700/50 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col gap-2 min-w-[190px] sm:min-w-[230px]">
            {/* Health Bar */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-200"
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-mono-tech text-slate-300 font-bold shrink-0 w-8 text-right">
                {Math.round(stats.health)}
              </span>
            </div>

            {/* Stamina Bar */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-150"
                    style={{ width: `${staminaPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono-tech text-emerald-300 font-semibold shrink-0 w-8 text-right">
                {Math.round(stats.stamina)}
              </span>
            </div>

            {/* Shifting Shards & Weather Pill */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-mono-tech">{stats.shiftingShards}</span>
                <span className="text-slate-400 text-[10px]">Shards</span>
              </div>

              {/* Weather & Time */}
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50 text-[10px] capitalize text-slate-200">
                {getWeatherIcon()}
                <span>{timeOfDay}</span>
                <span className="text-slate-500">•</span>
                <span>{weather}</span>
              </div>
            </div>
          </div>

          {/* Companion Kip Widget */}
          <div
            onClick={onTriggerCompanionPulse}
            className="bg-slate-950/75 backdrop-blur-md border border-amber-600/30 rounded-xl p-2 shadow-lg flex items-center gap-2 cursor-pointer hover:border-amber-500/60 active:scale-95 transition-all group pointer-events-auto"
            title="Tap Kip to emit Radiant Pulse!"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-900 to-orange-700 border border-amber-400/50 flex items-center justify-center shrink-0">
              <span className="text-xs">🦊</span>
              {companionMood === 'alert' && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center justify-center animate-bounce">
                  !
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-cinzel font-bold text-amber-200">Kip</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/80 border border-amber-600/40 text-amber-300">
                  Lv.{stats.bondLevel}
                </span>
              </div>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${bondPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Boss Health Bar (if active) */}
        {activeBoss && (
          <div className="flex flex-col items-center max-w-sm sm:max-w-md w-full px-4 animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-amber-400 text-glow-gold">
                THE ANCIENT ARBITER
              </span>
              <span className="text-[10px] font-mono-tech text-red-400 font-bold">
                {activeBoss.specialAttackName || `PHASE ${activeBoss.bossPhase}`}
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-900/90 border-2 border-amber-600/60 rounded-full overflow-hidden p-0.5 shadow-2xl">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-200"
                style={{
                  width: `${Math.max(0, (activeBoss.health / activeBoss.maxHealth) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Right: Quick Action Modals (Discovery Map, Journal, Play Store, Pause) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Hand-Drawn Discovery Map Button */}
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/50 text-amber-200 text-xs font-cinzel font-bold shadow-lg backdrop-blur-md active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className="hidden sm:inline">Discovery Map</span>
          </button>

          {/* Google Play Store & Achievements Button */}
          <button
            onClick={onOpenPlayStore}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            title="Google Play Store & Achievements"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M3.6 1.8L14.4 12.6L3.6 23.4C3.2 23 3 22.4 3 21.6V3.6C3 2.8 3.2 2.2 3.6 1.8Z" fill="#20A05A" />
              <path d="M17.9 9.1L4.8 1.6C4.4 1.3 4 1.2 3.6 1.3L14.4 12.1L17.9 9.1Z" fill="#EA4335" />
              <path d="M17.9 15.1L14.4 12.1L3.6 22.9C4 23 4.4 22.9 4.8 22.6L17.9 15.1Z" fill="#4285F4" />
              <path d="M21.5 12.1L17.9 9.1L14.4 12.1L17.9 15.1L21.5 12.1C22.1 11.7 22.1 12.5 21.5 12.1Z" fill="#FBBC04" />
            </svg>
          </button>

          {/* Lore Journal Button */}
          <button
            onClick={onOpenJournal}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            title="Codex & Collectibles"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Pause Menu Button */}
          <button
            onClick={onOpenPause}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            title="Pause & Settings"
          >
            <Pause className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Center Interactive Action Toast */}
      {interactPrompt && (
        <div className="self-center mb-24 sm:mb-12 pointer-events-auto animate-bounce">
          <div className="bg-slate-950/90 border border-amber-500/80 text-amber-300 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-medium box-glow-rune">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{interactPrompt}</span>
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
              Interact
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
HUD.displayName = 'HUD';
