#!/usr/bin/env node
import { h as htmlBuilder } from './lib/html.mjs';
import { c as configLoader } from './lib/config.mjs';
import chalk from 'chalk';
import yargs from 'yargs';
import 'node:fs';
import 'node:path';
import 'node:url';
import './lib/base.mjs';
import 'glob';
import 'chokidar';
import 'rimraf';
import 'editorconfig';
import 'js-yaml';
import 'nunjucks';
import 'gray-matter';
import 'lodash';
import 'js-beautify';
import 'cosmiconfig';
import 'node:console';
import 'dotenv';

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
console.group(chalk.blue('Builder Option'));
console.log(builderOption);
console.groupEnd();
htmlBuilder.setOption(builderOption);
htmlBuilder.buildAll();
if (argv.watch) {
    htmlBuilder.watch();
}
