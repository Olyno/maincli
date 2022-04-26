#! /usr/bin/env node

import { capitalize } from 'lodash';
import path from 'path';
import prompts from 'prompts';
import { Plugin } from './models/plugin.model';
import plugins from './plugins';

const default_path = process.argv.at(-1);

prompts(
  [
    {
      type: 'text',
      name: 'projectPath',
      message: 'Select your working dir',
      initial: default_path || process.cwd(),
    },
    {
      type: 'autocompleteMultiselect',
      name: 'selectedPlugins',
      message: 'Select plugins to apply',
      instructions: false,
      choices: plugins.map(plugin => ({
        title: capitalize(plugin.name).replace(/-/g, ' '),
        description: plugin.description,
        value: plugin,
      })),
    },
  ],
  {
    onCancel: () => {
      throw new Error('No plugin selected');
    },
  }
)
  .then(async responses => {
    const { projectPath, selectedPlugins } = responses;
    const pluginsList = selectedPlugins as Plugin[];
    for (const plugin of pluginsList) {
      await plugin.prerun({
        directory: path.resolve(projectPath),
      });
    }
    for (const plugin of pluginsList) {
      await plugin.run({
        directory: path.resolve(projectPath),
      });
    }
    for (const plugin of pluginsList) {
      await plugin.postrun({
        directory: path.resolve(projectPath),
      });
    }
  })
  .catch(error => {
    console.log(error.message);
  });
