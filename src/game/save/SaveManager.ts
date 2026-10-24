import { SaveData, PlayerStats, WeatherType, TimeOfDay } from '../../types/game';

const STORAGE_KEY_PREFIX = 'the_world_that_moves_slot_';
const ACTIVE_SLOT_KEY = 'the_world_that_moves_active_slot';
const SETTINGS_KEY = 'the_world_that_moves_settings';

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  isMuted: boolean;
  graphicsQuality: 'cinematic' | 'balanced' | 'performance';
  screenShake: boolean;
  joystickFloating: boolean;
  showDivergenceArrows: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.8,
  musicVolume: 0.6,
  isMuted: false,
  graphicsQuality: 'cinematic',
  screenShake: true,
  joystickFloating: false,
  showDivergenceArrows: true,
};

export const INITIAL_PLAYER_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  shiftingShards: 150,
  bondLevel: 1,
  bondXp: 0,
  unlockedGlider: true,
  unlockedChargeAttack: false,
};

export class SaveManager {
  public static getActiveSlot(): number {
    const raw = localStorage.getItem(ACTIVE_SLOT_KEY);
    return raw ? parseInt(raw, 10) : 1;
  }

  public static setActiveSlot(slot: number): void {
    localStorage.setItem(ACTIVE_SLOT_KEY, slot.toString());
  }

  public static getSave(slot: number): SaveData | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slot}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static saveGame(data: SaveData): boolean {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${data.slot}`, JSON.stringify(data));
      this.setActiveSlot(data.slot);
      return true;
    } catch {
      return false;
    }
  }

  public static deleteSave(slot: number): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slot}`);
  }

  public static createDefaultSave(slot: number): SaveData {
    return {
      slot,
      title: 'Whispering Forest - Journey Begins',
      playerPos: { x: 300, y: 720 },
      playerStats: { ...INITIAL_PLAYER_STATS },
      timeOfDay: 'dawn' as TimeOfDay,
      timeCounter: 0,
      weather: 'clear' as WeatherType,
      worldShiftCounter: 0,
      discoveredLandmarks: ['whispering_camp'],
      collectedItems: [],
      solvedPuzzles: [],
      worldObservations: [
        {
          id: 'obs_initial_prologue',
          timestamp: Date.now() - 300000,
          timeOfDay: 'dawn',
          weather: 'clear',
          landmarkName: 'The Whispering Forest',
          shiftDeltaMeters: 50,
          direction: 'south',
          summaryText: 'The Whispering Forest moved 50 meters south at dawn',
          detailNote: 'The first shift witnessed with Kip. The trail walked ten minutes prior sealed itself behind elder moss and ironwood roots.',
          category: 'forest'
        }
      ],
      playTimeMinutes: 0,
      timestamp: Date.now(),
      prologueCompleted: false,
    };
  }

  public static loadSettings(): GameSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  public static saveSettings(settings: GameSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
