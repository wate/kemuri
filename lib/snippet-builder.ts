#!/usr/bin/env node
import snippetBuilder from './builder/snippet';
import configLoader from './config';
import chalk from 'chalk';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
  .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
    c: { type: 'string', alias: 'config', description: '設定ファイルを指定する' },
  })
  .parseSync();

if (argv.config !== undefined) {
  //@ts-ignore
  configLoader.configFile = argv.config;
}

const builderOption = configLoader.getSnippetOption();
console.group(chalk.blue('Builder Option'));
console.log(builderOption);
console.groupEnd();
snippetBuilder.setOption(builderOption);

snippetBuilder.buildAll();

if (argv.watch) {
  snippetBuilder.watch();
}
