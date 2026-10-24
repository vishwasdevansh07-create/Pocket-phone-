import React, { useState } from 'react';
import { 
  CollectibleItem, 
  EnvironmentalPuzzle, 
  PlayerStats, 
  WorldObservation 
} from '../types/game';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Puzzle, 
  Scroll, 
  Heart, 
  CheckCircle, 
  Lock,
  Compass,
  Flame,
  Gem,
  Mountain,
  Trees,
  Waves,
  CloudRain,
  Eye,
  Activity,
  ArrowRight,
  Clock,
  Compass as CompassIcon,
  AlertTriangle
} from 'lucide-react';

interface JournalModalProps {
  collectibles: CollectibleItem[];
  puzzles: EnvironmentalPuzzle[];
  observations?: WorldObservation[];
  playerStats: PlayerStats;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  collectibles,
  puzzles,
  observations = [],
  playerStats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'observations' | 'relics' | 'puzzles' | 'lore' | 'companion'>('observations');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const discoveredRelicsCount = collectibles.filter((c) => c.discovered).length;
  const solvedPuzzlesCount = puzzles.filter((p) => p.solved).length;

  const filteredObservations = observations.filter((obs) => {
    if (filterCategory === 'all') return true;
    return obs.category === filterCategory;
  });

  const totalDisplacement = observations.reduce((acc, obs) => acc + obs.shiftDeltaMeters, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mountain':
        return <Mountain className="w-5 h-5 text-indigo-400" />;
      case 'forest':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'water':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'sky_isle':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      default:
        return <Activity className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[720px] rounded-3xl overflow-hidden border border-slate-700 bg-slate-950/95 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-amber-200">
                Explorer's Field Journal
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Shifts Logged: {observations.length} • Relics: {discoveredRelicsCount}/{collectibles.length} • Puzzles: {solvedPuzzlesCount}/{puzzles.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/30 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
          {/* TAB: World Observations */}
          <button
            onClick={() => setActiveTab('observations')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'observations'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>World Observations ({observations.length})</span>
          </button>

          {/* TAB: Relics */}
          <button
            onClick={() => setActiveTab('relics')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'relics'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Relics & Curios ({discoveredRelicsCount})</span>
          </button>

          {/* TAB: Puzzles */}
          <button
            onClick={() => setActiveTab('puzzles')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'puzzles'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Puzzle className="w-4 h-4 text-cyan-400" />
            <span>Environmental Puzzles ({solvedPuzzlesCount})</span>
          </button>

          {/* TAB: Lore */}
          <button
            onClick={() => setActiveTab('lore')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'lore'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scroll className="w-4 h-4 text-emerald-400" />
            <span>The Moving Mystery</span>
          </button>

          {/* TAB: Companion */}
          <button
            onClick={() => setActiveTab('companion')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'companion'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Kip the Spirit Fox</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* ======================================================== */}
          {/* TAB: WORLD OBSERVATIONS LOG                              */}
          {/* ======================================================== */}
          {activeTab === 'observations' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              {/* Header Overview Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/40 shadow-xl flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                      <CompassIcon className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-200">
                        Memory-Based Survey & Geological Log
                      </h3>
                      <p className="text-[11px] text-slate-300 font-mono-tech">
                        Real-time displacement logs recorded during field expeditions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono-tech">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-300 font-bold">
                      {observations.length} Shifts Witnessed
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-600/40 text-indigo-300">
                      ~{totalDisplacement}m Total Drift
                    </span>
                  </div>
                </div>

                <p className="text-xs text-amber-200/80 italic leading-relaxed">
                  "The world was never meant to stay still. Forests wander, mountains stagger, and trails vanish into ancient earth. Always verify landmark shifts against your hand-drawn discovery map."
                </p>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  {[
                    { id: 'all', label: 'All Observations' },
                    { id: 'forest', label: 'Forest Groves' },
                    { id: 'mountain', label: 'Mountains' },
                    { id: 'sky_isle', label: 'Zephyr Sky Isles' },
                    { id: 'water', label: 'Sunken Waters' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono-tech transition-all whitespace-nowrap ${
                        filterCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observation Timeline Stream */}
              {filteredObservations.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 space-y-2">
                  <Compass className="w-10 h-10 text-amber-500/40 mx-auto" />
                  <h4 className="font-cinzel text-sm font-bold text-slate-200">
                    No matching shift observations recorded yet
                  </h4>
                  <p className="text-xs max-w-sm mx-auto">
                    Continue exploring the Whispering Forest or rest near campfires to witness tectonic earthquakes and terrain migrations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredObservations.map((obs, idx) => (
                    <div
                      key={obs.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-amber-600/30 hover:border-amber-500/60 shadow-lg transition-all group"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Icon badge */}
                        <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner group-hover:border-amber-500/50 transition-colors">
                          {getCategoryIcon(obs.category)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Tags row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech uppercase">
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                                {obs.timeOfDay} • {obs.weather}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 font-bold">
                                {obs.landmarkName}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-bold flex items-center gap-1">
                              <span>+{obs.shiftDeltaMeters}m</span>
                              <span className="uppercase text-[9px]">{obs.direction}</span>
                            </span>
                          </div>

                          {/* Primary Headline */}
                          <h4 className="font-cinzel font-bold text-sm sm:text-base text-amber-200 tracking-wide mb-1 leading-snug">
                            “{obs.summaryText}”
                          </h4>

                          {/* Detailed Field Note */}
                          <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                            {obs.detailNote}
                          </p>

                          {/* Memory Divergence Reminder Footer */}
                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                            <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-[10px]">
                                Memory Note: Previous route blazes now divergent
                              </span>
                            </div>
                            <span className="font-mono-tech text-[10px] text-slate-500">
                              Entry #{String(observations.length - idx).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: RELICS                                              */}
          {/* ======================================================== */}
          {activeTab === 'relics' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collectibles.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.discovered
                      ? 'bg-slate-900/70 border-amber-500/40 shadow-lg'
                      : 'bg-slate-900/30 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        item.discovered
                          ? 'bg-amber-950/80 border-amber-500 text-amber-400'
                          : 'bg-slate-800/80 border-slate-700 text-slate-500'
                      }`}
                    >
                      {item.discovered ? (
                        item.category === 'relic' ? (
                          <Compass className="w-6 h-6" />
                        ) : item.category === 'upgrade' ? (
                          <Flame className="w-6 h-6" />
                        ) : (
                          <Gem className="w-6 h-6" />
                        )
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-cinzel font-bold text-sm text-slate-100">
                          {item.discovered ? item.name : 'Undiscovered Relic'}
                        </h4>
                        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.biome}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.discovered
                          ? item.description
                          : 'Hidden somewhere in this region. Look for glowing anomalies or follow Kip.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: PUZZLES                                             */}
          {/* ======================================================== */}
          {activeTab === 'puzzles' && (
            <div className="flex flex-col gap-4">
              {puzzles.map((puzzle) => (
                <div
                  key={puzzle.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    puzzle.solved
                      ? 'bg-slate-900/80 border-cyan-500/50 shadow-lg'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          puzzle.solved
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {puzzle.solved ? (
                          <CheckCircle className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Puzzle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-cinzel font-bold text-sm sm:text-base text-slate-100">
                            {puzzle.name}
                          </h4>
                          <span
                            className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full border ${
                              puzzle.solved
                                ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                                : 'bg-slate-800 border-slate-700 text-amber-300'
                            }`}
                          >
                            {puzzle.solved ? 'Solved' : 'Active Mystery'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2">
                          {puzzle.description}
                        </p>
                        <div className="text-xs text-amber-300/80 bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/30">
                          <strong>Field Clue:</strong> {puzzle.hint}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: LORE (THE MOVING MYSTERY)                            */}
          {/* ======================================================== */}
          {activeTab === 'lore' && (
            <div className="max-w-2xl mx-auto space-y-6 text-slate-300 leading-relaxed">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-600/40 shadow-xl space-y-3">
                <h3 className="font-cinzel text-lg font-bold text-amber-200">
                  The Premise: The Earth Does Not Rest
                </h3>
                <p className="text-sm">
                  Generations of cartographers have surrendered to madness attempting to survey this world. 
                  Villages awaken to find rivers running eastward where yesterday they flowed south. 
                  Ancient pines drift across valleys like slow herds.
                </p>
                <p className="text-sm">
                  Most inhabitants treat the tremors as ordinary nature. But the ancient ruins tell a different story: 
                  thousands of years ago, the land was motionless. Something awakened beneath the crust, and since that day, 
                  the continents have been traveling.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-600/40 shadow-xl space-y-3">
                <h3 className="font-cinzel text-lg font-bold text-cyan-200">
                  The Core Mystery: Where Is It Traveling?
                </h3>
                <p className="text-sm">
                  As you collect the Shifting Slate fragments, an undeniable pattern emerges: the mountain ranges 
                  and tectonic plates are not drifting at random. They are orienting toward an alignment.
                </p>
                <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-800/50 text-xs font-mono-tech text-cyan-300">
                  "The continents are not adrift. They are giant wings folding together for a flight yet to begin."
                  <br />— Inscription on the Starlight Vault Door
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: COMPANION KIP                                       */}
          {/* ======================================================== */}
          {activeTab === 'companion' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-950/60 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-800 to-orange-500 border-4 border-amber-300/60 shadow-xl flex items-center justify-center text-4xl shrink-0">
                  🦊
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h3 className="font-cinzel text-xl font-bold text-amber-200">Kip</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900 border border-amber-500 text-amber-300 font-mono-tech">
                      Bond Lv.{playerStats.bondLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">
                    A spirit fox born from the tectonic pulse. Sensitive to magnetic anomalies and ancient stone resonance.
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-amber-400 font-mono-tech">
                      <span>Bond Progress</span>
                      <span>{playerStats.bondXp} / 100 XP</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, playerStats.bondXp)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Companion Abilities List */}
              <div className="space-y-3">
                <h4 className="font-cinzel font-bold text-sm text-slate-200">Special Bond Abilities</h4>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-200">Radiant Pulse</h5>
                    <p className="text-[11px] text-slate-400">
                      Tap Kip's widget or the Pulse button to stun nearby fiends and reveal hidden footprints.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-600/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-cyan-200">Anomaly Scout</h5>
                    <p className="text-[11px] text-slate-400">
                      Kip pops an "!" bubble whenever a shifting secret or dormant cave is nearby.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
