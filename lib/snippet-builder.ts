#!/usr/bin/env node
import snippetBuilder from './builder/snippet';
import configLoader from './config';
import * as path from 'node:path';
import * as glob from 'glob';
import chalk from 'chalk';
import fs from 'fs-extra';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
  .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
    c: { type: 'string', alias: 'config', description: '設定ファイルを指定する' },
    clean: { type: 'boolean', default: false, description: 'ビルド前に出力ディレクトリのスニペットファイルを削除する' },
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

if (argv.clean) {
  console.group(chalk.yellow('Clean up snippet files'));
  const removeFilePattern = path.join(snippetBuilder.getOutputDir(), '*.' + snippetBuilder.getOutputExt());
  glob.sync(removeFilePattern).forEach((removeFile) => {
    console.log('Remove file: ' + removeFile);
    fs.removeSync(removeFile);
  });
  console.groupEnd();
}

snippetBuilder.buildAll();

if (argv.watch) {
  snippetBuilder.watch();
}
