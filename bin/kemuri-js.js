#!/usr/bin/env node
import { j as jsBuilder } from './lib/js.mjs';
import { c as configLoader } from './lib/config.mjs';
import chalk from 'chalk';
import yargs from 'yargs';
import 'node:fs';
import 'node:path';
import './lib/base.mjs';
import 'glob';
import 'chokidar';
import 'rimraf';
import 'editorconfig';
import 'rollup';
import '@rollup/plugin-node-resolve';
import '@rollup/plugin-commonjs';
import '@rollup/plugin-typescript';
import '@rollup/plugin-terser';
import 'js-beautify';
import 'node:url';
import 'cosmiconfig';
import 'nunjucks';
import 'lodash';
import 'node:console';
import 'dotenv';

const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
    m: {
        type: 'string',
        choices: ['develop', 'production'],
        default: 'develop',
        alias: 'mode',
        description: 'ビルド処理のモード指定',
    },
    p: { type: 'boolean', alias: ['prod', 'production'], description: '本番モード指定のショートハンド' },
    d: { type: 'boolean', alias: ['dev', 'develop'], description: '開発モード指定のショートハンド' },
    sourcemap: { type: 'boolean', description: 'sourcemapファイルを出力する' },
    minify: { type: 'boolean', description: 'minify化するか否か' },
    c: { type: 'string', alias: 'config', description: '設定ファイルを指定する' },
})
    .parseSync();
if (argv.config !== undefined) {
    //@ts-ignore
    configLoader.configFile = argv.config;
}
let mode = 'develop';
if (argv.mode !== undefined) {
    mode = String(argv.mode);
}
else if (argv.develop !== undefined) {
    mode = 'develop';
}
else if (argv.production !== undefined) {
    mode = 'production';
}
/**
 * ソースマップの出力オプション
 */
const orverrideOption = {};
if (argv.sourcemap !== undefined && argv.sourcemap) {
    orverrideOption.sourcemap = true;
}
/**
 * minifyの出力オプション
 */
if (argv.minify !== undefined || mode === 'production') {
    orverrideOption.minify = true;
}
const builderOption = configLoader.getJsOption(orverrideOption);
console.group(chalk.blue('Builder Option'));
console.log(builderOption);
console.groupEnd();
jsBuilder.setOption(builderOption);
jsBuilder.buildAll();
if (argv.watch) {
    jsBuilder.watch();
}
