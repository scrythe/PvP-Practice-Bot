import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';

class PvPBot {
  private bot: Bot;
  private target: Entity;
  private critDeflect: boolean;
  private punishCrits: boolean;
  private currentHealth: number;

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
    // if (bot.entity.velocity.y < 0 && didSprintHit) bot.attack(target);
  }

  private start(username: string, message: string) {
    this.target = this.bot.players[username].entity;
    const input = message.split(' ');
    if (input[1]) this.critDeflect = true;
    if (input[2]) this.punishCrits = true;
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
    this.sprintHit();
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
}

export default PvPBot;
