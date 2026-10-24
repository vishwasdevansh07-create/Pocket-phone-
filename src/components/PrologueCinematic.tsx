import React, { useState, useEffect } from 'react';
import { soundEngine } from '../game/audio/AudioEngine';
import { Sparkles, Mountain, ArrowRight } from 'lucide-react';

interface PrologueCinematicProps {
  onComplete: () => void;
}

export const PrologueCinematic: React.FC<PrologueCinematicProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);

  // Steps sequence
  useEffect(() => {
    soundEngine.init();
    soundEngine.resume();

    // Step 0: Forest introduction (0 - 4s)
    const t1 = setTimeout(() => {
      setStep(1); // Mountain in distance
    }, 4500);

    // Step 2: The Shift Tremor (8s)
    const t2 = setTimeout(() => {
      setStep(2);
      setShake(true);
      soundEngine.playWorldTremor();
      setTimeout(() => setShake(false), 2200);
    }, 9000);

    // Step 3: Kip's confusion & Path Changed (14s)
    const t3 = setTimeout(() => {
      setStep(3);
      soundEngine.playCompanionChirp(true);
    }, 14500);

    // Step 4: Ancient Symbol Awakening & Signature Line (20s)
    const t4 = setTimeout(() => {
      setStep(4);
      soundEngine.playDiscoveryChime();
    }, 20500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleSkipOrProceed = () => {
    if (step < 4) {
      setStep(4);
      soundEngine.playDiscoveryChime();
    } else {
      onComplete();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-[#060a10] text-slate-100 flex flex-col justify-between overflow-hidden select-none transition-transform duration-100 ${
      shake ? 'translate-x-2 -translate-y-1 scale-105' : ''
    }`}>
      {/* Top Letterbox Bar */}
      <div className="h-16 sm:h-24 bg-black w-full flex items-center justify-between px-6 z-20">
        <span className="font-cinzel text-xs uppercase tracking-widest text-amber-500/60">
          PROLOGUE: THE AWAKENING HORIZON
        </span>
        <button
          onClick={handleSkipOrProceed}
          className="text-xs font-mono-tech text-slate-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/60 active:scale-95 transition-all"
        >
          <span>{step < 4 ? 'Fast-Forward' : 'Begin Journey'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cinematic Viewport Stage */}
      <div className="flex-1 relative flex items-center justify-center p-6">
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#091424] via-[#10233b] to-[#040810] pointer-events-none" />

        {/* Dynamic Landscape Visualization */}
        <div className="relative w-full max-w-2xl h-80 rounded-3xl overflow-hidden border border-amber-600/30 shadow-2xl bg-[#09101b] flex items-center justify-center p-6">
          {/* Distant Mountain Peak (Moves dynamically in Step 2!) */}
          <div
            className={`absolute bottom-16 transition-all duration-1000 flex flex-col items-center ${
              step >= 2 ? 'right-12 scale-110' : 'left-16 scale-95'
            }`}
          >
            <div className="relative">
              <Mountain className="w-36 h-36 text-indigo-900/80 drop-shadow-2xl" />
              {step >= 2 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono-tech text-amber-400 bg-black/70 px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce border border-amber-500/50">
                  ✦ Peak Relocated +140m
                </div>
              )}
            </div>
          </div>

          {/* Traveler Kael & Fox Kip Silhouette */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-3 z-10">
            {/* Kael */}
            <div className="flex flex-col items-center">
              <div className="relative w-8 h-14 bg-teal-800 rounded-t-xl border border-teal-400/40 flex items-center justify-center shadow-lg">
                {/* Glowing Backpack Rune */}
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -left-1 top-4" />
                <div className="w-2 h-2 rounded-full bg-amber-300 absolute -left-1 top-4" />
                {/* Flowing Scarf */}
                <div className="absolute -top-1 -right-3 w-6 h-1.5 bg-red-600 rounded-full rotate-12" />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-4 bg-slate-900" />
                <div className="w-2 h-4 bg-slate-900" />
              </div>
            </div>

            {/* Kip */}
            <div className="flex flex-col items-center">
              <div className="text-2xl animate-bounce">
                🦊
              </div>
              {step === 3 && (
                <div className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[9px] -mt-2">
                  ?!
                </div>
              )}
            </div>
          </div>

          {/* Whispering Forest Floor */}
          <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-slate-950 to-emerald-950/80 border-t border-emerald-600/30 flex items-center justify-around px-4">
            <span className="text-emerald-500/40 text-xs">🌿</span>
            <span className="text-emerald-500/40 text-xs">🌾</span>
            <span className="text-emerald-500/40 text-xs">🌱</span>
            <span className="text-emerald-500/40 text-xs">🌿</span>
          </div>
        </div>

        {/* Narrative Captions with Smooth Transitions */}
        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center text-center px-4">
          {step === 0 && (
            <div className="max-w-md animate-fade-in space-y-1">
              <p className="font-cinzel text-base sm:text-lg text-slate-200">
                You step into the Whispering Forest. The air is calm.
              </p>
              <p className="text-xs text-slate-400 italic">
                A distant needle mountain watches over the canopy.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="max-w-md animate-fade-in space-y-1">
              <p className="font-cinzel text-base sm:text-lg text-amber-200">
                You mark Mount Solis on your parchment survey map.
              </p>
              <p className="text-xs text-slate-400 italic">
                "A permanent landmark... or so all maps have claimed."
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-md animate-fade-in space-y-1">
              <p className="font-cinzel text-base sm:text-lg text-amber-400 font-bold text-glow-gold">
                The earth vibrates beneath your boots.
              </p>
              <p className="text-xs text-amber-200/90 font-mono-tech">
                Wait... the mountain has moved.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md animate-fade-in space-y-1">
              <p className="font-cinzel text-base sm:text-lg text-slate-200">
                You turn around. The path you walked ten minutes ago has vanished into ancient mossy roots.
              </p>
              <p className="text-xs text-orange-300 italic">
                Kip tilts his head in utter bewilderment.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-lg animate-fade-in space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                <span className="font-mono-tech text-xs uppercase tracking-widest">
                  ANCIENT RUNIC REVELATION
                </span>
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-black text-amber-200 text-glow-gold tracking-wide">
                “The world was never meant to stay still.”
              </h1>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Adapt to the changing terrain. Follow the shifting landmarks. Discover where the living Earth is traveling.
              </p>
              <button
                onClick={onComplete}
                className="mt-2 py-3 px-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-sm shadow-2xl active:scale-95 transition-all box-glow-rune"
              >
                Enter The Living World
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Letterbox Bar */}
      <div className="h-16 sm:h-24 bg-black w-full flex items-center justify-center px-6 z-20">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-amber-400' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
