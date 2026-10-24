import { SaveData, PlayAchievement } from '../../types/game';
import { SaveManager } from '../save/SaveManager';
import { soundEngine } from '../audio/AudioEngine';

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'scarf' | 'companion' | 'staff' | 'boots';
  costShards: number;
  description: string;
  colorPreview: string;
  unlockedByDefault?: boolean;
}

export const COSMETIC_CATALOG: CosmeticItem[] = [
  {
    id: 'scarf_crimson',
    name: 'Wanderer Scarlet Scarf',
    type: 'scarf',
    costShards: 0,
    description: 'The signature dynamic silk scarf woven with mountain winds.',
    colorPreview: '#dc2626',
    unlockedByDefault: true,
  },
  {
    id: 'scarf_celestia',
    name: 'Azure Celestia Cloak',
    type: 'scarf',
    costShards: 75,
    description: 'Imbued with the twilight hue of floating Zephyr sky islands.',
    colorPreview: '#0284c7',
  },
  {
    id: 'scarf_amber',
    name: 'Solar Solis Shawl',
    type: 'scarf',
    costShards: 120,
    description: 'Glows warmly in synchronization with the tectonic tremors.',
    colorPreview: '#f59e0b',
  },
  {
    id: 'kip_fox_spirit',
    name: 'Twin-Tail Spirit Ember',
    type: 'companion',
    costShards: 0,
    description: 'Kip\'s natural radiant ember fox form.',
    colorPreview: '#ea580c',
    unlockedByDefault: true,
  },
  {
    id: 'kip_fox_aurora',
    name: 'Celestial Aurora Fox',
    type: 'companion',
    costShards: 150,
    description: 'Translucent turquoise spirit aura reflecting starlight runes.',
    colorPreview: '#06b6d4',
  },
  {
    id: 'kip_fox_golden',
    name: 'Sunstone Kip',
    type: 'companion',
    costShards: 220,
    description: 'Golden spirit sparkles trail behind Kip during pulse surges.',
    colorPreview: '#fbbf24',
  },
  {
    id: 'staff_elder',
    name: 'Elder Oak Wanderstaff',
    type: 'staff',
    costShards: 0,
    description: 'Carved from non-migrating ironwood roots with a sky-blue quartz.',
    colorPreview: '#d97706',
    unlockedByDefault: true,
  },
  {
    id: 'staff_obsidian',
    name: 'Obsidian Monolith Staff',
    type: 'staff',
    costShards: 110,
    description: 'Forged from tectonic obsidian with a pulsing violet core.',
    colorPreview: '#a855f7',
  },
];

export const PLAY_ACHIEVEMENTS_LIST: Omit<PlayAchievement, 'unlocked' | 'unlockedDate'>[] = [
  {
    id: 'ach_shift_witness',
    title: 'The Awakening',
    description: 'Complete the prologue and witness the first living world shift.',
    xpReward: 500,
    icon: 'mountain',
  },
  {
    id: 'ach_divergence',
    title: 'Cartographer\'s Dilemma',
    description: 'Discover landmarks and observe divergence on your discovery map.',
    xpReward: 750,
    icon: 'compass',
  },
  {
    id: 'ach_spirit_bond',
    title: 'Twin-Tailed Bond',
    description: 'Pet Kip and advance to Companion Bond Level 2 or higher.',
    xpReward: 1000,
    icon: 'heart',
  },
  {
    id: 'ach_zephyr_glider',
    title: 'Zephyr Aeronaut',
    description: 'Deploy your glider into a thermal updraft to soar into the sky.',
    xpReward: 1000,
    icon: 'wind',
  },
  {
    id: 'ach_water_drain',
    title: 'Sunken Sluice',
    description: 'Drain the water level puzzle and uncover submerged stepping stones.',
    xpReward: 1250,
    icon: 'waves',
  },
  {
    id: 'ach_starlight_vault',
    title: 'Nocturnal Starlight',
    description: 'Find the Starlight Vault when its stone door dissolves under moonlight.',
    xpReward: 1500,
    icon: 'moon',
  },
  {
    id: 'ach_boss_arbiter',
    title: 'Giant Slayer',
    description: 'Defeat The Ancient Arbiter and recover the Sovereign Core.',
    xpReward: 2500,
    icon: 'award',
  },
  {
    id: 'ach_relic_collector',
    title: 'Antiquities Master',
    description: 'Uncover 5 or more ancient curios and forgotten traveler journals.',
    xpReward: 2000,
    icon: 'sparkles',
  },
];

export class PlayStoreManager {
  private static CLOUD_KEY = 'the_world_that_moves_google_play_cloud';

  public static getAchievements(save?: SaveData | null): PlayAchievement[] {
    return PLAY_ACHIEVEMENTS_LIST.map((ach) => {
      let unlocked = false;
      let unlockedDate: string | undefined = undefined;

      if (save) {
        if (ach.id === 'ach_shift_witness' && (save.prologueCompleted || save.worldShiftCounter > 0)) {
          unlocked = true;
          unlockedDate = 'Prologue Expedition';
        } else if (ach.id === 'ach_divergence' && save.discoveredLandmarks.length >= 2) {
          unlocked = true;
          unlockedDate = 'Discovery Survey';
        } else if (ach.id === 'ach_spirit_bond' && (save.playerStats.bondLevel >= 2 || save.playerStats.bondXp > 30)) {
          unlocked = true;
          unlockedDate = 'Spirit Camp';
        } else if (ach.id === 'ach_zephyr_glider' && save.playerStats.unlockedGlider) {
          unlocked = true;
          unlockedDate = 'Zephyr Isles';
        } else if (ach.id === 'ach_water_drain' && save.solvedPuzzles.some(p => p.includes('sluice') || p.includes('water'))) {
          unlocked = true;
          unlockedDate = 'Sunken Gorge';
        } else if (ach.id === 'ach_starlight_vault' && (save.timeOfDay === 'night' || save.solvedPuzzles.some(p => p.includes('vault') || p.includes('star')))) {
          unlocked = true;
          unlockedDate = 'Lunar Solstice';
        } else if (ach.id === 'ach_boss_arbiter' && (save.collectedItems.includes('item_arbiter_core') || save.discoveredLandmarks.includes('shrine_vault'))) {
          unlocked = true;
          unlockedDate = 'Plateau Arena';
        } else if (ach.id === 'ach_relic_collector' && save.collectedItems.length >= 3) {
          unlocked = true;
          unlockedDate = 'Ruins Expedition';
        }
      }

      return {
        ...ach,
        unlocked,
        unlockedDate: unlocked ? (unlockedDate || 'Recent Expedition') : undefined,
      };
    });
  }

  public static getUnlockedCosmetics(save?: SaveData | null): string[] {
    const list = new Set<string>(['scarf_crimson', 'kip_fox_spirit', 'staff_elder']);
    if (save?.unlockedCosmetics) {
      save.unlockedCosmetics.forEach(id => list.add(id));
    }
    return Array.from(list);
  }

  public static unlockCosmetic(save: SaveData, cosmeticId: string): boolean {
    const cosmetic = COSMETIC_CATALOG.find(c => c.id === cosmeticId);
    if (!cosmetic) return false;

    if (save.playerStats.shiftingShards < cosmetic.costShards) {
      return false;
    }

    save.playerStats.shiftingShards -= cosmetic.costShards;
    if (!save.unlockedCosmetics) save.unlockedCosmetics = [];
    if (!save.unlockedCosmetics.includes(cosmeticId)) {
      save.unlockedCosmetics.push(cosmeticId);
    }

    // Auto-equip purchased cosmetic
    if (!save.equippedCosmetics) save.equippedCosmetics = {};
    if (cosmetic.type === 'scarf') save.equippedCosmetics.scarf = cosmeticId;
    if (cosmetic.type === 'companion') save.equippedCosmetics.companion = cosmeticId;
    if (cosmetic.type === 'staff') save.equippedCosmetics.staff = cosmeticId;

    SaveManager.saveGame(save);
    soundEngine.playDiscoveryChime();
    return true;
  }

  public static equipCosmetic(save: SaveData, cosmeticId: string): void {
    const cosmetic = COSMETIC_CATALOG.find(c => c.id === cosmeticId);
    if (!cosmetic) return;

    if (!save.equippedCosmetics) save.equippedCosmetics = {};
    if (cosmetic.type === 'scarf') save.equippedCosmetics.scarf = cosmeticId;
    if (cosmetic.type === 'companion') save.equippedCosmetics.companion = cosmeticId;
    if (cosmetic.type === 'staff') save.equippedCosmetics.staff = cosmeticId;

    SaveManager.saveGame(save);
    soundEngine.playCompanionChirp(true);
  }

  public static submitStoreReview(save: SaveData): boolean {
    if (save.playStoreRated) return false;
    save.playStoreRated = true;
    save.playerStats.shiftingShards += 100; // 100 Shards bonus reward!
    SaveManager.saveGame(save);
    soundEngine.playDiscoveryChime();
    return true;
  }

  public static syncToCloud(save: SaveData): { success: boolean; timestamp: number } {
    try {
      const payload = {
        save,
        timestamp: Date.now(),
        gamerTag: 'Wanderer#8921',
        device: 'Google Play Games Cloud',
      };
      localStorage.setItem(this.CLOUD_KEY, JSON.stringify(payload));
      soundEngine.playDiscoveryChime();
      return { success: true, timestamp: payload.timestamp };
    } catch {
      return { success: false, timestamp: Date.now() };
    }
  }

  public static getCloudBackupInfo(): { timestamp: number; title: string } | null {
    try {
      const raw = localStorage.getItem(this.CLOUD_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        timestamp: data.timestamp || Date.now(),
        title: data.save?.title || 'Expedition Backup',
      };
    } catch {
      return null;
    }
  }

  public static restoreFromCloud(targetSlot: number): SaveData | null {
    try {
      const raw = localStorage.getItem(this.CLOUD_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.save) return null;

      const restoredSave: SaveData = {
        ...data.save,
        slot: targetSlot,
        timestamp: Date.now(),
      };
      SaveManager.saveGame(restoredSave);
      soundEngine.playDiscoveryChime();
      return restoredSave;
    } catch {
      return null;
    }
  }
}
