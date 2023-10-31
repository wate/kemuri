'use strict';

var js = require('./common/js.cjs');
var config = require('./common/config.cjs');
var yargs = require('yargs');
var dotenv = require('dotenv');
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
require('chalk');
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
const builderOption = config.configLoader.getJsOption(orverrideOption);
js.jsBuilder.setOption(builderOption);
if (argv.watch) {
    js.jsBuilder.watch();
}
else {
    js.jsBuilder.build();
}
