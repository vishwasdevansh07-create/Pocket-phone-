import { Vector2D } from '../../types/game';
import { Player } from './Player';
import { soundEngine } from '../audio/AudioEngine';

export type EnemyType = 'thornkin' | 'mossback' | 'shadow_wisp' | 'arbiter_boss';

export class Enemy {
  public id: string;
  public type: EnemyType;
  public pos: Vector2D;
  public vel: Vector2D = { x: 0, y: 0 };
  public width: number;
  public height: number;
  public health: number;
  public maxHealth: number;
  public isDead: boolean = false;
  public facing: 'left' | 'right' = 'left';
  public animTime: number = 0;
  public attackCooldown: number = 0;
  public hitFlashTimer: number = 0;
  public patrolLeft: number;
  public patrolRight: number;
  public isStunned: boolean = false;
  public stunTimer: number = 0;

  // Boss specific properties
  public isBoss: boolean = false;
  public bossPhase: number = 1;
  public telegraphTimer: number = 0;
  public specialAttackName: string = '';

  constructor(
    id: string,
    type: EnemyType,
    x: number,
    y: number,
    patrolLeft: number,
    patrolRight: number
  ) {
    this.id = id;
    this.type = type;
    this.pos = { x, y };
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;

    if (type === 'thornkin') {
      this.width = 32;
      this.height = 36;
      this.maxHealth = 40;
      this.health = 40;
    } else if (type === 'mossback') {
      this.width = 64;
      this.height = 70;
      this.maxHealth = 120;
      this.health = 120;
    } else if (type === 'shadow_wisp') {
      this.width = 30;
      this.height = 30;
      this.maxHealth = 35;
      this.health = 35;
    } else {
      // arbiter_boss
      this.isBoss = true;
      this.width = 90;
      this.height = 110;
      this.maxHealth = 350;
      this.health = 350;
    }
  }

  public update(dt: number, player: Player, gravity: number, isNight: boolean) {
    if (this.isDead) return;
    this.animTime += dt;

    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) this.isStunned = false;
      return;
    }

    // Shadow wisps fade in and become aggressive mostly in dusk/night
    if (this.type === 'shadow_wisp' && !isNight) {
      // Passive floating
      this.vel.x = Math.sin(this.animTime * 2) * 30;
      this.pos.x += this.vel.x * dt;
      return;
    }

    const distToPlayer = Math.hypot(player.pos.x - this.pos.x, player.pos.y - this.pos.y);

    if (this.type === 'thornkin') {
      this.updateThornkin(dt, player, distToPlayer, gravity);
    } else if (this.type === 'mossback') {
      this.updateMossback(dt, player, distToPlayer, gravity);
    } else if (this.type === 'shadow_wisp') {
      this.updateShadowWisp(dt, player, distToPlayer);
    } else if (this.type === 'arbiter_boss') {
      this.updateArbiterBoss(dt, player, distToPlayer, gravity);
    }
  }

  private updateThornkin(dt: number, player: Player, dist: number, gravity: number) {
    if (dist < 220) {
      // Chase player
      const dir = player.pos.x > this.pos.x ? 1 : -1;
      this.facing = dir > 0 ? 'right' : 'left';
      this.vel.x = dir * 160;

      // Leap attack
      if (dist < 60 && this.attackCooldown <= 0) {
        this.attackCooldown = 1.8;
        this.vel.y = -220;
        player.takeDamage(15, dir);
      }
    } else {
      // Patrol
      if (this.pos.x <= this.patrolLeft) {
        this.facing = 'right';
        this.vel.x = 60;
      } else if (this.pos.x >= this.patrolRight) {
        this.facing = 'left';
        this.vel.x = -60;
      }
    }

    this.vel.y += gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  private updateMossback(dt: number, player: Player, dist: number, gravity: number) {
    if (dist < 260) {
      const dir = player.pos.x > this.pos.x ? 1 : -1;
      this.facing = dir > 0 ? 'right' : 'left';
      this.vel.x = dir * 75;

      // Heavy Ground Slam
      if (dist < 80 && this.attackCooldown <= 0) {
        this.attackCooldown = 3.0;
        this.vel.y = -180;
        soundEngine.playHitImpact();
        player.takeDamage(28, dir);
      }
    } else {
      if (this.pos.x <= this.patrolLeft) {
        this.facing = 'right';
        this.vel.x = 40;
      } else if (this.pos.x >= this.patrolRight) {
        this.facing = 'left';
        this.vel.x = -40;
      }
    }

    this.vel.y += gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  private updateShadowWisp(dt: number, player: Player, dist: number) {
    // Ethereal flying wisp
    if (dist < 320) {
      const angle = Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x);
      this.vel.x = Math.cos(angle) * 110;
      this.vel.y = Math.sin(angle) * 80;

      if (dist < 45 && this.attackCooldown <= 0) {
        this.attackCooldown = 2.4;
        player.takeDamage(18, Math.cos(angle));
      }
    } else {
      this.vel.x = Math.sin(this.animTime * 1.5) * 50;
      this.vel.y = Math.cos(this.animTime * 2) * 30;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  private updateArbiterBoss(dt: number, player: Player, dist: number, gravity: number) {
    const dir = player.pos.x > this.pos.x ? 1 : -1;
    this.facing = dir > 0 ? 'right' : 'left';

    // Phase threshold
    if (this.health < this.maxHealth * 0.45 && this.bossPhase === 1) {
      this.bossPhase = 2;
      soundEngine.playWorldTremor();
      this.specialAttackName = 'Tectonic Overload!';
    }

    if (this.attackCooldown <= 0) {
      this.attackCooldown = this.bossPhase === 2 ? 2.5 : 3.8;
      
      // Boss action: Ground Shatter or Charge Tremor
      const actionChoice = Math.random();
      if (actionChoice > 0.5) {
        // Charge Tremor
        this.specialAttackName = 'Crag Dash!';
        this.vel.x = dir * 360;
        this.vel.y = -120;
        soundEngine.playWorldTremor();
        if (dist < 120) {
          player.takeDamage(35, dir);
        }
      } else {
        // Earth Shockwave
        this.specialAttackName = 'Seismic Slam!';
        this.vel.y = -260;
        soundEngine.playHitImpact();
        if (dist < 180 && player.onGround) {
          player.takeDamage(25, dir);
        }
      }
    } else {
      // Slowly approach
      this.vel.x = dir * (this.bossPhase === 2 ? 80 : 50);
    }

    this.vel.y += gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  public takeDamage(damage: number, knockbackDir: number) {
    if (this.isDead) return;
    this.health -= damage;
    this.hitFlashTimer = 0.2;
    this.vel.x = knockbackDir * (this.isBoss ? 40 : 160);
    soundEngine.playHitImpact();

    if (this.health <= 0) {
      this.isDead = true;
      soundEngine.playDiscoveryChime();
    }
  }

  public stun(duration: number) {
    this.isStunned = true;
    this.stunTimer = duration;
  }
}
