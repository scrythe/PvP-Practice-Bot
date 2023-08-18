import { prompt } from 'enquirer';
import { writeOptions, readOptions } from './utils';
import { Options, SaveOptions } from './interfaces';

function askOptions(): Promise<Options> {
  return prompt<Options>([
    {
      type: 'input',
      name: 'host',
      message: 'Host IP Adress',
    },
    {
      type: 'numeral',
      name: 'port',
      message: 'Port (default 25565)',
      initial: 25565,
    },
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ]);
}

async function askSaveOptions(): Promise<Boolean> {
  const saveOptionsObj = await prompt<SaveOptions>({
    type: 'confirm',
    name: 'save',
    message: 'Save Options for later',
    initial: false,
  });
  return saveOptionsObj.save;
}

export default async function getOptions(): Promise<Options> {
  let options = await readOptions();
  if (!options) {
    options = await askOptions();
    if (await askSaveOptions()) writeOptions(options);
  }
  return options;
}
