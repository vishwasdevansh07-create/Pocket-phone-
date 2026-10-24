import { Vector2D, PlayerStats } from '../../types/game';
import { soundEngine } from '../audio/AudioEngine';

export type PlayerState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'gliding' | 'climbing' | 'swimming' | 'attacking' | 'charged_attack' | 'dodge' | 'hit' | 'resting';

export interface AttackHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  active: boolean;
  knockback: number;
}

export class Player {
  public pos: Vector2D = { x: 300, y: 720 };
  public vel: Vector2D = { x: 0, y: 0 };
  public width: number = 36;
  public height: number = 64;
  public facing: 'left' | 'right' = 'right';
  public state: PlayerState = 'idle';
  public onGround: boolean = true;
  public inWater: boolean = false;
  public isGliding: boolean = false;
  
  // Animation timers
  public animTime: number = 0;
  public scarfPoints: Array<{ x: number; y: number }> = [];
  public ghostTrails: Array<{ x: number; y: number; alpha: number; facing: 'left' | 'right' }> = [];
  
  // Combat & Stats
  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    shiftingShards: 0,
    bondLevel: 1,
    bondXp: 0,
    unlockedGlider: true,
    unlockedChargeAttack: true
  };

  public attackCombo: number = 0; // 0, 1, 2
  public attackTimer: number = 0;
  public attackChargeTime: number = 0;
  public isChargingAttack: boolean = false;
  public dodgeTimer: number = 0;
  public ghostTrailTimer: number = 0;
  public invulnerableTimer: number = 0;
  public footstepTimer: number = 0;

  public attackHitbox: AttackHitbox = {
    x: 0,
    y: 0,
    width: 50,
    height: 60,
    damage: 25,
    active: false,
    knockback: 12
  };

  constructor(x = 300, y = 720) {
    this.pos = { x, y };
    // Initialize scarf points
    for (let i = 0; i < 6; i++) {
      this.scarfPoints.push({ x: this.pos.x, y: this.pos.y + 16 + i * 4 });
    }
  }

  public update(dt: number, inputX: number, isSprinting: boolean, gravity: number) {
    this.animTime += dt;

    // 1. Invulnerability and Dodge cooldowns
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      this.ghostTrailTimer += dt;
      if (this.ghostTrailTimer >= 0.07 && this.ghostTrails.length < 4) {
        this.ghostTrailTimer = 0;
        this.ghostTrails.push({
          x: this.pos.x,
          y: this.pos.y,
          alpha: 0.6,
          facing: this.facing
        });
      }
      if (this.dodgeTimer <= 0 && this.state === 'dodge') {
        this.state = this.onGround ? 'idle' : 'falling';
      }
    }

    // Update ghost trails
    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      this.ghostTrails[i].alpha -= dt * 2.5;
      if (this.ghostTrails[i].alpha <= 0) {
        this.ghostTrails.splice(i, 1);
      }
    }

    // 2. Attack state timers
    if (this.state === 'attacking' || this.state === 'charged_attack') {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.attackHitbox.active = false;
        this.state = this.onGround ? 'idle' : 'falling';
      }
    }

    // Charging attack
    if (this.isChargingAttack) {
      this.attackChargeTime += dt;
      // Stamina drain
      this.stats.stamina = Math.max(0, this.stats.stamina - dt * 15);
    }

    // 3. Movement Physics (when not locked in dodge or charge)
    if (this.state !== 'dodge') {
      const speed = isSprinting && this.stats.stamina > 10 ? 320 : 200;
      
      if (Math.abs(inputX) > 0.1) {
        this.vel.x = inputX * speed;
        this.facing = inputX > 0 ? 'right' : 'left';
        if (this.onGround && this.state !== 'attacking' && this.state !== 'charged_attack') {
          this.state = isSprinting ? 'running' : 'walking';
          // Stamina drain during sprint
          if (isSprinting) {
            this.stats.stamina = Math.max(0, this.stats.stamina - dt * 18);
          }
        }

        // Footstep sounds
        this.footstepTimer += dt;
        const stepRate = isSprinting ? 0.28 : 0.42;
        if (this.footstepTimer >= stepRate && this.onGround) {
          this.footstepTimer = 0;
          soundEngine.playFootstep(this.inWater);
        }
      } else {
        this.vel.x *= 0.7; // friction
        if (this.onGround && this.state !== 'attacking' && this.state !== 'charged_attack' && this.state !== 'resting') {
          this.state = 'idle';
        }
      }
    }

    // 4. Gliding & Air Physics
    if (!this.onGround) {
      if (this.isGliding && this.stats.stamina > 5 && this.vel.y > 0) {
        this.vel.y = 80; // gentle descent speed
        this.state = 'gliding';
        this.stats.stamina = Math.max(0, this.stats.stamina - dt * 12);
      } else {
        if (this.isGliding && this.stats.stamina <= 5) {
          this.isGliding = false;
        }
        this.vel.y += gravity * dt;
        if (this.state !== 'attacking' && this.state !== 'dodge') {
          this.state = this.vel.y < 0 ? 'jumping' : 'falling';
        }
      }
    } else {
      this.isGliding = false;
      // Recover stamina on ground
      if (!isSprinting && !this.isChargingAttack) {
        this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + dt * 25);
      }
    }

    // Apply Velocity
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Update dynamic Scarf physics
    this.updateScarf(dt);

    // Update attack hitbox position
    if (this.attackHitbox.active) {
      const offsetX = this.facing === 'right' ? this.width : -this.attackHitbox.width;
      this.attackHitbox.x = this.pos.x + offsetX;
      this.attackHitbox.y = this.pos.y + 10;
    }
  }

  private updateScarf(dt: number) {
    const anchorX = this.pos.x + (this.facing === 'right' ? 10 : 26);
    const anchorY = this.pos.y + 18;

    this.scarfPoints[0] = { x: anchorX, y: anchorY };
    const windOffset = Math.sin(this.animTime * 6) * 6;
    const speedTrail = (this.facing === 'right' ? -1 : 1) * Math.min(25, Math.abs(this.vel.x) * 0.08);

    for (let i = 1; i < this.scarfPoints.length; i++) {
      const prev = this.scarfPoints[i - 1];
      const curr = this.scarfPoints[i];
      const targetX = prev.x + speedTrail - (this.facing === 'right' ? 6 : -6) + (i * 2 * (this.isGliding ? 2.5 : 1));
      const targetY = prev.y + (this.isGliding ? -2 : 4) + windOffset * 0.4;

      curr.x += (targetX - curr.x) * Math.min(1, dt * 18);
      curr.y += (targetY - curr.y) * Math.min(1, dt * 18);
    }
  }

  public jump() {
    if (this.onGround) {
      this.vel.y = -440;
      this.onGround = false;
      this.state = 'jumping';
      soundEngine.playJump();
    } else if (this.stats.unlockedGlider && !this.isGliding && this.stats.stamina > 15) {
      // Mid-air jump press toggles glider
      this.isGliding = true;
      this.vel.y = 40;
      soundEngine.playGliderOpen();
    }
  }

  public releaseGlider() {
    this.isGliding = false;
  }

  public dodge() {
    if (this.dodgeTimer <= 0 && this.stats.stamina >= 20) {
      this.stats.stamina -= 20;
      this.dodgeTimer = 0.35;
      this.invulnerableTimer = 0.4;
      this.state = 'dodge';
      const dir = this.facing === 'right' ? 1 : -1;
      this.vel.x = dir * 480;
      soundEngine.playDodge();
    }
  }

  public startAttack() {
    if (this.state === 'dodge') return;
    this.isChargingAttack = true;
    this.attackChargeTime = 0;
  }

  public releaseAttack() {
    if (!this.isChargingAttack) return;
    this.isChargingAttack = false;

    if (this.attackChargeTime >= 0.8 && this.stats.unlockedChargeAttack && this.stats.stamina >= 30) {
      // Charged Shockwave Attack
      this.stats.stamina -= 30;
      this.state = 'charged_attack';
      this.attackTimer = 0.45;
      this.attackHitbox = {
        x: this.pos.x - 40,
        y: this.pos.y - 10,
        width: 120,
        height: 80,
        damage: 65,
        active: true,
        knockback: 24
      };
      soundEngine.playAttackSwing();
      soundEngine.playHitImpact();
    } else {
      // Light Combo Attack
      this.attackCombo = (this.attackCombo + 1) % 3;
      this.state = 'attacking';
      this.attackTimer = 0.28;
      this.attackHitbox = {
        x: this.pos.x + (this.facing === 'right' ? this.width : -60),
        y: this.pos.y + 10,
        width: 60,
        height: 50,
        damage: 25 + this.attackCombo * 10,
        active: true,
        knockback: 10 + this.attackCombo * 4
      };
      soundEngine.playAttackSwing();
    }
  }

  public takeDamage(damage: number, knockbackDir: number) {
    if (this.invulnerableTimer > 0) return;
    this.stats.health = Math.max(0, this.stats.health - damage);
    this.invulnerableTimer = 0.8;
    this.vel.x = knockbackDir * 280;
    this.vel.y = -180;
    this.onGround = false;
    soundEngine.playHitImpact();
  }
}
