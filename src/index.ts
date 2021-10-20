#! /usr/bin/env node

import path from 'path';
import prompts from 'prompts';
import { Plugin } from './models/plugin.model';
import plugins from './plugins';
import { capitalize } from './utils';

prompts(
  [
    {
      type: 'text',
      name: 'projectPath',
      message: 'Select your working dir',
      initial: process.cwd(),
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
  .then(responses => {
    const { projectPath, selectedPlugins } = responses;
    const pluginsList = selectedPlugins as Plugin[];
    if (pluginsList && pluginsList.length > 0) {
      pluginsList.forEach(plugin => {
        plugin.run({
          directory: path.resolve(projectPath),
        });
      });
    } else {
      console.log('No plugin selected');
    }
  })
  .catch(error => {
    console.log(error.message);
  });
