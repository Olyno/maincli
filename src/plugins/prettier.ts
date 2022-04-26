import fs from 'fs/promises';
import { capitalize } from 'lodash';
import { createSpinner, Spinner } from 'nanospinner';
import path from 'path';
import { Plugin, PluginRun } from '../models/plugin.model';

export class Prettier extends Plugin {
  private spinner: Spinner = createSpinner(`Setup ${this.name}`);

  constructor() {
    super({
      name: 'prettier',
      description: 'Install and setup prettier',
      version: '0.0.1',
    });
  }

  public prerun(args: PluginRun) {
    this.projectPath = args.directory;
    this.spinner.start();
    return this.executeSync([
      () => this.generatePrettierrc(this.projectPath),
      () => this.generateVscode(this.projectPath),
    ]);
  }

  public run(args: PluginRun) {
    return this.executeSync([
      'yarn add prettier -D',
      () => this.generatePackageJson(this.projectPath),
    ]);
  }

  public postrun(args: PluginRun) {
    this.spinner.success({ text: `${capitalize(this.name)} installed` });
  }

  async generatePrettierrc(directory: string) {
    const prettierrc = path.join(directory, '.prettierrc');
    return this.writeFile(prettierrc, {
      arrowParens: 'avoid',
      bracketSpacing: true,
      quoteProps: 'as-needed',
      tabWidth: 2,
      semi: true,
      singleQuote: true,
    });
  }

  async generateVscode(directory: string) {
    const settingsPath = path.join(directory, '.vscode', 'settings.json');
    return this.writeFile(settingsPath, {
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll': true,
        'source.organizeImports': true,
      },
    });
  }

  async generatePackageJson(directory: string) {
    const packageJsonFile = path.join(directory, 'package.json');
    return fs
      .readFile(packageJsonFile)
      .then(res => res.toString())
      .then(JSON.parse)
      .then(packageJson => {
        packageJson.scripts.format = 'prettier --write "**/*.{js,jsx,ts,tsx}"';
        return this.writeFile(packageJsonFile, packageJson);
      });
  }
}
