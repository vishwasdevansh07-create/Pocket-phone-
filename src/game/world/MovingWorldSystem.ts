import { WeatherType, TimeOfDay, Landmark, EnvironmentalPuzzle, Vector2D, WorldObservation } from '../../types/game';
import { soundEngine } from '../audio/AudioEngine';

export interface WorldTremorEvent {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
  message: string;
}

export interface SkyCreature {
  active: boolean;
  x: number;
  y: number;
  speed: number;
  length: number;
  type: 'sky_whale' | 'aurora_drake';
  alpha: number;
}

export class MovingWorldSystem {
  public timeOfDay: TimeOfDay = 'dawn';
  public dayProgress: number = 0.1; // 0 to 1
  public weather: WeatherType = 'clear';
  public weatherTimer: number = 0;
  public shiftCycleTimer: number = 0;
  public totalWorldShifts: number = 0;

  // Active tremor effect
  public currentTremor: WorldTremorEvent = {
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
    message: ''
  };

  // Sky leviathan drifting in upper atmosphere
  public skyCreature: SkyCreature = {
    active: true,
    x: -500,
    y: 80,
    speed: 0.35,
    length: 320,
    type: 'sky_whale',
    alpha: 0.6
  };

  // Water level state (0 = low tide/drained, 1 = high tide/flooded)
  public waterLevel: number = 0.3;
  public targetWaterLevel: number = 0.3;

  // Moving elements
  public mountainShiftX: number = 0;
  public targetMountainShiftX: number = 0;
  public wanderingTreeShiftX: number = 0;
  public floatingIsleOffsetX: number = 0;
  public monolithAlignment: number = 0; // 0 to 1

  // Notification queue for UI toast
  public pendingAlerts: Array<{ title: string; subtitle: string; icon: string }> = [];

  // World Observations Journal
  public worldObservations: WorldObservation[] = [
    {
      id: 'obs_initial_prologue',
      timestamp: Date.now() - 300000,
      timeOfDay: 'dawn',
      weather: 'clear',
      landmarkName: 'The Whispering Forest',
      shiftDeltaMeters: 50,
      direction: 'south',
      summaryText: 'The Whispering Forest moved 50 meters south at dawn',
      detailNote: 'The first shift witnessed with Kip. The trail walked ten minutes prior sealed itself into thick bramble. An ancient symbol ignited upon our traveler pack.',
      category: 'forest'
    },
    {
      id: 'obs_initial_peak',
      timestamp: Date.now() - 180000,
      timeOfDay: 'dawn',
      weather: 'clear',
      landmarkName: 'Mount Solis',
      shiftDeltaMeters: 140,
      direction: 'East',
      summaryText: 'Mount Solis shifted 140 meters East under the clear morning sky',
      detailNote: 'The distant snow needle mountain visibly staggered along the horizon during a low-frequency rumble. Hand-drawn survey bearings diverged by 4.2 degrees.',
      category: 'mountain'
    }
  ];

  constructor() {}

  public update(dt: number, landmarks: Landmark[], puzzles: EnvironmentalPuzzle[]) {
    // 1. Advance Day/Night cycle (full cycle in ~4 minutes of gameplay, or toggleable by campfires)
    this.dayProgress = (this.dayProgress + dt * 0.005) % 1.0;
    if (this.dayProgress < 0.2) {
      this.timeOfDay = 'dawn';
    } else if (this.dayProgress < 0.6) {
      this.timeOfDay = 'day';
    } else if (this.dayProgress < 0.8) {
      this.timeOfDay = 'dusk';
    } else {
      this.timeOfDay = 'night';
    }

    // 2. Weather progression
    this.weatherTimer += dt;
    if (this.weatherTimer > 45) { // weather shifts every 45s
      this.weatherTimer = 0;
      const weathers: WeatherType[] = ['clear', 'windy', 'rain', 'fog', 'storm'];
      const nextIdx = Math.floor(Math.random() * weathers.length);
      this.setWeather(weathers[nextIdx]);
    }

    // Water level reacts to rain or storm
    if (this.weather === 'rain' || this.weather === 'storm') {
      this.targetWaterLevel = 0.85;
    } else {
      this.targetWaterLevel = 0.25;
    }
    this.waterLevel += (this.targetWaterLevel - this.waterLevel) * (dt * 0.5);

    // 3. Sky leviathan drifting
    this.skyCreature.x += this.skyCreature.speed * 60 * dt;
    if (this.skyCreature.x > 5500) {
      this.skyCreature.x = -600;
      this.skyCreature.y = 60 + Math.random() * 120;
    }

    // 4. Tremor and living world shift cycle
    this.shiftCycleTimer += dt;
    if (this.shiftCycleTimer > 50) { // dynamic world shift trigger every 50s
      this.triggerWorldShift(landmarks);
      this.shiftCycleTimer = 0;
    }

    // Process active tremor
    if (this.currentTremor.active) {
      this.currentTremor.elapsed += dt;
      if (this.currentTremor.elapsed >= this.currentTremor.duration) {
        this.currentTremor.active = false;
      }
    }

    // Smooth interpolations of terrain morphs
    this.mountainShiftX += (this.targetMountainShiftX - this.mountainShiftX) * (dt * 0.8);
    this.floatingIsleOffsetX = Math.sin(Date.now() * 0.0008) * 80;

    // Check night vault puzzle status
    const vaultPuzzle = puzzles.find(p => p.id === 'puzzle_starlight_vault');
    if (vaultPuzzle && !vaultPuzzle.solved) {
      if (this.timeOfDay === 'night' || this.timeOfDay === 'dusk') {
        vaultPuzzle.progress = Math.min(1, vaultPuzzle.progress + dt * 0.5);
        if (vaultPuzzle.progress >= 1 && !vaultPuzzle.solved) {
          vaultPuzzle.solved = true;
          soundEngine.playDiscoveryChime();
          this.pendingAlerts.push({
            title: 'Starlight Vault Dissolved',
            subtitle: 'Moonlight has opened the nocturnal seal!',
            icon: 'sparkles'
          });
        }
      }
    }
  }

  public setWeather(newWeather: WeatherType) {
    if (this.weather === newWeather) return;
    this.weather = newWeather;
    this.pendingAlerts.push({
      title: 'Weather Transforming',
      subtitle: `Atmosphere shifted to: ${newWeather.toUpperCase()}`,
      icon: newWeather === 'rain' ? 'cloud-rain' : newWeather === 'windy' ? 'wind' : 'sun'
    });
  }

  public triggerWorldShift(landmarks: Landmark[], customMsg?: string) {
    this.totalWorldShifts++;
    this.currentTremor = {
      active: true,
      intensity: 12,
      duration: 3.2,
      elapsed: 0,
      message: customMsg || 'The Earth is shifting...'
    };
    soundEngine.playWorldTremor();

    // 1. Shift Mount Solis
    const shiftDelta = (Math.random() > 0.5 ? 1 : -1) * (90 + Math.random() * 120);
    this.targetMountainShiftX += shiftDelta;

    // 2. Shift Wandering Grove trees
    this.wanderingTreeShiftX = Math.sin(this.totalWorldShifts) * 70;

    // Update landmark divergences in player's memory
    landmarks.forEach(lm => {
      if (lm.id === 'mount_solis') {
        lm.currentPos.x = lm.initialPos.x + this.targetMountainShiftX;
        lm.divergence = Math.round(Math.abs(lm.currentPos.x - lm.initialPos.x));
      } else if (lm.id === 'wandering_grove') {
        lm.currentPos.x = lm.initialPos.x + this.wanderingTreeShiftX;
        lm.divergence = Math.round(Math.abs(this.wanderingTreeShiftX));
      } else if (lm.id === 'floating_isles') {
        lm.currentPos.x = lm.initialPos.x + (Math.random() - 0.5) * 140;
        lm.divergence = Math.round(Math.abs(lm.currentPos.x - lm.initialPos.x));
      }
    });

    this.pendingAlerts.push({
      title: 'The World Has Moved',
      subtitle: 'Landmarks have diverged from your recorded discovery map!',
      icon: 'globe'
    });

    // Record Observation Log for Journal
    const shiftChoices = [
      {
        landmark: 'The Whispering Forest',
        delta: Math.round(40 + Math.random() * 30),
        dir: this.totalWorldShifts % 2 === 0 ? 'south' : 'north',
        category: 'forest' as const,
        note: 'Ancient ironwood trunks migrated across the canyon floor. Old trails were buried under fresh loam; Kip whined softly before sniffing out a newly formed moss hollow.'
      },
      {
        landmark: 'Mount Solis',
        delta: Math.round(Math.abs(shiftDelta)),
        dir: shiftDelta > 0 ? 'East' : 'West',
        category: 'mountain' as const,
        note: `The snow-capped monolith visibly staggered along the horizon line. Hand-drawn survey bearings diverged by ${(Math.abs(shiftDelta) * 0.035).toFixed(1)} degrees.`
      },
      {
        landmark: 'The Drifting Zephyr Isles',
        delta: Math.round(60 + Math.random() * 50),
        dir: 'upward on thermal updrafts',
        category: 'sky_isle' as const,
        note: 'Buoyant magnetic rock foundations shifted on the mountain gale. Thermal updrafts now launch explorers into previously unreachable sky alcoves.'
      },
      {
        landmark: 'Sunken Sluice Basin',
        delta: Math.round(30 + Math.random() * 25),
        dir: 'westward into the gorge',
        category: 'water' as const,
        note: 'The riverbed altered its flow channel after the ground fractured. Ancient carved stepping stones surfaced above the waterline.'
      }
    ];

    const chosen = shiftChoices[(this.totalWorldShifts - 1) % shiftChoices.length];
    const newObservation: WorldObservation = {
      id: `obs_${Date.now()}_${this.totalWorldShifts}`,
      timestamp: Date.now(),
      timeOfDay: this.timeOfDay,
      weather: this.weather,
      landmarkName: chosen.landmark,
      shiftDeltaMeters: chosen.delta,
      direction: chosen.dir,
      summaryText: `${chosen.landmark} moved ${chosen.delta} meters ${chosen.dir} at ${this.timeOfDay}`,
      detailNote: chosen.note,
      category: chosen.category
    };
    this.worldObservations.unshift(newObservation);
  }

  public restAtCampfire(timeJump: TimeOfDay) {
    this.timeOfDay = timeJump;
    if (timeJump === 'dawn') this.dayProgress = 0.1;
    else if (timeJump === 'day') this.dayProgress = 0.35;
    else if (timeJump === 'dusk') this.dayProgress = 0.65;
    else this.dayProgress = 0.85;

    soundEngine.playDiscoveryChime();
    this.pendingAlerts.push({
      title: 'Rested by Ember Campfire',
      subtitle: `Time progressed to ${timeJump.toUpperCase()}. Health restored!`,
      icon: 'flame'
    });
  }
}
