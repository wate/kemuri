'use strict';

var sass = require('./lib/sass.js');
var config = require('./lib/config.js');
var yargs = require('yargs');
var dotenv = require('dotenv');
require('node:fs');
require('node:path');
require('./lib/base.js');
require('glob');
require('chokidar');
require('rimraf');
require('editorconfig');
require('sass');
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
    c: { type: 'string', alias: 'config', description: '設定ファイルの指定' }
})
    .parseSync();
if (argv.mode !== undefined) {
    String(argv.mode);
}
else if (argv.develop !== undefined) ;
else if (argv.production !== undefined) ;
/**
 * コマンドライン引数で指定された設定ファイルを読み込む
 */
const orverrideOption = {};
const builderOption = config.configLoader.getJsOption(orverrideOption);
const builder = new sass.sassBuilder(builderOption);
if (argv.watch) {
    builder.watch();
}
else {
    builder.build();
}
