#!/usr/bin/env node
import { h as htmlBuilder } from './common/html.mjs';
import { c as configLoader } from './common/config.mjs';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import 'node:fs';
import 'node:path';
import 'node:url';
import './common/base.mjs';
import 'glob';
import 'chokidar';
import 'rimraf';
import 'editorconfig';
import 'js-yaml';
import 'js-beautify';
import 'nunjucks';
import 'cosmiconfig';
import 'lodash';
import 'chalk';
import 'node:console';

dotenv.config();
const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
})
    .parseSync();
const builderOption = configLoader.getHtmlOption();
htmlBuilder.setOption(builderOption);
if (argv.watch) {
    htmlBuilder.watch();
}
else {
    htmlBuilder.build();
}
