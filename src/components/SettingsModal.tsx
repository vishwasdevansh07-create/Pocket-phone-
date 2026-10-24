import React, { useState } from 'react';
import { GameSettings, SaveManager } from '../game/save/SaveManager';
import { soundEngine } from '../game/audio/AudioEngine';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Monitor, 
  ShieldCheck, 
  Check, 
  Trash2,
  HardDrive
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onSaveSlotSelected?: (slot: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSaveSlotSelected }) => {
  const [settings, setSettings] = useState<GameSettings>(SaveManager.loadSettings());
  const [activeSlot, setActiveSlot] = useState<number>(SaveManager.getActiveSlot());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const save1 = SaveManager.getSave(1);
  const save2 = SaveManager.getSave(2);
  const save3 = SaveManager.getSave(3);

  const handleUpdate = (updates: Partial<GameSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    SaveManager.saveSettings(updated);
    soundEngine.setVolume(updated.soundVolume, updated.musicVolume);
    soundEngine.setMuted(updated.isMuted);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleSelectSlot = (slot: number) => {
    setActiveSlot(slot);
    SaveManager.setActiveSlot(slot);
    if (onSaveSlotSelected) {
      onSaveSlotSelected(slot);
    }
  };

  const handleDeleteSlot = (slot: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete Save Slot ${slot}? This cannot be undone.`)) {
      SaveManager.deleteSave(slot);
      setSettings({ ...settings });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-3xl border border-slate-700 bg-slate-950/95 p-5 sm:p-6 shadow-2xl flex flex-col text-slate-100 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-amber-200">
              Settings & Saves
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech">
              Configuration & Google Play Store Architecture
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* SECTION 1: AUDIO */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>Audio Controls</span>
            </h3>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs sm:text-sm font-medium">Master Audio Mute</span>
              <button
                onClick={() => handleUpdate({ isMuted: !settings.isMuted })}
                className={`p-2 rounded-xl border transition-colors ${
                  settings.isMuted
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                }`}
              >
                {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* SFX Volume */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span>Sound FX Volume</span>
                <span className="font-mono-tech">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleUpdate({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Music Volume */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span>Atmospheric Music</span>
                <span className="font-mono-tech">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleUpdate({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* SECTION 2: GRAPHICS & PERFORMANCE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span>Graphics & Mobile Optimization</span>
            </h3>

            {/* Quality Preset */}
            <div className="grid grid-cols-3 gap-2">
              {(['cinematic', 'balanced', 'performance'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleUpdate({ graphicsQuality: mode })}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono-tech capitalize transition-all ${
                    settings.graphicsQuality === mode
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Camera Shake */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium">Tectonic Tremor Screen Shake</span>
                <span className="text-[10px] text-slate-400">Rumbles during world shifts & boss attacks</span>
              </div>
              <button
                onClick={() => handleUpdate({ screenShake: !settings.screenShake })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.screenShake ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.screenShake ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SECTION 3: SAVE SLOTS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span>Save Slot Manager (Crash-Safe)</span>
            </h3>

            <div className="flex flex-col gap-2">
              {[
                { slot: 1, data: save1 },
                { slot: 2, data: save2 },
                { slot: 3, data: save3 },
              ].map(({ slot, data }) => (
                <div
                  key={slot}
                  onClick={() => handleSelectSlot(slot)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    activeSlot === slot
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono-tech ${
                        activeSlot === slot
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {slot}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {data ? data.title : 'Empty Save Slot'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-tech">
                        {data
                          ? `Discovered: ${data.discoveredLandmarks.length} • Relics: ${data.collectedItems.length}`
                          : 'Tap to select for new journey'}
                      </div>
                    </div>
                  </div>

                  {data && (
                    <button
                      onClick={(e) => handleDeleteSlot(slot, e)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: GOOGLE PLAY ARCHITECTURE COMPLIANCE */}
          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Google Play Policy & Premium Design Guarantee</span>
            </div>
            <p>
              • Fair Progression: No aggressive pay-to-win or artificial paywalls.
              <br />
              • Offline Playable: Full single-player living world simulation runs locally without cloud dependence.
              <br />
              • Privacy-Friendly: Zero intrusive data trackers. Local storage persistence.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>
    </div>
  );
};
