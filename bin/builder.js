#!/usr/bin/env node
import { j as jsBuilder } from './common/js.mjs';
import { c as cssBuilder } from './common/css.mjs';
import { h as htmlBuilder } from './common/html.mjs';
import { c as configLoader } from './common/config.mjs';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import './common/console.mjs';
import 'node:fs';
import 'node:path';
import './common/base.mjs';
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
import 'sass';
import 'node:url';
import 'js-yaml';
import 'nunjucks';
import 'cosmiconfig';
import 'lodash';
import 'node:console';

dotenv.config();
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
    html: { type: 'boolean', description: 'htmlビルダーを利用する' },
    css: { type: 'boolean', description: 'cssビルダーを利用する' },
    js: { type: 'boolean', description: 'jsビルダーを利用する' },
    init: { type: 'boolean', description: '設定ファイルを生成する' },
    force: { type: 'boolean', default: false, alias: 'f', description: '設定ファイルを強制的に上書きする' },
})
    .parseSync();
if (argv.init) {
    configLoader.init(argv.force);
    process.exit(0);
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
const builders = [];
if (configLoader.isEnable('js') || argv.js) {
    const jsOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        jsOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        jsOrverrideOption.minify = true;
    }
    const jsBuilderOption = configLoader.getJsOption(jsOrverrideOption);
    console.group(chalk.blue('javaScript Builder Option'));
    console.log(jsBuilderOption);
    console.groupEnd();
    jsBuilder.setOption(jsBuilderOption);
    builders.push(jsBuilder);
}
if (configLoader.isEnable('css') || argv.css) {
    const cssOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        cssOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        cssOrverrideOption.style = 'compressed';
    }
    const cssBuilderOption = configLoader.getCssOption(cssOrverrideOption);
    console.group(chalk.blue('CSS Builder Option'));
    console.log(cssBuilderOption);
    console.groupEnd();
    cssBuilder.setOption(cssBuilderOption);
    builders.push(cssBuilder);
}
if (configLoader.isEnable('html') || argv.html) {
    const htmlBuilderOption = configLoader.getHtmlOption();
    console.group(chalk.blue('HTML Builder Option'));
    console.log(htmlBuilderOption);
    console.groupEnd();
    htmlBuilder.setOption(htmlBuilderOption);
    builders.push(htmlBuilder);
}
if (argv.watch) {
    builders.forEach((builder) => {
        builder.watch();
    });
}
else {
    builders.forEach((builder) => {
        builder.build();
    });
}
