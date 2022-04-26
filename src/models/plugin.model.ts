import { exec } from 'child_process';
import fs from 'fs-extra';
import { merge } from 'lodash';
import { Spinner } from 'nanospinner';
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

type LazyPromise = () => Promise<any>;

export type PluginCommand = string | LazyPromise;

export interface PluginRun {
  directory: string;
}

export abstract class Plugin {
  public projectPath = process.cwd();

  public name: string;
  public description: string;
  public version: string;

  abstract run(args: PluginRun): any;
  abstract prerun(args: PluginRun): any;
  abstract postrun(args: PluginRun): any;

  protected executionSpinner: Spinner | null = null;

  constructor(config: PluginConfig) {
    this.name = config.name;
    this.description = config.description;
    this.version = config.version;
  }

  async executeShellCommand(command: string) {
    return execAsync(command, { cwd: this.projectPath });
  }

  async executeSync(commands: PluginCommand[]): Promise<any> {
    if (commands.length === 0) {
      return;
    }
    const command = commands.shift();
    if (typeof command === 'function') {
      await command();
    } else {
      const { stderr } = await this.executeShellCommand(command as string);
      if (stderr) throw new Error(stderr);
    }
    return this.executeSync(commands);
  }

  async executeAsync(commands: PluginCommand[]) {
    return Promise.all(
      commands.map(async command => {
        if (typeof command === 'function') {
          return command();
        }
        return this.executeShellCommand(command).then(({ stderr }) => {
          if (stderr) throw new Error(stderr);
        });
      })
    );
  }

  async create(path: string) {
    if (path.match(/\.\w+/)) {
      return fs.ensureFile(path);
    }
    return fs.ensureDir(path);
  }

  async writeFile(path: string, content: string | JsonType): Promise<void> {
    await this.create(path);
    return fs
      .readFile(path, 'utf8')
      .then(async fileContent => {
        if (path.endsWith('.json') && typeof content === 'object') {
          const json: JsonType = merge(
            JSON.parse(fileContent || '{}'),
            content
          );
          return fs.writeFile(path, JSON.stringify(json, null, 2), 'utf-8');
        } else {
          return fs.writeFile(path, fileContent + '\n' + content, 'utf-8');
        }
      })
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
