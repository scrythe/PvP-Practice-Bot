import { writeFile, readFile, unlink } from 'fs/promises';
import { Options } from 'interfaces';

export function writeOptions(options: Options): void {
  writeFile('options.txt', JSON.stringify(options));
}

export async function readOptions(): Promise<Options | void> {
  const optionsJSON = await readFile('options.txt', {
    encoding: 'utf8',
  }).catch(() => {});
  if (!optionsJSON) return;
  return JSON.parse(optionsJSON);
}
