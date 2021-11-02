import { exec } from 'child_process';
import fs from 'fs-extra';
import { merge } from 'lodash';
import ora, { Ora } from 'ora';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PluginConfig {
  name: string;
  description: string;
  version: string;
}

interface JsonType {
  [key: string]: any;
}

export interface PluginRun {
  directory: string;
}

export abstract class Plugin {
  public projectPath = process.cwd();

  public name: string;
  public description: string;
  public version: string;

  private executeSyncSpinner = ora();

  abstract run(args: PluginRun): Promise<void>;

  constructor(config: PluginConfig) {
    this.name = config.name;
    this.description = config.description;
    this.version = config.version;
  }

  async executeSync(commands: string[]): Promise<Ora> {
    if (commands.length === 0) {
      this.executeSyncSpinner.succeed(`Completed: ${this.name}`);
      return;
    }
    this.executeSyncSpinner.text = `Running: ${commands[0]}`;
    this.executeSyncSpinner.start();
    const { stderr } = await execAsync(commands.shift());
    if (stderr) this.executeSyncSpinner.fail(stderr);
    return this.executeSync(commands);
  }

  async executeAsync(commands: string[]) {
    return Promise.all(
      commands.map(async command => {
        const executeAsyncSpinner = ora(`Running: ${command}`).start();
        return execAsync(command)
          .then(({ stderr }) => {
            if (stderr) executeAsyncSpinner.fail(stderr);
          })
          .then(() => executeAsyncSpinner.succeed(`Completed: ${this.name}`));
      })
    );
  }

  async create(path: string) {
    const createPath = ora(`Creating: ${path}`).start();
    if (path.match(/\.\w+/)) {
      return fs
        .ensureFile(path)
        .then(() => createPath.succeed(`Created: ${path}`));
    }
    return fs
      .ensureDir(path)
      .then(() => createPath.succeed(`Created: ${path}`));
  }

  async writeFile(path: string, content: string | JsonType) {
    const writeFile = ora(`Writting: ${path}`).start();
    return fs
      .readFile(path, 'utf8')
      .then(async fileContent => {
        if (path.endsWith('.json') && typeof content === 'object') {
          const json: JsonType = merge(JSON.parse(fileContent), content);
          return fs.writeFile(path, JSON.stringify(json, null, 2), 'utf-8');
        }
      })
      .then(() => writeFile.succeed(`Created: ${path}`))
      .catch(err => {
        const data =
          typeof content === 'object'
            ? JSON.stringify(content, null, 2)
            : content;
        if (err.code === 'ENOENT') {
          return fs.writeFile(path, data, 'utf-8');
        }
        throw err;
      });
  }
}
