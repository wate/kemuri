#!/usr/bin/env node

import htmlBuilder from './builder/html';
import configLoader from './config';
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

const builderOption = configLoader.getHtmlOption();
htmlBuilder.setOption(builderOption);

if (argv.watch) {
  htmlBuilder.watch();
} else {
  htmlBuilder.build();
}
