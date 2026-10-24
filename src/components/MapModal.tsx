import React, { useState } from 'react';
import { Landmark, Vector2D } from '../types/game';
import { 
  X, 
  Compass, 
  AlertTriangle, 
  MapPin, 
  Layers, 
  Mountain, 
  Trees, 
  Sparkles, 
  CloudRain, 
  Eye
} from 'lucide-react';

interface MapModalProps {
  landmarks: Landmark[];
  playerPos: Vector2D;
  worldShiftCounter: number;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  landmarks,
  playerPos,
  worldShiftCounter,
  onClose,
}) => {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    landmarks.find((l) => l.discovered) || landmarks[0]
  );
  const [showGhostPositions, setShowGhostPositions] = useState(true);

  // Normalize world coords (0..4800) into map canvas coordinates (percentage)
  const getMapX = (worldX: number) => {
    return Math.max(5, Math.min(95, (worldX / 4800) * 100));
  };

  const getMapY = (worldY: number) => {
    return Math.max(10, Math.min(90, (worldY / 900) * 100));
  };

  const discoveredCount = landmarks.filter((l) => l.discovered).length;
  const anyDivergence = landmarks.some((l) => l.divergence > 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[720px] rounded-3xl overflow-hidden border-2 border-amber-700/60 shadow-2xl parchment-bg flex flex-col text-amber-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-amber-900/40 flex items-center justify-between bg-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-900/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-amber-200">
                Explorer's Hand-Drawn Discovery Map
              </h2>
              <p className="text-xs text-amber-400/80 font-mono-tech">
                Surveys Recorded: {discoveredCount} / {landmarks.length} • World Shifts: {worldShiftCounter}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGhostPositions(!showGhostPositions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-tech transition-colors ${
                showGhostPositions
                  ? 'bg-amber-800/60 border-amber-400 text-amber-200'
                  : 'bg-stone-900/60 border-stone-700 text-stone-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Divergence Ghosts</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-700/60 text-amber-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Divergence Alert Banner if mountains or groves moved */}
        {anyDivergence && (
          <div className="bg-amber-950/90 border-b border-amber-600/40 px-4 py-2 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Divergence Detected:</strong> The land has shifted since your initial survey. Previous map ink notes no longer match current horizon lines!
            </span>
          </div>
        )}

        {/* Main Body: Map Canvas & Landmark Lore Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Center: Interactive Parchment Map */}
          <div className="flex-1 relative p-4 sm:p-6 bg-[#16120d] flex items-center justify-center overflow-hidden">
            {/* Map Frame Container */}
            <div className="relative w-full h-full max-h-[480px] rounded-2xl border border-amber-800/30 bg-[#1e1912] shadow-inner p-4 overflow-hidden">
              {/* Compass Rose watermark */}
              <div className="absolute top-4 right-4 pointer-events-none opacity-20 text-amber-400">
                <Compass className="w-24 h-24" />
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#3d2c1d15_1px,transparent_1px),linear-gradient(to_bottom,#3d2c1d15_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

              {/* Hand-Drawn Biome sketches */}
              <div className="absolute left-[10%] top-[40%] text-[10px] uppercase tracking-widest text-amber-500/40 font-cinzel">
                Whispering Forest
              </div>
              <div className="absolute left-[35%] top-[70%] text-[10px] uppercase tracking-widest text-amber-500/40 font-cinzel">
                Sunken River Basin
              </div>
              <div className="absolute left-[58%] top-[25%] text-[10px] uppercase tracking-widest text-amber-500/40 font-cinzel">
                Zephyr Sky Isles
              </div>
              <div className="absolute left-[78%] top-[65%] text-[10px] uppercase tracking-widest text-amber-500/40 font-cinzel">
                Starlight Vault Ridge
              </div>

              {/* Biome divider rivers / trails (SVG path) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <path
                  d="M 50,220 Q 200,260 400,240 T 750,280"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Landmarks Placed on Map */}
              {landmarks.map((lm) => {
                const mapX = getMapX(lm.currentPos.x);
                const mapY = getMapY(lm.currentPos.y);
                const initX = getMapX(lm.initialPos.x);
                const isSelected = selectedLandmark?.id === lm.id;
                const hasMoved = lm.divergence > 15;

                return (
                  <React.Fragment key={lm.id}>
                    {/* Ghost Initial Position (if shifted) */}
                    {showGhostPositions && hasMoved && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${initX}%`, top: `${mapY}%` }}
                      >
                        <div className="w-7 h-7 rounded-full border-2 border-dashed border-red-400/60 flex items-center justify-center text-red-400/60">
                          <span className="text-[9px] font-mono-tech">OLD</span>
                        </div>
                        {/* Connecting displacement line */}
                        <div className="text-[8px] text-red-400/80 font-mono-tech text-center mt-0.5">
                          {lm.divergence}m
                        </div>
                      </div>
                    )}

                    {/* Current Real-Time Position */}
                    <button
                      onClick={() => setSelectedLandmark(lm)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 scale-125 shadow-xl ring-4 ring-amber-400/40 z-20'
                          : lm.discovered
                          ? 'bg-amber-900/80 text-amber-200 hover:bg-amber-700 border border-amber-500/50 z-10'
                          : 'bg-stone-800/80 text-stone-500 border border-stone-700/40 z-0'
                      }`}
                      style={{ left: `${mapX}%`, top: `${mapY}%` }}
                    >
                      {lm.type === 'mountain' ? (
                        <Mountain className="w-5 h-5" />
                      ) : lm.type === 'grove' ? (
                        <Trees className="w-5 h-5" />
                      ) : lm.type === 'island' ? (
                        <CloudRain className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}

              {/* Player Position Pin on Map */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                style={{
                  left: `${getMapX(playerPos.x)}%`,
                  top: `${getMapY(playerPos.y)}%`,
                }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 animate-ping absolute" />
                  <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-[9px]">
                    ▲
                  </div>
                </div>
                <span className="text-[9px] font-bold text-cyan-300 font-mono-tech bg-slate-950/80 px-1 rounded absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  Kael & Kip
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Selected Landmark Inspector & Lore */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-amber-900/40 p-4 sm:p-5 bg-amber-950/20 overflow-y-auto flex flex-col justify-between">
            {selectedLandmark ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono-tech uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-600/40 text-amber-300">
                      {selectedLandmark.type}
                    </span>
                    {selectedLandmark.discovered ? (
                      <span className="text-[10px] font-mono-tech text-emerald-400">
                        ✓ Surveyed
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono-tech text-stone-400">
                        ? Rumored
                      </span>
                    )}
                  </div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-100">
                    {selectedLandmark.name}
                  </h3>
                </div>

                {/* Divergence Metrics Box */}
                {selectedLandmark.divergence > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-900/40 border border-amber-600/50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-medium">Recorded Divergence</span>
                      <span className="font-mono-tech text-amber-200 font-bold">
                        +{selectedLandmark.divergence} meters
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/70 italic">
                      "Wait... this mountain wasn't here before. The horizon line has migrated."
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="text-xs text-amber-200/90 leading-relaxed space-y-2">
                  <p>{selectedLandmark.description}</p>
                </div>

                {/* Coordinates */}
                <div className="p-2.5 rounded-xl bg-black/30 border border-amber-900/40 text-[11px] font-mono-tech text-amber-400/80 flex items-center justify-between">
                  <span>Current X: {Math.round(selectedLandmark.currentPos.x)}m</span>
                  <span>Altitude: {Math.round(selectedLandmark.currentPos.y)}m</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-400/60 italic text-center py-8">
                Select a landmark pin on the map to inspect its recorded geological drift.
              </div>
            )}

            {/* Bottom Tip */}
            <div className="mt-4 p-3 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-[10px] text-amber-300/80 leading-normal">
              <strong>Tip:</strong> The Living World shifts during earthquakes and seasonal tides. Always verify landmarks before planning long expeditions!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
