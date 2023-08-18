import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';

class PvPBot {
  private bot: Bot;
  private target: Entity;
  private hitWhenInRange: boolean;
  private critDeflect: boolean;
  private punishCrits: boolean;
  private currentHealth: number;
  private inRange: boolean;

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
    this.lookAtTargetHead();
    this.updateIfInRange();
    if (this.hitWhenInRange && this.inRange) this.sprintHit();
    if (this.punishCrits && this.checkIfFalling()) {
      this.bot.setControlState('sprint', false);
      this.bot.attack(this.target);
      this.bot.setControlState('sprint', true);
    }
  }

  private start(username: string, message: string) {
    this.target = this.bot.players[username].entity;
    [this.hitWhenInRange, this.critDeflect, this.punishCrits] =
      this.convertMessageToBoolArgs(message);
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
    if (this.critDeflect) this.sprintHit();
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
}

export default PvPBot;
