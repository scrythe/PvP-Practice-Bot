import mineflayer, { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';
import getOptions from './getOptions';
import PvPBot from './bot';

async function main() {
  const options = await getOptions();
  const bot = mineflayer.createBot({ ...options, auth: 'offline' });
  new PvPBot(bot);
  // bot.once('spawn', () => {
  //   bot.setControlState('sprint', true);
  // });
}

main();
