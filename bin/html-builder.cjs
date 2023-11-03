#!/usr/bin/env node
'use strict';

var html = require('./common/html.cjs');
var config = require('./common/config.cjs');
var yargs = require('yargs');
var dotenv = require('dotenv');
require('./common/console.cjs');
require('node:fs');
require('node:path');
require('./common/base.cjs');
require('glob');
require('chokidar');
require('rimraf');
require('editorconfig');
require('js-yaml');
require('js-beautify');
require('nunjucks');
require('cosmiconfig');
require('lodash');
require('chalk');
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
})
    .parseSync();
const builderOption = config.configLoader.getHtmlOption();
html.htmlBuilder.setOption(builderOption);
if (argv.watch) {
    html.htmlBuilder.watch();
}
else {
    html.htmlBuilder.build();
}
