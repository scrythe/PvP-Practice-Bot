import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';

class PvPBot {
  private bot: Bot;
  private target: Entity;
  private hitWhenInRange: boolean;
  private critDeflect: boolean;
  private punishCrits: boolean;
  private walkForward: boolean;
  private strafing: boolean;
  private currentHealth: number;
  private inRange: boolean;
  private ticksTilAttack: number;
  private swordAttackCoolDown: number;
  private ticksAfterLastStrafe: number;
  private isRight: boolean = true;

  constructor(bot: Bot) {
    this.thisBinder();
    this.bot = bot;
    bot.on('chat', (username, message) => {
      if (username === bot.username) return;
      if (message.startsWith('start')) this.start(username, message);
      if (message == 'stop') this.stop();
      if (message == 'test') this.lookAtTargetHead();
    });
  }

  private update() {
    this.ticksTilAttack--;
    this.lookAtTargetHead();
    this.updateIfInRange();
    if (this.hitWhenInRange && this.inRange && this.hasAtttackCooldown()) {
      this.sprintHit();
      this.ticksTilAttack = this.swordAttackCoolDown;
    }

    if (
      this.punishCrits &&
      this.inRange &&
      this.checkIfFalling() &&
      this.hasAtttackCooldown()
    ) {
      this.bot.setControlState('sprint', false);
      this.bot.attack(this.target);
      this.bot.setControlState('sprint', true);
      this.ticksTilAttack = this.swordAttackCoolDown;
    }
    if (this.strafing) {
      this.ticksAfterLastStrafe++;
      if (this.shoudlStrafe()) {
        this.ticksAfterLastStrafe = 0;
        this.strafeOtherDirection();
      }
    }
  }

  private start(username: string, message: string) {
    this.swordAttackCoolDown = this.getSwordAttackCoolDown();
    this.ticksTilAttack = 0;
    this.ticksAfterLastStrafe = 0;
    this.target = this.bot.players[username].entity;
    [
      this.hitWhenInRange,
      this.critDeflect,
      this.punishCrits,
      this.walkForward,
      this.strafing,
    ] = this.convertMessageToBoolArgs(message);
    this.bot.setControlState('right', false);
    this.bot.setControlState('left', false);
    if (this.strafing) this.bot.setControlState('right', true);
    this.bot.setControlState('forward', false);
    if (this.walkForward) this.bot.setControlState('forward', true);
    this.bot.on('physicTick', this.update);
    this.bot.on('health', this.onDamage);
  }

  private stop() {
    this.bot.off('physicTick', this.update);
    this.bot.off('health', this.onDamage);
  }

  private onDamage() {
    if (this.bot.health >= this.currentHealth) {
      this.currentHealth = this.bot.health;
      return;
    }
    this.currentHealth = this.bot.health;
    if (this.critDeflect && this.inRange && this.hasAtttackCooldown()) {
      this.sprintHit();
      this.ticksTilAttack = this.swordAttackCoolDown;
    }
  }

  private sprintHit() {
    this.bot.attack(this.target);
    this.bot.setControlState('sprint', false);
    this.bot.setControlState('sprint', true);
  }

  private lookAtTargetHead() {
    const pos = this.target.position.offset(0, this.target.height, 0);
    this.bot.lookAt(pos, true);
  }

  private thisBinder() {
    this.update = this.update.bind(this);
    this.onDamage = this.onDamage.bind(this);
  }

  private updateIfInRange() {
    const dist = this.target.position.distanceTo(this.bot.entity.position);
    this.inRange = dist <= 3.3;
  }

  private convertMessageToBoolArgs(message: string) {
    const args = message.split(' ');
    args.shift();
    return args.map((arg) => arg == '1');
  }

  private checkIfFalling() {
    return this.bot.entity.velocity.y < -0.13;
  }
  private getSwordAttackCoolDown() {
    const cooldown = (1 / 1.6) * 20;
    // const minCooldown = cooldown * 0.85;
    return cooldown;
  }

  private hasAtttackCooldown() {
    return this.ticksTilAttack <= 0;
  }

  private shoudlStrafe() {
    const shouldFastStrafe = Math.random() >= 0.97; // avg 60% to get 1 fast strafe every second (20 ticks)
    const fastStrafeMultiplier = shouldFastStrafe ? 3 : 1;
    const strafeChanceNumber = this.ticksAfterLastStrafe * fastStrafeMultiplier;
    const randomNumberStrafe = Math.floor(Math.random() * 40) + 1;
    return strafeChanceNumber >= randomNumberStrafe;
  }

  private strafeOtherDirection() {
    if (this.isRight) {
      this.isRight = false;
      this.bot.setControlState('right', false);
      this.bot.setControlState('left', true);
    } else {
      this.isRight = true;
      this.bot.setControlState('right', true);
      this.bot.setControlState('left', false);
    }
  }
}

export default PvPBot;
