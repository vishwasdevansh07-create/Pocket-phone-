import { Vector2D } from '../../types/game';
import { Player } from './Player';
import { soundEngine } from '../audio/AudioEngine';

export type CompanionMood = 'calm' | 'excited' | 'alert' | 'resting' | 'holding_switch';

export class Companion {
  public pos: Vector2D = { x: 260, y: 730 };
  public vel: Vector2D = { x: 0, y: 0 };
  public width: number = 28;
  public height: number = 28;
  public facing: 'left' | 'right' = 'right';
  public mood: CompanionMood = 'calm';
  public animTime: number = 0;
  
  // Spirit Fox visual trail & twin tails
  public tailAngle: number = 0;
  public earTwitchTime: number = 0;
  public alertTimer: number = 0;
  public pulseActive: boolean = false;
  public pulseRadius: number = 0;

  // Command target position (e.g. holding a pressure plate)
  public stayTarget: Vector2D | null = null;

  constructor(x = 260, y = 730) {
    this.pos = { x, y };
  }

  public update(dt: number, player: Player, nearSecretOrDanger: boolean, gravity: number) {
    this.animTime += dt;
    this.earTwitchTime += dt;
    this.tailAngle = Math.sin(this.animTime * 5) * 0.4;

    // Pulse effect expansion
    if (this.pulseActive) {
      this.pulseRadius += dt * 320;
      if (this.pulseRadius > 180) {
        this.pulseActive = false;
        this.pulseRadius = 0;
      }
    }

    // Alert reaction
    if (nearSecretOrDanger && this.mood !== 'alert') {
      this.mood = 'alert';
      this.alertTimer = 2.5;
      soundEngine.playCompanionChirp(true);
    }

    if (this.alertTimer > 0) {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.mood = 'calm';
      }
    }

    // Targeted switch stay
    if (this.stayTarget) {
      this.mood = 'holding_switch';
      const dx = this.stayTarget.x - this.pos.x;
      if (Math.abs(dx) > 10) {
        this.vel.x = Math.sign(dx) * 160;
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.vel.x = 0;
        this.pos.x = this.stayTarget.x;
      }
    } else {
      // Follow Player Behavior
      const targetX = player.pos.x + (player.facing === 'right' ? -45 : 45);
      const targetY = player.pos.y + 12;
      const dist = Math.hypot(targetX - this.pos.x, targetY - this.pos.y);

      if (dist > 300) {
        // Sprint catch up
        const dx = targetX - this.pos.x;
        this.vel.x = Math.sign(dx) * 280;
        this.facing = dx > 0 ? 'right' : 'left';
      } else if (dist > 50) {
        // Trot behind
        const dx = targetX - this.pos.x;
        this.vel.x = Math.sign(dx) * 180;
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        // Near player
        this.vel.x *= 0.6;
        if (Math.abs(this.vel.x) < 5) {
          this.vel.x = 0;
          if (player.state === 'idle') {
            this.facing = player.facing;
          }
        }
      }
    }

    // Vertical gravity and ground matching
    this.vel.y += gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  // Trigger Kip's Radiant Pulse ability
  public triggerPulse() {
    this.pulseActive = true;
    this.pulseRadius = 10;
    soundEngine.playDiscoveryChime();
    soundEngine.playCompanionChirp(true);
  }

  public toggleStayAt(target: Vector2D | null) {
    this.stayTarget = target;
    if (target) {
      soundEngine.playCompanionChirp(false);
    } else {
      this.mood = 'calm';
      soundEngine.playCompanionChirp(true);
    }
  }

  public pet(): number {
    this.mood = 'excited';
    soundEngine.playCompanionChirp(true);
    return 15; // Bond XP granted
  }
}
