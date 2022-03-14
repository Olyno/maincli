import { fdir } from 'fdir';
import fs from 'fs/promises';
import ora from 'ora';
import { Plugin, PluginRun } from '../models/plugin.model';

export class FromJsToTsPlugin extends Plugin {
  constructor() {
    super({
      name: 'from-js-to-ts',
      description: 'Convert js to ts',
      version: '0.0.1',
    });
  }

  async run(args: PluginRun): Promise<void> {
    this.projectPath = args.directory;
    return new fdir()
      .withFullPaths()
      .glob('**/*.js')
      .filter(filePath => !filePath.includes('node_modules'))
      .crawl(this.projectPath)
      .withPromise()
      .then(files => {
        const paths = files as string[];
        paths.forEach(file => {
          this.updateImports(file).then(() => this.rename(file));
        });
      });
  }

  async updateImports(file: string) {
    const updateImports = ora(`Updating imports: ${file}`).start();
    return fs
      .readFile(file, 'utf8')
      .then(content => {
        return content
          .replace(
            /const (.+) = require\((("|').+("|'))\)/g,
            'import $1 from $2'
          )
          .replace(/module\.exports =/g, 'export default')
          .replace(/exports\.(\w+) =/g, 'export const $1 =');
      })
      .then(finalContent => fs.writeFile(file, finalContent))
      .then(() => updateImports.succeed(`Updated imports ${file}`));
  }

  async rename(file: string) {
    return fs.rename(file, file.replace(/\.\w+$/, '') + '.ts');
  }
}
