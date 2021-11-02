import fs from 'fs/promises';
import path from 'path';
import { Plugin, PluginRun } from '../models/plugin.model';

export class Prettier extends Plugin {
  constructor() {
    super({
      name: 'prettier',
      description: 'Install and setup prettier',
      version: '0.0.1',
    });
  }

  async run(args: PluginRun): Promise<void> {
    const commands = ['yarn add prettier -D'];
    return this.executeAsync(commands).then(() => {
      Promise.all([
        this.generatePrettierrc(args.directory),
        this.generateVscode(args.directory),
        this.generatePackageJson(args.directory),
      ]);
    });
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
