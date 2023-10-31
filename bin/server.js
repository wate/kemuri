#!/usr/bin/env node
'use strict';

var browserSync = require('browser-sync');
var config = require('./common/config.js');
var _ = require('lodash');
var chalk = require('chalk');
var dotenv = require('dotenv');
require('./common/console.js');
require('cosmiconfig');
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
const serverOption = config.configLoader.getServerOption();
let htmlOutputDir = 'public';
if (!config.configLoader.isDisable('html')) {
    const htmlOption = config.configLoader.getHtmlOption();
    if (_.has(htmlOption, 'outputDir') && _.get(htmlOption, 'outputDir')) {
        //@ts-ignore
        htmlOutputDir = _.get(htmlOption, 'outputDir');
    }
}
let browserSyncUIOption = false;
if (_.has(serverOption, 'ui') && _.get(serverOption, 'ui')) {
    browserSyncUIOption = true;
    if (_.has(serverOption, 'uiPort') && _.get(serverOption, 'uiPort')) {
        browserSyncUIOption = {
            port: _.get(serverOption, 'uiPort'),
        };
    }
}
/**
 * browserSyncのオプション
 */
const browserSyncOption = {
    server: {
        baseDir: _.has(serverOption, 'baseDir') ? _.get(serverOption, 'baseDir') : htmlOutputDir,
    },
    port: _.has(serverOption, 'port') ? _.get(serverOption, 'port') : 3000,
    watch: _.has(serverOption, 'watch') ? _.get(serverOption, 'watch') : true,
    //@ts-ignore
    files: _.has(serverOption, 'watchFiles') ? _.get(serverOption, 'watchFiles') : false,
    open: _.has(serverOption, 'open') ? _.get(serverOption, 'open') : true,
    ui: browserSyncUIOption,
    notify: _.has(serverOption, 'notify') ? _.get(serverOption, 'notify') : false,
};
console.group(chalk.blue('Server Option'));
console.log(serverOption);
console.groupEnd();
browserSync(browserSyncOption);
