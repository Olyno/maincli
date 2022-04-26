import { capitalize } from 'lodash';
import { createSpinner, Spinner } from 'nanospinner';
import path from 'path';
import { Plugin, PluginRun } from '../models/plugin.model';

export class NewYarn extends Plugin {
  private spinner: Spinner = createSpinner(`Setup ${this.name}`);

  constructor() {
    super({
      name: 'new yarn',
      description: 'Update to yarn 2',
      version: '0.0.1',
    });
  }

  public prerun(args: PluginRun) {
    this.projectPath = args.directory;
    this.spinner.start();
    return this.executeSync([
      'yarn set version berry',
      'yarn plugin import interactive-tools',
      'yarn plugin import typescript',
      () => this.generateConfig(this.projectPath),
    ]);
  }

  public run(args: PluginRun) {}

  public postrun(args: PluginRun) {
    this.spinner.success({ text: `${capitalize(this.name)} installed` });
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
