import { Player } from '../entities/Player';
import { Companion } from '../entities/Companion';
import { Enemy } from '../entities/Enemies';
import { MovingWorldSystem } from '../world/MovingWorldSystem';
import { WorldPlatform, InteractiveObject } from '../world/WorldState';
import { WeatherType, TimeOfDay } from '../../types/game';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'leaf' | 'spark' | 'rain' | 'dust' | 'rune' | 'water_splash';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 1280;
  private height: number = 720;
  public cameraX: number = 0;
  public cameraY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;
  public screenShake: { x: number; y: number } = { x: 0, y: 0 };
  public cosmeticScarfColor: string = '#dc2626';
  public cosmeticCompanionColor: string = '#ea580c';
  public cosmeticStaffColor: string = '#38bdf8';
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private cachedSkyGrad: CanvasGradient | null = null;
  private cachedSkyTimeOfDay: string = '';
  private cachedSkyHeight: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public addDamageText(x: number, y: number, text: string, color: string = '#f59e0b') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0.8
    });
  }

  public spawnSparks(x: number, y: number, count: number = 8, color: string = '#f59e0b') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.4,
        type: 'spark'
      });
    }
  }

  public spawnDust(x: number, y: number, count: number = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 40,
        vy: -10 - Math.random() * 30,
        size: 3 + Math.random() * 3,
        color: 'rgba(217, 180, 130, 0.4)',
        alpha: 0.6,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        type: 'dust'
      });
    }
  }

  public render(
    dt: number,
    player: Player,
    companion: Companion,
    enemies: Enemy[],
    platforms: WorldPlatform[],
    interactives: InteractiveObject[],
    worldSystem: MovingWorldSystem,
    quality: 'cinematic' | 'balanced' | 'performance'
  ) {
    const ctx = this.ctx;

    // 1. Smooth Camera Tracking
    this.targetCameraX = player.pos.x - this.width * 0.4;
    this.targetCameraY = player.pos.y - this.height * 0.65;
    this.cameraX += (this.targetCameraX - this.cameraX) * Math.min(1, dt * 6.5);
    this.cameraY += (this.targetCameraY - this.cameraY) * Math.min(1, dt * 5.0);

    // Camera limits
    this.cameraX = Math.max(0, Math.min(4800 - this.width, this.cameraX));
    this.cameraY = Math.max(-100, Math.min(800 - this.height, this.cameraY));

    // Tremor screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (worldSystem.currentTremor.active) {
      const shakeAmt = worldSystem.currentTremor.intensity;
      shakeX = (Math.random() - 0.5) * shakeAmt;
      shakeY = (Math.random() - 0.5) * shakeAmt;
    }
    this.screenShake = { x: shakeX, y: shakeY };

    ctx.save();
    // (Notice: redundant clearRect is omitted since renderSkyAndAtmosphere paints the full viewport)

    // 2. Render Sky & Atmosphere Background (Parallax factor 0)
    this.renderSkyAndAtmosphere(worldSystem);

    // Apply Camera Transform
    ctx.save();
    ctx.translate(-this.cameraX + shakeX, -this.cameraY + shakeY);

    // 3. Far Parallax Layer: Shifting Mount Solis & Horizon
    this.renderDistantMountains(worldSystem);

    // 4. Sky Leviathan
    this.renderSkyCreature(worldSystem.skyCreature);

    // 5. Mid Parallax Layer: Wandering Ridge & Forest Silhouettes
    this.renderMidForestParallax(worldSystem);

    // 6. Ground, Platforms, Water & Plant Bridges (with Viewport Frustum Culling)
    this.renderPlatformsAndTerrain(platforms, worldSystem);

    // 7. Interactive Altars, Levers, Boulders & Campfires (Culling applied)
    this.renderInteractives(interactives, worldSystem);

    // 8. Companion Kip
    this.renderCompanion(companion);

    // 9. Enemies & Mini-Boss Arbiter (Culling applied)
    this.renderEnemies(enemies);

    // 10. Main Character Kael (Explorer)
    this.renderPlayer(player, dt);

    // 11. Weather & Particles (Wind leaves, Rain, Spores)
    this.updateAndRenderParticles(dt, worldSystem, quality);

    // 12. Floating Damage / Discovery Texts
    this.renderFloatingTexts(dt);

    ctx.restore(); // Restore camera translation

    // 13. Screen-Space Vignette & Atmospheric Lighting
    this.renderCinematicOverlay(worldSystem);

    ctx.restore();
  }

  private renderSkyAndAtmosphere(world: MovingWorldSystem) {
    const ctx = this.ctx;
    
    if (
      !this.cachedSkyGrad ||
      this.cachedSkyTimeOfDay !== world.timeOfDay ||
      this.cachedSkyHeight !== this.height
    ) {
      const grad = ctx.createLinearGradient(0, 0, 0, this.height);
      if (world.timeOfDay === 'dawn') {
        grad.addColorStop(0, '#1c1b33');
        grad.addColorStop(0.45, '#4a2545');
        grad.addColorStop(0.75, '#c9614e');
        grad.addColorStop(1, '#f59e0b');
      } else if (world.timeOfDay === 'day') {
        grad.addColorStop(0, '#1e40af');
        grad.addColorStop(0.45, '#38bdf8');
        grad.addColorStop(0.85, '#bae6fd');
        grad.addColorStop(1, '#e0f2fe');
      } else if (world.timeOfDay === 'dusk') {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.4, '#3b1845');
        grad.addColorStop(0.75, '#b45309');
        grad.addColorStop(1, '#ea580c');
      } else {
        // Night
        grad.addColorStop(0, '#040711');
        grad.addColorStop(0.5, '#0b1329');
        grad.addColorStop(1, '#172554');
      }
      this.cachedSkyGrad = grad;
      this.cachedSkyTimeOfDay = world.timeOfDay;
      this.cachedSkyHeight = this.height;
    }

    ctx.fillStyle = this.cachedSkyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Night stars and celestial nebula
    if (world.timeOfDay === 'night' || world.timeOfDay === 'dusk') {
      const alpha = world.timeOfDay === 'night' ? 0.85 : 0.35;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % this.width);
        const sy = ((i * 89.3) % (this.height * 0.6));
        const rad = (i % 3 === 0) ? 1.8 : 1.0;
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moon with high-speed hardware-accelerated dual-alpha glow
      const moonX = this.width * 0.78;
      const moonY = this.height * 0.18;
      ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderDistantMountains(world: MovingWorldSystem) {
    const ctx = this.ctx;
    const parallaxX = this.cameraX * 0.88;
    const shiftX = world.mountainShiftX;

    // Distant Mount Solis
    ctx.fillStyle = world.timeOfDay === 'night' ? '#0d1830' : '#4338ca';
    ctx.beginPath();
    ctx.moveTo(800 + shiftX + parallaxX, 850);
    ctx.lineTo(1250 + shiftX + parallaxX, 180); // Solis Peak
    ctx.lineTo(1350 + shiftX + parallaxX, 220);
    ctx.lineTo(1750 + shiftX + parallaxX, 850);
    ctx.closePath();
    ctx.fill();

    // Snowcap on Mount Solis
    ctx.fillStyle = world.timeOfDay === 'night' ? '#93c5fd' : '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(1200 + shiftX + parallaxX, 270);
    ctx.lineTo(1250 + shiftX + parallaxX, 180);
    ctx.lineTo(1310 + shiftX + parallaxX, 240);
    ctx.lineTo(1280 + shiftX + parallaxX, 285);
    ctx.closePath();
    ctx.fill();
  }

  private renderSkyCreature(creature: { active: boolean; x: number; y: number; length: number; type: string }) {
    if (!creature.active) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(creature.x, creature.y);

    // Ethereal sky whale silhouette
    ctx.fillStyle = 'rgba(186, 230, 253, 0.28)';
    ctx.beginPath();
    ctx.ellipse(100, 30, 90, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whale fins & tail
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(-20, 10);
    ctx.lineTo(-10, 45);
    ctx.closePath();
    ctx.fill();

    // Luminescent dorsal runes
    ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(60 + i * 22, 22, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderMidForestParallax(world: MovingWorldSystem) {
    const ctx = this.ctx;
    const shiftGrove = world.wanderingTreeShiftX;
    const baseColor = world.timeOfDay === 'night' ? '#081726' : '#14532d';

    ctx.fillStyle = baseColor;
    const viewLeft = this.cameraX - 150;
    const viewRight = this.cameraX + this.width + 150;

    for (let i = 0; i < 18; i++) {
      const tx = i * 260 + (i % 2 === 0 ? shiftGrove : -shiftGrove);
      if (tx + 120 < viewLeft || tx > viewRight) continue; // Culling

      const ty = 480;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 60, ty - 180);
      ctx.lineTo(tx + 120, ty);
      ctx.closePath();
      ctx.fill();
    }
  }

  private renderPlatformsAndTerrain(platforms: WorldPlatform[], world: MovingWorldSystem) {
    const ctx = this.ctx;
    const viewLeft = this.cameraX - 100;
    const viewRight = this.cameraX + this.width + 100;

    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      const platX = p.type === 'floating_isle' ? p.x + world.floatingIsleOffsetX : p.x;

      // Viewport Frustum Culling
      if (platX + p.width < viewLeft || platX > viewRight) {
        continue;
      }

      if (p.type === 'water') {
        const actualWaterY = p.y - (world.waterLevel - 0.3) * 60;
        const actualHeight = p.height + (world.waterLevel - 0.3) * 60;

        const waterGrad = ctx.createLinearGradient(p.x, actualWaterY, p.x, actualWaterY + actualHeight);
        waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.7)');
        waterGrad.addColorStop(0.3, 'rgba(3, 105, 161, 0.85)');
        waterGrad.addColorStop(1, 'rgba(2, 44, 78, 0.95)');

        ctx.fillStyle = waterGrad;
        ctx.fillRect(p.x, actualWaterY, p.width, actualHeight);

        // Water surface caustics & shimmer wave
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const startX = Math.max(p.x, viewLeft);
        const endX = Math.min(p.x + p.width, viewRight);
        for (let x = startX; x <= endX; x += 24) {
          const wave = Math.sin(x * 0.05 + Date.now() * 0.003) * 4;
          if (x === startX) ctx.moveTo(x, actualWaterY + wave);
          else ctx.lineTo(x, actualWaterY + wave);
        }
        ctx.stroke();
      } else if (p.type === 'floating_isle') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(platX, p.y, p.width, 24, 8);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(platX + 15, p.y + 24);
        ctx.lineTo(platX + p.width * 0.5, p.y + 65);
        ctx.lineTo(platX + p.width - 15, p.y + 24);
        ctx.closePath();
        ctx.fill();

        // Magnetic cyan core glow underneath (hardware-accelerated circle)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(platX + p.width * 0.5, p.y + 35, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.beginPath();
        ctx.arc(platX + p.width * 0.5, p.y + 35, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.fillRect(platX, p.y - 4, p.width, 6);
      } else {
        const isGround = p.type === 'ground';
        ctx.fillStyle = isGround ? '#1e293b' : '#334155';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = world.timeOfDay === 'night' ? '#166534' : '#22c55e';
        ctx.fillRect(p.x, p.y, p.width, 8);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        for (let cx = p.x + 30; cx < p.x + p.width - 20; cx += 80) {
          ctx.beginPath();
          ctx.moveTo(cx, p.y + 12);
          ctx.lineTo(cx + 10, p.y + 35);
          ctx.stroke();
        }
      }
    }
  }

  private renderInteractives(interactives: InteractiveObject[], world: MovingWorldSystem) {
    const ctx = this.ctx;
    const viewLeft = this.cameraX - 80;
    const viewRight = this.cameraX + this.width + 80;

    for (let i = 0; i < interactives.length; i++) {
      const obj = interactives[i];
      if (obj.x + obj.width < viewLeft || obj.x > viewRight) {
        continue; // Frustum Culling
      }

      ctx.save();
      ctx.translate(obj.x, obj.y);

      if (obj.type === 'campfire') {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(obj.width * 0.5, obj.height - 4, 14, 0, Math.PI);
        ctx.fill();

        const flameHeight = 18 + Math.sin(Date.now() * 0.015) * 6;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(obj.width * 0.5 - 10, obj.height - 4);
        ctx.quadraticCurveTo(obj.width * 0.5, obj.height - 4 - flameHeight * 1.3, obj.width * 0.5 + 10, obj.height - 4);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(obj.width * 0.5 - 6, obj.height - 4);
        ctx.quadraticCurveTo(obj.width * 0.5, obj.height - 4 - flameHeight, obj.width * 0.5 + 6, obj.height - 4);
        ctx.fill();

        // Warm radial light aura
        const lightGrad = ctx.createRadialGradient(obj.width * 0.5, obj.height - 12, 5, obj.width * 0.5, obj.height - 12, 110);
        lightGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        lightGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(obj.width * 0.5, obj.height - 12, 110, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'rune_altar') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, obj.width, obj.height);

        ctx.strokeStyle = world.timeOfDay === 'night' ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(obj.width * 0.5, 30, 18, 0, Math.PI * 2);
        ctx.moveTo(obj.width * 0.5, 12);
        ctx.lineTo(obj.width * 0.5, 48);
        ctx.moveTo(obj.width * 0.5 - 18, 30);
        ctx.lineTo(obj.width * 0.5 + 18, 30);
        ctx.stroke();
      } else if (obj.type === 'boulder') {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(obj.width * 0.5, obj.height * 0.5, obj.width * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(obj.width * 0.4, obj.height * 0.35, obj.width * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'pressure_plate') {
        const isPressed = Boolean(obj.state);
        ctx.fillStyle = isPressed ? '#f59e0b' : '#334155';
        ctx.fillRect(0, isPressed ? 10 : 4, obj.width, isPressed ? 8 : 14);
      } else if (obj.type === 'wind_updraft') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 2;
        for (let j = 0; j < 3; j++) {
          const streamY = (Date.now() * 0.15 + j * 40) % obj.height;
          ctx.beginPath();
          ctx.moveTo(10 + j * 15, obj.height - streamY);
          ctx.lineTo(10 + j * 15, obj.height - streamY - 25);
          ctx.stroke();
        }
      } else if (obj.type === 'collectible') {
        const bob = Math.sin(Date.now() * 0.005) * 6;
        // Hardware accelerated glow
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.arc(obj.width * 0.5, obj.height * 0.5 + bob, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(obj.width * 0.5, obj.height * 0.5 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderCompanion(companion: Companion) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(companion.pos.x, companion.pos.y);

    // Radiant Pulse ring if active
    if (companion.pulseActive) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(companion.width * 0.5, companion.height * 0.5, companion.pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (companion.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-companion.width, 0);
    }

    // Fox Body
    ctx.fillStyle = this.cosmeticCompanionColor;
    ctx.beginPath();
    ctx.ellipse(14, 18, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly fur
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(16, 20, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fox Head
    ctx.fillStyle = this.cosmeticCompanionColor;
    ctx.beginPath();
    ctx.arc(22, 10, 9, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(18, 5);
    ctx.lineTo(21, -3);
    ctx.lineTo(24, 4);
    ctx.closePath();
    ctx.fill();

    // Glowing Spirit Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(24, 9, 2, 0, Math.PI * 2);
    ctx.fill();

    // Twin Feathery Spirit Tails (Dynamic Sine Wave Sway)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(4, 18);
    ctx.quadraticCurveTo(-12 + Math.sin(companion.animTime * 6) * 6, 4, -4, 2);
    ctx.quadraticCurveTo(-6, 12, 4, 18);
    ctx.fill();

    // Alert "!" exclamation icon
    if (companion.mood === 'alert') {
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('!', 12, -10);
    }

    ctx.restore();
  }

  private renderEnemies(enemies: Enemy[]) {
    const ctx = this.ctx;
    const viewLeft = this.cameraX - 100;
    const viewRight = this.cameraX + this.width + 100;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy.isDead) continue;
      // Frustum Culling
      if (enemy.pos.x + enemy.width < viewLeft || enemy.pos.x > viewRight) {
        continue;
      }

      ctx.save();
      ctx.translate(enemy.pos.x, enemy.pos.y);

      const isFlashing = enemy.hitFlashTimer > 0;

      if (enemy.type === 'thornkin') {
        ctx.fillStyle = isFlashing ? '#ffffff' : '#15803d';
        ctx.beginPath();
        ctx.ellipse(16, 20, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, 10);
        ctx.lineTo(8, 0);
        ctx.moveTo(20, 10);
        ctx.lineTo(24, 0);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(enemy.facing === 'right' ? 22 : 10, 18, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'mossback') {
        ctx.fillStyle = isFlashing ? '#ffffff' : '#334155';
        ctx.fillRect(0, 0, enemy.width, enemy.height);

        ctx.fillStyle = '#16a34a';
        ctx.fillRect(0, 0, enemy.width, 14);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(enemy.facing === 'right' ? 36 : 12, 22, 16, 6);
      } else if (enemy.type === 'shadow_wisp') {
        // Fast dual glow circle instead of shadowBlur
        ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
        ctx.beginPath();
        ctx.arc(15, 15, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isFlashing ? '#ffffff' : 'rgba(147, 51, 234, 0.85)';
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'arbiter_boss') {
        ctx.fillStyle = isFlashing ? '#ffffff' : (enemy.bossPhase === 2 ? '#7f1d1d' : '#1e293b');
        ctx.fillRect(0, 0, enemy.width, enemy.height);

        // Glowing Molten/Tectonic Core with fast concentric aura
        ctx.fillStyle = enemy.bossPhase === 2 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)';
        ctx.beginPath();
        ctx.arc(enemy.width * 0.5, enemy.height * 0.45, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = enemy.bossPhase === 2 ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(enemy.width * 0.5, enemy.height * 0.45, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.fillRect(-10, 0, 24, 30);
        ctx.fillRect(enemy.width - 14, 0, 24, 30);
      }

      if (!enemy.isBoss && enemy.health < enemy.maxHealth) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, -10, enemy.width, 5);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, -10, (enemy.health / enemy.maxHealth) * enemy.width, 5);
      }

      ctx.restore();
    }
  }

  private renderPlayer(player: Player, dt: number) {
    const ctx = this.ctx;

    // Render Ghost Trails from Dodge Roll
    for (let i = 0; i < player.ghostTrails.length; i++) {
      const trail = player.ghostTrails[i];
      ctx.save();
      ctx.translate(trail.x, trail.y);
      ctx.fillStyle = `rgba(56, 189, 248, ${trail.alpha * 0.5})`;
      ctx.fillRect(0, 0, player.width, player.height);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(player.pos.x, player.pos.y);

    if (player.facing === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-player.width, 0);
    }

    // Glider Wings
    if (player.isGliding) {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(player.width * 0.5, 14);
      ctx.lineTo(-35, -12);
      ctx.lineTo(player.width + 35, -12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(player.width * 0.5, 14);
      ctx.lineTo(-35, -12);
      ctx.moveTo(player.width * 0.5, 14);
      ctx.lineTo(player.width + 35, -12);
      ctx.stroke();
    }

    // 1. Legs / Boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 42, 8, 22);
    ctx.fillRect(20, 42, 8, 22);

    // 2. Weathered Travel Coat
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.roundRect(6, 20, 24, 26, 4);
    ctx.fill();

    // 3. Explorer Backpack with Glowing Celestial Rune
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 22, 8, 18);

    // Pulsating Celestial Rune on backpack (fast aura)
    const pulseGlow = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(245, 158, 11, ${pulseGlow * 0.35})`;
    ctx.beginPath();
    ctx.arc(4, 30, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(245, 158, 11, ${pulseGlow})`;
    ctx.beginPath();
    ctx.arc(4, 30, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head & Adventurer Hair
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(18, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(20, 14, 7, 0, Math.PI * 2);
    ctx.fill();

    // 5. Explorer Staff
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(26, 8);
    ctx.lineTo(32, 56);
    ctx.stroke();

    ctx.fillStyle = this.cosmeticStaffColor;
    ctx.beginPath();
    ctx.arc(26, 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Attack Arc Trail
    if (player.state === 'attacking') {
      ctx.strokeStyle = this.cosmeticStaffColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(26, 28, 38, -Math.PI * 0.4, Math.PI * 0.3);
      ctx.stroke();
    }

    ctx.restore();

    // 7. Dynamic Scarlet Scarf Render
    ctx.save();
    ctx.strokeStyle = this.cosmeticScarfColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (player.scarfPoints.length > 0) {
      ctx.moveTo(player.scarfPoints[0].x, player.scarfPoints[0].y);
      for (let k = 1; k < player.scarfPoints.length; k++) {
        ctx.lineTo(player.scarfPoints[k].x, player.scarfPoints[k].y);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  private updateAndRenderParticles(dt: number, world: MovingWorldSystem, quality: string) {
    const ctx = this.ctx;
    const isStormOrRain = world.weather === 'rain' || world.weather === 'storm';

    // Spawn ambient weather particles according to quality
    const maxParticles = quality === 'performance' ? 30 : quality === 'balanced' ? 65 : 90;
    if (this.particles.length < maxParticles) {
      if (isStormOrRain) {
        this.particles.push({
          x: this.cameraX + Math.random() * this.width,
          y: this.cameraY - 20,
          vx: world.weather === 'storm' ? -80 : -20,
          vy: 550 + Math.random() * 150,
          size: 1.5,
          color: 'rgba(186, 230, 253, 0.75)',
          alpha: 0.8,
          life: 0,
          maxLife: 1.1,
          type: 'rain'
        });
      } else {
        const isNight = world.timeOfDay === 'night';
        this.particles.push({
          x: this.cameraX + Math.random() * this.width,
          y: this.cameraY + Math.random() * this.height,
          vx: (Math.random() - 0.5) * 40 - 25,
          vy: 15 + Math.random() * 25,
          size: isNight ? 2.5 : 3.5,
          color: isNight ? 'rgba(56, 189, 248, 0.7)' : 'rgba(245, 158, 11, 0.75)',
          alpha: 0.8,
          life: 0,
          maxLife: 2.8 + Math.random() * 1.5,
          type: isNight ? 'rune' : 'leaf'
        });
      }
    }

    // Update and draw particles with O(1) swap-and-pop removal
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      ctx.fillStyle = p.color;
      if (p.type === 'rain') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.04, p.y + p.vy * 0.04);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderFloatingTexts(dt: number) {
    const ctx = this.ctx;
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 35 * dt;
      ft.alpha = Math.max(0, ft.life / 0.8);

      if (ft.life <= 0) {
        this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1];
        this.floatingTexts.pop();
        continue;
      }

      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.globalAlpha = ft.alpha;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  private renderCinematicOverlay(world: MovingWorldSystem) {
    // Fog overlay if foggy (vignette is handled in hardware via CSS overlay in App)
    if (world.weather === 'fog') {
      const ctx = this.ctx;
      ctx.fillStyle = 'rgba(203, 213, 225, 0.18)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}
