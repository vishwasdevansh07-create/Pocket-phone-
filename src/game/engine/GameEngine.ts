import { Player } from '../entities/Player';
import { Companion } from '../entities/Companion';
import { Enemy } from '../entities/Enemies';
import { Renderer } from './Renderer';
import { MovingWorldSystem } from '../world/MovingWorldSystem';
import { WorldData, WorldPlatform, InteractiveObject } from '../world/WorldState';
import { Landmark, EnvironmentalPuzzle, CollectibleItem, SaveData, WeatherType, TimeOfDay } from '../../types/game';
import { SaveManager, GameSettings } from '../save/SaveManager';
import { soundEngine } from '../audio/AudioEngine';

export interface GameEngineCallbacks {
  onUpdateStats: (player: Player, companion: Companion) => void;
  onAlert: (alert: { title: string; subtitle: string; icon: string }) => void;
  onBossEncounter: (boss: Enemy | null) => void;
  onInteractPrompt: (prompt: string | null) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  public player: Player;
  public companion: Companion;
  public enemies: Enemy[] = [];
  public platforms: WorldPlatform[] = [];
  public interactives: InteractiveObject[] = [];
  public landmarks: Landmark[] = [];
  public puzzles: EnvironmentalPuzzle[] = [];
  public collectibles: CollectibleItem[] = [];
  public worldSystem: MovingWorldSystem;
  public settings: GameSettings;

  private isRunning: boolean = false;
  private lastTime: number = 0;
  public callbacks: GameEngineCallbacks;
  public activePrompt: string | null = null;
  public activeBoss: Enemy | null = null;
  private statsSyncTimer: number = 0;

  // Input states
  public inputX: number = 0;
  public isSprinting: boolean = false;
  private gravity: number = 950;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks, initialSave?: SaveData) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.renderer = new Renderer(this.ctx);
    this.callbacks = callbacks;
    this.settings = SaveManager.loadSettings();

    // Initialize world systems
    this.worldSystem = new MovingWorldSystem();
    this.landmarks = WorldData.getInitialLandmarks();
    this.puzzles = WorldData.getInitialPuzzles();
    this.collectibles = WorldData.getInitialCollectibles();

    // Platforms
    this.setupPlatforms();
    this.setupInteractives();
    this.setupEnemies();

    // Player and Companion
    const startX = initialSave ? initialSave.playerPos.x : 300;
    const startY = initialSave ? initialSave.playerPos.y : 720;
    this.player = new Player(startX, startY);
    this.companion = new Companion(startX - 40, startY + 10);

    if (initialSave) {
      this.player.stats = { ...initialSave.playerStats };
      this.worldSystem.timeOfDay = initialSave.timeOfDay;
      this.worldSystem.weather = initialSave.weather;
      this.worldSystem.totalWorldShifts = initialSave.worldShiftCounter;
      // Mark discovered landmarks & items
      initialSave.discoveredLandmarks.forEach(id => {
        const lm = this.landmarks.find(l => l.id === id);
        if (lm) lm.discovered = true;
      });
      initialSave.collectedItems.forEach(id => {
        const item = this.collectibles.find(c => c.id === id);
        if (item) item.discovered = true;
      });
      initialSave.solvedPuzzles.forEach(id => {
        const p = this.puzzles.find(pz => pz.id === id);
        if (p) p.solved = true;
      });
      if (initialSave.worldObservations && initialSave.worldObservations.length > 0) {
        this.worldSystem.worldObservations = [...initialSave.worldObservations];
      }
      if (initialSave.equippedCosmetics) {
        this.updateEquippedCosmetics(initialSave.equippedCosmetics);
      }
    }

    this.resize();
    window.addEventListener('resize', this.handleResize);
  }

  private setupPlatforms() {
    this.platforms = [
      // Starting Glade & Whispering Forest Ground
      { id: 'g_start', x: 0, y: 780, width: 1550, height: 120, type: 'ground' },
      // Wandering Grove Ledges
      { id: 'plat_grove_1', x: 650, y: 640, width: 180, height: 24, type: 'rock' },
      { id: 'plat_grove_2', x: 920, y: 530, width: 220, height: 24, type: 'rock' },
      { id: 'plat_grove_3', x: 1240, y: 440, width: 190, height: 24, type: 'tree_branch' },

      // Sunken Crossing & River Valley (Water Level alters traversal!)
      { id: 'water_river', x: 1550, y: 810, width: 750, height: 90, type: 'water' },
      { id: 'river_bed', x: 1550, y: 900, width: 750, height: 100, type: 'ground' },
      { id: 'stepping_stone_1', x: 1720, y: 795, width: 60, height: 40, type: 'rock' },
      { id: 'stepping_stone_2', x: 1940, y: 790, width: 70, height: 40, type: 'rock' },
      { id: 'stepping_stone_3', x: 2150, y: 785, width: 65, height: 40, type: 'rock' },

      // Monolith Altar plateau
      { id: 'g_monolith', x: 2300, y: 780, width: 1050, height: 120, type: 'ground' },
      { id: 'plat_mono_1', x: 2500, y: 620, width: 140, height: 24, type: 'rock' },
      { id: 'plat_mono_2', x: 2750, y: 510, width: 160, height: 24, type: 'rock' },

      // Floating Zephyr Isles (Moving platforms in the sky!)
      { id: 'float_isle_1', x: 2950, y: 380, width: 180, height: 30, type: 'floating_isle' },
      { id: 'float_isle_2', x: 3250, y: 270, width: 210, height: 30, type: 'floating_isle' },
      { id: 'float_isle_3', x: 3580, y: 340, width: 190, height: 30, type: 'floating_isle' },

      // Starlight Vault Descent
      { id: 'g_starlight', x: 3350, y: 780, width: 950, height: 120, type: 'ground' },
      { id: 'plat_vault_1', x: 3850, y: 650, width: 200, height: 24, type: 'rock' },

      // Ancient Arbiter Boss Arena
      { id: 'g_boss', x: 4300, y: 780, width: 900, height: 120, type: 'ground' },
      { id: 'boss_pillar_l', x: 4420, y: 620, width: 80, height: 160, type: 'rock' },
      { id: 'boss_pillar_r', x: 5050, y: 620, width: 80, height: 160, type: 'rock' }
    ];
  }

  private setupInteractives() {
    this.interactives = [
      // Campfire at starting glade
      {
        id: 'camp_1',
        x: 420,
        y: 755,
        width: 32,
        height: 25,
        type: 'campfire',
        label: 'Rest & Meditate (Save Game)'
      },
      // Rolling Boulder in Wandering Grove
      {
        id: 'boulder_1',
        x: 880,
        y: 605,
        width: 36,
        height: 36,
        type: 'boulder',
        label: 'Push Moss Boulder'
      },
      // Collectible 1: Whispering Leaf
      {
        id: 'col_leaf',
        x: 1320,
        y: 405,
        width: 24,
        height: 24,
        type: 'collectible',
        label: 'Discover Whispering Leaf of Old',
        collectibleId: 'whispering_leaf'
      },
      // Collectible 2: Sunken Chrono-Relic
      {
        id: 'col_chrono',
        x: 1960,
        y: 750,
        width: 24,
        height: 24,
        type: 'collectible',
        label: 'Retrieve Sunken Chrono-Relic',
        collectibleId: 'sunken_chrono_relic'
      },
      // Kip Pressure Switch for Ancient Gate
      {
        id: 'switch_kip',
        x: 2420,
        y: 770,
        width: 48,
        height: 12,
        type: 'pressure_plate',
        label: "Command Kip to Hold Switch",
        state: false
      },
      // Wind Updraft Geyser to launch into Zephyr Isles
      {
        id: 'wind_geyser_1',
        x: 2900,
        y: 400,
        width: 50,
        height: 380,
        type: 'wind_updraft',
        label: 'Deploy Glider in Thermal Updraft'
      },
      // Collectible 5: Shifting Slate 1
      {
        id: 'col_slate_1',
        x: 3340,
        y: 235,
        width: 24,
        height: 24,
        type: 'collectible',
        label: 'Examine Shifting Slate Fragment',
        collectibleId: 'shifting_slate_1'
      },
      // Starlight Vault Rune Altar
      {
        id: 'altar_starlight',
        x: 4020,
        y: 700,
        width: 60,
        height: 80,
        type: 'rune_altar',
        label: 'Examine Nocturnal Lunar Seal'
      },
      // Campfire near Vault
      {
        id: 'camp_2',
        x: 3620,
        y: 755,
        width: 32,
        height: 25,
        type: 'campfire',
        label: 'Rest & Meditate (Save Game)'
      }
    ];
  }

  private setupEnemies() {
    this.enemies = [
      // Wandering Grove Thornkin
      new Enemy('e_thorn_1', 'thornkin', 820, 740, 720, 1100),
      new Enemy('e_thorn_2', 'thornkin', 1180, 740, 950, 1450),

      // Sunken Crossing Mossback Golem
      new Enemy('e_moss_1', 'mossback', 1820, 710, 1680, 2220),

      // Monolith plateau enemies
      new Enemy('e_thorn_3', 'thornkin', 2600, 740, 2450, 2900),

      // Nocturnal Shadow Wisps (active primarily in dusk/night)
      new Enemy('e_wisp_1', 'shadow_wisp', 3900, 680, 3750, 4200),
      new Enemy('e_wisp_2', 'shadow_wisp', 4120, 640, 3950, 4280),

      // Arbiter Boss
      new Enemy('boss_arbiter', 'arbiter_boss', 4750, 670, 4400, 5100)
    ];
  }

  private handleResize = () => {
    this.resize();
  };

  public resize() {
    const maxDpr = this.settings.graphicsQuality === 'performance' ? 1.0 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.renderer.resize(w, h);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    soundEngine.init();
    soundEngine.resume();
    requestAnimationFrame(this.gameLoop);
  }

  public stop() {
    this.isRunning = false;
  }

  private gameLoop = (time: number) => {
    if (!this.isRunning) return;
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // clamp max dt
    this.lastTime = time;

    this.update(dt);
    this.render(dt);

    requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number) {
    // 1. World System update
    this.worldSystem.update(dt, this.landmarks, this.puzzles);

    // Drain pending alerts to callback
    while (this.worldSystem.pendingAlerts.length > 0) {
      const alert = this.worldSystem.pendingAlerts.shift()!;
      this.callbacks.onAlert(alert);
    }

    // 2. Player Update
    this.player.update(dt, this.inputX, this.isSprinting, this.gravity);

    // 3. Platform & Ground Collisions for Player
    this.checkPlatformCollisions(this.player, dt);

    // 4. Companion update
    const isDangerNear = this.enemies.some(e => !e.isDead && Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y) < 220);
    this.companion.update(dt, this.player, isDangerNear, this.gravity);
    this.checkPlatformCollisions(this.companion, dt);

    // 5. Enemies update & Boss Tracking
    let foundBoss: Enemy | null = null;
    this.enemies.forEach(enemy => {
      if (enemy.isDead) return;
      const isNight = this.worldSystem.timeOfDay === 'night' || this.worldSystem.timeOfDay === 'dusk';
      enemy.update(dt, this.player, this.gravity, isNight);
      this.checkPlatformCollisions(enemy, dt);

      // Boss detection
      if (enemy.isBoss && !enemy.isDead) {
        const distToBoss = Math.abs(enemy.pos.x - this.player.pos.x);
        if (distToBoss < 700) {
          foundBoss = enemy;
        }
      }

      // Attack Hitbox collision
      if (this.player.attackHitbox.active) {
        if (this.checkAABB(this.player.attackHitbox, enemy)) {
          enemy.takeDamage(this.player.attackHitbox.damage, this.player.facing === 'right' ? 1 : -1);
          this.renderer.addDamageText(enemy.pos.x + 10, enemy.pos.y - 15, `-${this.player.attackHitbox.damage}`);
          this.renderer.spawnSparks(enemy.pos.x + 15, enemy.pos.y + 20, 8);
          this.player.attackHitbox.active = false; // consume strike
        }
      }

      // Companion Radiant Pulse Stun
      if (this.companion.pulseActive) {
        const distToKip = Math.hypot(enemy.pos.x - this.companion.pos.x, enemy.pos.y - this.companion.pos.y);
        if (distToKip < this.companion.pulseRadius) {
          enemy.stun(2.5);
          this.renderer.addDamageText(enemy.pos.x, enemy.pos.y - 20, 'STUNNED!', '#38bdf8');
        }
      }
    });

    if (this.activeBoss !== foundBoss) {
      this.activeBoss = foundBoss;
      this.callbacks.onBossEncounter(foundBoss);
    }

    // 6. Interactive Triggers
    this.checkInteractives();

    // 7. Landmark Discovery Check
    this.landmarks.forEach(lm => {
      if (!lm.discovered) {
        const dist = Math.abs(this.player.pos.x - lm.currentPos.x);
        if (dist < 400) {
          lm.discovered = true;
          soundEngine.playDiscoveryChime();
          this.callbacks.onAlert({
            title: `Discovered: ${lm.name}`,
            subtitle: lm.description,
            icon: 'map-pin'
          });
        }
      }
    });

    // 8. Auto sync stats to UI (throttled to smooth ~12 FPS to avoid React re-render churn)
    this.statsSyncTimer += dt;
    if (this.statsSyncTimer >= 0.08) {
      this.statsSyncTimer = 0;
      this.callbacks.onUpdateStats(this.player, this.companion);
    }
  }

  private checkPlatformCollisions(entity: { pos: { x: number; y: number }; vel: { x: number; y: number }; width: number; height: number; onGround?: boolean; inWater?: boolean }, dt: number) {
    let grounded = false;
    let inWater = false;

    for (const p of this.platforms) {
      if (p.type === 'water') {
        const actualWaterY = p.y - (this.worldSystem.waterLevel - 0.3) * 60;
        if (
          entity.pos.x + entity.width > p.x &&
          entity.pos.x < p.x + p.width &&
          entity.pos.y + entity.height > actualWaterY &&
          entity.pos.y < actualWaterY + p.height
        ) {
          inWater = true;
          // Water buoyancy
          entity.vel.y *= 0.85;
          if (entity.vel.y > 60) entity.vel.y = 60;
        }
        continue;
      }

      // Floating Isle dynamic offset
      const platX = p.type === 'floating_isle' ? p.x + this.worldSystem.floatingIsleOffsetX : p.x;

      if (
        entity.pos.x + entity.width > platX &&
        entity.pos.x < platX + p.width
      ) {
        const footY = entity.pos.y + entity.height;
        // Check landing on top of platform
        if (footY >= p.y && footY <= p.y + 26 && entity.vel.y >= 0) {
          entity.pos.y = p.y - entity.height;
          entity.vel.y = 0;
          grounded = true;
        }
      }
    }

    if (entity.onGround !== undefined) {
      if (!entity.onGround && grounded) {
        // Landing dust
        this.renderer.spawnDust(entity.pos.x + entity.width * 0.5, entity.pos.y + entity.height, 4);
      }
      entity.onGround = grounded;
    }
    if (entity.inWater !== undefined) {
      entity.inWater = inWater;
    }
  }

  private checkInteractives() {
    let nearestPrompt: string | null = null;

    for (const obj of this.interactives) {
      const dist = Math.hypot(
        (this.player.pos.x + this.player.width * 0.5) - (obj.x + obj.width * 0.5),
        (this.player.pos.y + this.player.height * 0.5) - (obj.y + obj.height * 0.5)
      );

      // Wind updraft geyser trigger
      if (obj.type === 'wind_updraft' && dist < 120) {
        nearestPrompt = 'Thermal Updraft! Tap Jump/Glide to Soar';
        if (this.player.isGliding) {
          this.player.vel.y = -350; // Lift upward!
        }
        continue;
      }

      if (dist < 65) {
        nearestPrompt = obj.label;
        break;
      }
    }

    if (this.activePrompt !== nearestPrompt) {
      this.activePrompt = nearestPrompt;
      this.callbacks.onInteractPrompt(nearestPrompt);
    }
  }

  public interact() {
    for (const obj of this.interactives) {
      const dist = Math.hypot(
        (this.player.pos.x + this.player.width * 0.5) - (obj.x + obj.width * 0.5),
        (this.player.pos.y + this.player.height * 0.5) - (obj.y + obj.height * 0.5)
      );

      if (dist < 70) {
        if (obj.type === 'campfire') {
          // Campfire rest & save
          this.player.stats.health = this.player.stats.maxHealth;
          this.player.stats.stamina = this.player.stats.maxStamina;
          const nextTime: TimeOfDay = this.worldSystem.timeOfDay === 'day' ? 'dusk' : this.worldSystem.timeOfDay === 'dusk' ? 'night' : 'day';
          this.worldSystem.restAtCampfire(nextTime);
          this.saveCurrentGame();
          this.callbacks.onAlert({
            title: 'Game Saved at Campfire',
            subtitle: 'Journey recorded in your discovery journal.',
            icon: 'check'
          });
          return;
        } else if (obj.type === 'boulder') {
          // Push boulder
          soundEngine.playHitImpact();
          obj.x += (this.player.facing === 'right' ? 80 : -80);
          this.renderer.spawnDust(obj.x, obj.y + obj.height, 6);
          // Check if boulder hits an enemy
          this.enemies.forEach(e => {
            if (!e.isDead && Math.hypot(e.pos.x - obj.x, e.pos.y - obj.y) < 60) {
              e.takeDamage(75, this.player.facing === 'right' ? 1 : -1);
              this.renderer.addDamageText(e.pos.x, e.pos.y - 10, 'CRUSHED! -75', '#ef4444');
            }
          });
          return;
        } else if (obj.type === 'collectible' && obj.collectibleId) {
          // Collect item
          const item = this.collectibles.find(c => c.id === obj.collectibleId);
          if (item && !item.discovered) {
            item.discovered = true;
            this.player.stats.shiftingShards += 25;
            soundEngine.playDiscoveryChime();
            this.callbacks.onAlert({
              title: `Relic Found: ${item.name}`,
              subtitle: item.description,
              icon: 'sparkles'
            });
            // remove interactive
            const idx = this.interactives.indexOf(obj);
            if (idx >= 0) this.interactives.splice(idx, 1);
            return;
          }
        } else if (obj.type === 'pressure_plate') {
          // Command Kip to hold switch
          if (this.companion.stayTarget) {
            this.companion.toggleStayAt(null);
            obj.state = false;
          } else {
            this.companion.toggleStayAt({ x: obj.x + 10, y: obj.y - 15 });
            obj.state = true;
            this.callbacks.onAlert({
              title: 'Kip Holding Pressure Altar',
              subtitle: 'The ancient stone gate is held open!',
              icon: 'lock-open'
            });
          }
          return;
        } else if (obj.type === 'rune_altar') {
          // Examine rune altar
          soundEngine.playDiscoveryChime();
          this.worldSystem.triggerWorldShift(this.landmarks, 'Ancient altar resonated with the Earth!');
          return;
        }
      }
    }

    // If near Kip, pet Kip!
    const distToKip = Math.hypot(this.player.pos.x - this.companion.pos.x, this.player.pos.y - this.companion.pos.y);
    if (distToKip < 60) {
      const xp = this.companion.pet();
      this.player.stats.bondXp += xp;
      if (this.player.stats.bondXp >= 100) {
        this.player.stats.bondLevel++;
        this.player.stats.bondXp = 0;
        this.callbacks.onAlert({
          title: 'Bond Level Up!',
          subtitle: `Bond with Kip reached Level ${this.player.stats.bondLevel}!`,
          icon: 'heart'
        });
      }
    }
  }

  public saveCurrentGame(): boolean {
    const slot = SaveManager.getActiveSlot();
    const save: SaveData = {
      slot,
      title: 'Whispering Forest - Campfire',
      playerPos: { x: this.player.pos.x, y: this.player.pos.y },
      playerStats: { ...this.player.stats },
      timeOfDay: this.worldSystem.timeOfDay,
      timeCounter: this.worldSystem.dayProgress,
      weather: this.worldSystem.weather,
      worldShiftCounter: this.worldSystem.totalWorldShifts,
      discoveredLandmarks: this.landmarks.filter(l => l.discovered).map(l => l.id),
      collectedItems: this.collectibles.filter(c => c.discovered).map(c => c.id),
      solvedPuzzles: this.puzzles.filter(p => p.solved).map(p => p.id),
      worldObservations: [...this.worldSystem.worldObservations],
      playTimeMinutes: 12,
      timestamp: Date.now(),
      prologueCompleted: true
    };
    return SaveManager.saveGame(save);
  }

  public updateEquippedCosmetics(equipped?: { scarf?: string; companion?: string; staff?: string }) {
    if (!equipped) return;
    if (equipped.scarf === 'scarf_celestia') this.renderer.cosmeticScarfColor = '#0284c7';
    else if (equipped.scarf === 'scarf_amber') this.renderer.cosmeticScarfColor = '#f59e0b';
    else this.renderer.cosmeticScarfColor = '#dc2626';

    if (equipped.companion === 'kip_fox_aurora') this.renderer.cosmeticCompanionColor = '#06b6d4';
    else if (equipped.companion === 'kip_fox_golden') this.renderer.cosmeticCompanionColor = '#fbbf24';
    else this.renderer.cosmeticCompanionColor = '#ea580c';

    if (equipped.staff === 'staff_obsidian') this.renderer.cosmeticStaffColor = '#a855f7';
    else this.renderer.cosmeticStaffColor = '#38bdf8';
  }

  private checkAABB(a: { x: number; y: number; width: number; height: number }, b: { pos: { x: number; y: number }; width: number; height: number }): boolean {
    return (
      a.x < b.pos.x + b.width &&
      a.x + a.width > b.pos.x &&
      a.y < b.pos.y + b.height &&
      a.y + a.height > b.pos.y
    );
  }

  private render(dt: number) {
    this.renderer.render(
      dt,
      this.player,
      this.companion,
      this.enemies,
      this.platforms,
      this.interactives,
      this.worldSystem,
      this.settings.graphicsQuality
    );
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
  }
}
