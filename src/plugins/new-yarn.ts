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
    this.projectPath = args.directory;
    const commands = [
      'yarn set version berry',
      'yarn plugin import interactive-tools',
      'yarn plugin import typescript',
      () => this.generateConfig(this.projectPath),
    ];
    Promise.all([
      this.executeSync(commands),
      this.generateGitignore(this.projectPath),
    ]);
  }

  async generateConfig(directory: string) {
    const yarnrc = path.join(directory, '.yarnrc.yml');
    return this.writeFile(yarnrc, 'nodeLinker: node-modules');
  }

  async generateGitignore(directory: string) {
    return this.writeFile(
      path.join(directory, '.gitignore'),
      `# yarn v2
      .yarn/cache
      .yarn/unplugged
      .yarn/build-state.yml
      .yarn/install-state.gz
      .pnp.*`.replace(/^\s+/g, '')
    );
  }
}
