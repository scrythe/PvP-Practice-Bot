import mineflayer, { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';
import getOptions from './getOptions';

async function main() {
  const options = await getOptions();
  const bot = mineflayer.createBot({ ...options, auth: 'offline' });
  bot.once('spawn', () => {
    bot.setControlState('sprint', true);
  });
  bot.once('chat', (username, message) => {
    if (username === bot.username) return;
    const target = bot.players[username].entity;
    if (message.startsWith('start')) start(bot, target);
    if (message == 'stop')
      bot.off('physicTick', () => update(bot, target, false));
  });
}

function start(bot: Bot, target: Entity) {
  let didSprintHit = false;
  bot.setControlState('forward', true);
  bot.on('physicTick', () => update(bot, target, didSprintHit));
  bot.off('physicTick', () => update(bot, target, didSprintHit));

  bot.on('health', () => {
    console.log('aah');
    didSprintHit = true;
    sprintHit(bot, target);
  });
}

function sprintHit(bot: Bot, target: Entity) {
  bot.attack(target);
  bot.setControlState('sprint', false);
  bot.setControlState('sprint', true);
}

function update(bot: Bot, target: Entity, didSprintHit: boolean) {
  const pos = target.position.offset(0, target.height, 0);
  bot.lookAt(pos, true);
  // if (bot.entity.velocity.y < 0 && didSprintHit) bot.attack(target);
}

main();
