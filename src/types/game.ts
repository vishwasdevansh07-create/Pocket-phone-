export type WeatherType = 'clear' | 'windy' | 'rain' | 'fog' | 'storm';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  shiftingShards: number;
  bondLevel: number;
  bondXp: number;
  unlockedGlider: boolean;
  unlockedChargeAttack: boolean;
}

export interface CollectibleItem {
  id: string;
  name: string;
  category: 'relic' | 'lore' | 'upgrade' | 'curio';
  description: string;
  icon: string;
  discovered: boolean;
  biome: string;
}

export interface Landmark {
  id: string;
  name: string;
  initialPos: Vector2D;
  currentPos: Vector2D;
  divergence: number; // Distance moved from player's recorded memory
  description: string;
  discovered: boolean;
  icon: string;
  type: 'mountain' | 'grove' | 'ruin' | 'island' | 'monolith' | 'shrine';
}

export interface EnvironmentalPuzzle {
  id: string;
  name: string;
  description: string;
  solved: boolean;
  hint: string;
  type: 'monolith_alignment' | 'plant_bridge' | 'companion_switch' | 'starlight_vault' | 'wind_updraft';
  progress: number; // 0 to 1
}

export interface WorldObservation {
  id: string;
  timestamp: number;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  landmarkName: string;
  shiftDeltaMeters: number;
  direction: string;
  summaryText: string;
  detailNote: string;
  category: 'mountain' | 'forest' | 'water' | 'sky_isle' | 'tectonic';
}

export interface PlayAchievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedDate?: string;
  icon: string;
}

export interface SaveData {
  slot: number;
  title: string;
  playerPos: Vector2D;
  playerStats: PlayerStats;
  timeOfDay: TimeOfDay;
  timeCounter: number;
  weather: WeatherType;
  worldShiftCounter: number;
  discoveredLandmarks: string[];
  collectedItems: string[];
  solvedPuzzles: string[];
  worldObservations?: WorldObservation[];
  unlockedCosmetics?: string[];
  equippedCosmetics?: {
    scarf?: string;
    companion?: string;
    staff?: string;
  };
  playStoreRated?: boolean;
  playTimeMinutes: number;
  timestamp: number;
  prologueCompleted: boolean;
}
