import { Landmark, EnvironmentalPuzzle, CollectibleItem, WeatherType, TimeOfDay, Vector2D } from '../../types/game';

export interface WorldPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'rock' | 'floating_isle' | 'tree_branch' | 'plant_bridge' | 'water';
  vx?: number; // moving platform velocity
  minX?: number;
  maxX?: number;
  active?: boolean;
}

export interface InteractiveObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'campfire' | 'boulder' | 'pressure_plate' | 'ancient_lever' | 'collectible' | 'rune_altar' | 'wind_updraft';
  label: string;
  state?: boolean | number;
  collectibleId?: string;
}

export class WorldData {
  public static getInitialLandmarks(): Landmark[] {
    return [
      {
        id: 'mount_solis',
        name: 'Mount Solis (Distant Peak)',
        initialPos: { x: 1200, y: 150 },
        currentPos: { x: 1200, y: 150 },
        divergence: 0,
        description: 'A colossal needle peak crowned with eternal snow. Legends say it was once situated leagues to the west.',
        discovered: true,
        icon: 'mountain',
        type: 'mountain'
      },
      {
        id: 'wandering_grove',
        name: 'The Wandering Grove',
        initialPos: { x: 1100, y: 650 },
        currentPos: { x: 1100, y: 650 },
        divergence: 0,
        description: 'Ancient ironwood trees whose root-systems migrate across the valley floor over days and seasons.',
        discovered: false,
        icon: 'tree',
        type: 'grove'
      },
      {
        id: 'sunken_crossing',
        name: 'Sunken Sluice & River Valley',
        initialPos: { x: 1950, y: 780 },
        currentPos: { x: 1950, y: 780 },
        divergence: 0,
        description: 'A forgotten waterway that fills and recedes with rainfall, exposing drowned stone arcades.',
        discovered: false,
        icon: 'waves',
        type: 'ruin'
      },
      {
        id: 'shifting_monoliths',
        name: 'The Three Aligning Monoliths',
        initialPos: { x: 2800, y: 600 },
        currentPos: { x: 2800, y: 600 },
        divergence: 0,
        description: 'Gigantic obsidian slabs tuned to seismic vibrations. When aligned, celestial energy radiates outward.',
        discovered: false,
        icon: 'monument',
        type: 'monolith'
      },
      {
        id: 'floating_isles',
        name: 'Drifting Zephyr Isles',
        initialPos: { x: 3300, y: 280 },
        currentPos: { x: 3300, y: 280 },
        divergence: 0,
        description: 'Buoyant magnetic rock islands suspended in wind currents, drifting slowly across the upper troposphere.',
        discovered: false,
        icon: 'cloud',
        type: 'island'
      },
      {
        id: 'starlight_vault',
        name: 'The Starlight Vault',
        initialPos: { x: 4050, y: 680 },
        currentPos: { x: 4050, y: 680 },
        divergence: 0,
        description: 'A subterranean sanctum sealed behind solid stone that dissolves only when moonlight touches its runes.',
        discovered: false,
        icon: 'sparkles',
        type: 'shrine'
      }
    ];
  }

  public static getInitialCollectibles(): CollectibleItem[] {
    return [
      {
        id: 'whispering_leaf',
        name: 'Whispering Leaf of Old',
        category: 'relic',
        description: 'An amber leaf from the World-Tree that never withers. It vibrates softly whenever the ground begins to shift.',
        icon: 'leaf',
        discovered: false,
        biome: 'Whispering Forest'
      },
      {
        id: 'sunken_chrono_relic',
        name: 'Sunken Chrono-Relic',
        category: 'relic',
        description: 'A brass astrolabe found beneath the tidal river. Its dials track tectonic drift instead of planetary orbits.',
        icon: 'compass',
        discovered: false,
        biome: 'Sunken Crossing'
      },
      {
        id: 'starfall_geode',
        name: 'Starfall Geode',
        category: 'curio',
        description: 'A crystalline mineral forged in the heart of a fallen meteor, glowing with soft cyan starlight.',
        icon: 'gem',
        discovered: false,
        biome: 'Monolith Altar'
      },
      {
        id: 'nomad_journal',
        name: "Nomad's Forgotten Journal",
        category: 'lore',
        description: 'Scattered pages from a past cartographer: "Day 42: The canyon has moved three miles south. My compass spins aimlessly..."',
        icon: 'book',
        discovered: false,
        biome: 'Abandoned Camp'
      },
      {
        id: 'shifting_slate_1',
        name: 'Shifting Slate Fragment I',
        category: 'lore',
        description: 'Ancient stone tablet depicting continents arranged in spiral patterns that twist like clockwork.',
        icon: 'scroll',
        discovered: false,
        biome: 'Zephyr Isles'
      },
      {
        id: 'shifting_slate_2',
        name: 'Shifting Slate Fragment II',
        category: 'lore',
        description: 'Runic transcript: "The Earth wanders not from malice, but toward the Great Convergence."',
        icon: 'scroll',
        discovered: false,
        biome: 'Starlight Vault'
      },
      {
        id: 'celestial_compass_part',
        name: 'Celestial Compass Needle',
        category: 'upgrade',
        description: 'A magnetic needle that points toward shifting anomalies, warning of imminent terrain morphs.',
        icon: 'navigation',
        discovered: false,
        biome: 'Starlight Vault'
      },
      {
        id: 'lumina_bloom_petal',
        name: 'Lumina Bloom Petal',
        category: 'curio',
        description: 'A delicate petal that only blooms during midnight rainstorms, radiating soothing restorative warmth.',
        icon: 'flower',
        discovered: false,
        biome: 'The High Canopy'
      },
      {
        id: 'petrified_elder_branch',
        name: 'Petrified Elder Branch',
        category: 'upgrade',
        description: 'Infuses your explorer staff with resonant earthen energy, unlocking the Charged Earth-Shatter attack!',
        icon: 'wand',
        discovered: false,
        biome: 'The Wandering Grove'
      },
      {
        id: 'sovereign_core',
        name: 'Sovereign Core of the Wandering World',
        category: 'relic',
        description: 'The pulsing heart of the Arbiter. When held, you can hear the subterranean heartbeat of the entire living continent.',
        icon: 'flame',
        discovered: false,
        biome: "Arbiter's Hollow"
      }
    ];
  }

  public static getInitialPuzzles(): EnvironmentalPuzzle[] {
    return [
      {
        id: 'puzzle_grove_path',
        name: 'The Wandering Grove Path',
        description: 'Navigate through the elder trees. When tremors occur, a hidden cavern path opens on the lower roots.',
        solved: false,
        hint: 'Listen for the world tremor or strike the resonant bell tree.',
        type: 'plant_bridge',
        progress: 0
      },
      {
        id: 'puzzle_river_drain',
        name: 'The Sunken Sluice Drainage',
        description: 'Turn the ancient sluice mechanism or await rainfall to alter water levels and reveal the stepping stones.',
        solved: false,
        hint: 'The sluice wheel is located near the ancient water turbine.',
        type: 'plant_bridge',
        progress: 0
      },
      {
        id: 'puzzle_companion_switch',
        name: "Kip's Ancient Pressure Altar",
        description: 'Signal your companion Kip to hold the sun switch so the hydraulic stone barrier stays lowered.',
        solved: false,
        hint: 'Approach the switch and tap the Companion Action button.',
        type: 'companion_switch',
        progress: 0
      },
      {
        id: 'puzzle_monolith_align',
        name: 'The Tri-Monolith Resonator',
        description: 'Rotate the central dial until all three shifting obsidian pillars hum at harmonic resonance.',
        solved: false,
        hint: 'Observe the glowing rune lines on the pillar bases.',
        type: 'monolith_alignment',
        progress: 0
      },
      {
        id: 'puzzle_starlight_vault',
        name: 'The Nocturnal Lunar Seal',
        description: 'The entrance to the Starlight Vault is solid during daytime. Await nightfall or meditate by the campfire.',
        solved: false,
        hint: 'Rest at the nearby campfire until dusk or starry night.',
        type: 'starlight_vault',
        progress: 0
      }
    ];
  }
}
