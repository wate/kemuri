'use strict';

var typescript = require('./lib/typescript.js');
var sass = require('./lib/sass.js');
var nunjucks = require('./lib/nunjucks.js');
var config = require('./lib/config.js');
var yargs = require('yargs');
var dotenv = require('dotenv');
var chalk = require('chalk');
require('node:fs');
require('node:path');
require('./lib/base.js');
require('glob');
require('chokidar');
require('rimraf');
require('editorconfig');
require('rollup');
require('@rollup/plugin-node-resolve');
require('@rollup/plugin-commonjs');
require('@rollup/plugin-typescript');
require('@rollup/plugin-terser');
require('js-beautify');
require('sass');
require('js-yaml');
require('nunjucks');
require('node:console');
require('cosmiconfig');
require('lodash');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var dotenv__namespace = /*#__PURE__*/_interopNamespaceDefault(dotenv);

dotenv__namespace.config();
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
    c: { type: 'string', alias: 'config', description: '設定ファイルの指定' },
    sourcemap: { type: 'boolean', description: 'sourcemapファイルを出力する' },
    minify: { type: 'boolean', description: 'minify化するか否か' },
})
    .parseSync();
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
const jsOrverrideOption = {};
const cssOrverrideOption = {};
if (argv.sourcemap !== undefined) {
    jsOrverrideOption.sourcemap = true;
    cssOrverrideOption.sourcemap = true;
}
/**
 * minifyの出力オプション
 */
if (argv.minify !== undefined || mode === 'production') {
    jsOrverrideOption.minify = true;
    cssOrverrideOption.style = 'compressed';
}
const builders = new Map();
if (!config.configLoader.isDisable('js')) {
    const builderOption = config.configLoader.getJsOption(jsOrverrideOption);
    console.group(chalk.blue('javaScript Builder Option'));
    console.log(builderOption);
    console.groupEnd();
    builders.set('js', new typescript.typescriptBuilder(builderOption));
}
if (!config.configLoader.isDisable('css')) {
    const builderOption = config.configLoader.getCssOption(cssOrverrideOption);
    console.group(chalk.blue('CSS Builder Option'));
    console.log(builderOption);
    console.groupEnd();
    builders.set('css', new sass.sassBuilder(builderOption));
}
if (!config.configLoader.isDisable('html')) {
    const builderOption = config.configLoader.getHtmlOption();
    console.group(chalk.blue('HTML Builder Option'));
    console.log(builderOption);
    console.groupEnd();
    builders.set('html', new nunjucks.nunjucksBuilder(builderOption));
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
