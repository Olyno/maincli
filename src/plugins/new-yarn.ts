import fs from 'fs/promises';
import path from 'path';
import { Plugin, PluginRun } from '../models/plugin.model';

export class NewYarn extends Plugin {
  constructor() {
    super({
      name: 'new yarn',
      description: 'Update to yarn 2',
      version: '0.0.1',
    });
  }

  async run(args: PluginRun): Promise<void> {
    const yarnrc = path.join(args.directory, '.yarnrc.yml');
    const commands = [
      'yarn set version berry',
      'yarn plugin import interactive-tools',
      'yarn plugin import typescript',
    ];
    return this.executeSync(commands).then(() =>
      fs
        .readFile(yarnrc)
        .then(data => data.toString())
        .then(data => data + '\nnodeLinker: node-modules')
        .then(result => fs.writeFile(yarnrc, result))
    );
  }
}
