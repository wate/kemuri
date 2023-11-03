#!/usr/bin/env node
'use strict';

var js = require('./common/js.cjs');
var css = require('./common/css.cjs');
var html = require('./common/html.cjs');
var config = require('./common/config.cjs');
var yargs = require('yargs');
var dotenv = require('dotenv');
var chalk = require('chalk');
require('./common/console.cjs');
require('node:fs');
require('node:path');
require('./common/base.cjs');
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
require('cosmiconfig');
require('lodash');
require('node:console');

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
    html: { type: 'boolean', description: 'htmlビルダーを利用する' },
    css: { type: 'boolean', description: 'cssビルダーを利用する' },
    js: { type: 'boolean', description: 'jsビルダーを利用する' },
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
const builders = [];
if (config.configLoader.isEnable('js') || argv.js) {
    const jsOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        jsOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        jsOrverrideOption.minify = true;
    }
    const jsBuilderOption = config.configLoader.getJsOption(jsOrverrideOption);
    console.group(chalk.blue('javaScript Builder Option'));
    console.log(jsBuilderOption);
    console.groupEnd();
    js.jsBuilder.setOption(jsBuilderOption);
    builders.push(js.jsBuilder);
}
if (config.configLoader.isEnable('css') || argv.css) {
    const cssOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        cssOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        cssOrverrideOption.style = 'compressed';
    }
    const cssBuilderOption = config.configLoader.getCssOption(cssOrverrideOption);
    console.group(chalk.blue('CSS Builder Option'));
    console.log(cssBuilderOption);
    console.groupEnd();
    css.cssBuilder.setOption(cssBuilderOption);
    builders.push(css.cssBuilder);
}
if (config.configLoader.isEnable('html') || argv.html) {
    const htmlBuilderOption = config.configLoader.getHtmlOption();
    console.group(chalk.blue('HTML Builder Option'));
    console.log(htmlBuilderOption);
    console.groupEnd();
    html.htmlBuilder.setOption(htmlBuilderOption);
    builders.push(html.htmlBuilder);
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
