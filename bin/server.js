'use strict';

var browserSync = require('browser-sync');
var cosmiconfig = require('cosmiconfig');
var _ = require('lodash');
var chalk = require('chalk');
var node_console = require('node:console');

class configLoader {
    /**
     * 設定ファイルをロードする
     * @returns
     */
    static load() {
        if (configLoader.result === undefined) {
            const explorerSync = cosmiconfig.cosmiconfigSync('builder');
            configLoader.result = explorerSync.search();
        }
        return configLoader.result ? configLoader.result.config : {};
    }
    /**
     * 指定のビルダーが無効化されているか確認する
     *
     * @param type
     * @returns
     */
    static isDisable(type) {
        const allConfig = configLoader.load();
        if (allConfig && _.has(allConfig, 'disabled') && _.get(allConfig, 'disabled')) {
            return _.get(allConfig, 'disabled').includes(type);
        }
        return false;
    }
    /**
     * 設定の指定のキーの値を取得する
     * @param key
     * @returns
     */
    static get(key, defaultValue) {
        const allConfig = configLoader.load();
        return _.get(allConfig, key, defaultValue);
    }
    /**
     * 指定されたビルダーのオプションを取得する
     * @param type
     * @returns
     */
    static getOption(type, overrideOption) {
        const allConfig = configLoader.load();
        let builderConfig = {};
        if (allConfig) {
            builderConfig = allConfig;
            if (_.has(allConfig, type) && _.get(allConfig, type)) {
                builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(_.get(allConfig, type)));
            }
            ['disabled', 'server', 'html', 'css', 'js'].forEach((removeKey) => {
                _.unset(builderConfig, removeKey);
            });
        }
        if (overrideOption) {
            builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(overrideOption));
        }
        return builderConfig;
    }
    /**
     * サーバーのオプションを取得する
     * @returns
     */
    static getServerOption(overrideOption) {
        const allConfig = configLoader.load();
        let serverOption = _.has(allConfig, 'server') && !_.isNull(_.get(allConfig, 'server')) ? _.get(allConfig, 'server') : {};
        if (overrideOption) {
            serverOption = _.merge(_.cloneDeep(serverOption), _.cloneDeep(overrideOption));
        }
        return serverOption;
    }
    /**
     * HTMLビルダーのオプションを取得する
     * @returns
     */
    static getHtmlOption(overrideOption) {
        return configLoader.getOption('html', overrideOption);
    }
    /**
     * CSSビルダーのオプションを取得する
     * @returns
     */
    static getCssOption(overrideOption) {
        return configLoader.getOption('css', overrideOption);
    }
    /**
     * JSビルダーのオプションを取得する
     * @returns
     */
    static getJsOption(overrideOption) {
        return configLoader.getOption('js', overrideOption);
    }
    /**
     * コンパイラーを取得する
     * @param type
     */
    static getCompiler(type) {
        let compiler = _.get(configLoader.defaultCompiler, type);
        const builderOption = this.getOption(type);
        if (_.has(builderOption, 'compiler') && _.has(builderOption, 'compiler')) {
            compiler = _.get(builderOption, 'compiler');
        }
        return compiler;
    }
}
/**
 * デフォルトのコンパイラー
 */
configLoader.defaultCompiler = {
    js: 'typescript',
    css: 'sass',
    html: 'nunjucks',
};

class ConsoleOverride extends node_console.Console {
    constructor() {
        super(process.stdout, process.stderr);
    }
    debug(message, ...optionalParams) {
        return super.debug(chalk.gray(message), ...optionalParams);
    }
    info(message, ...optionalParams) {
        return super.info(chalk.blue(message), ...optionalParams);
    }
    warn(message, ...optionalParams) {
        return super.warn(chalk.yellow(message), ...optionalParams);
    }
    error(message, ...optionalParams) {
        return super.error(chalk.red(message), ...optionalParams);
    }
    group(message, ...optionalParams) {
        return super.group(chalk.cyan(message), ...optionalParams);
    }
}
console = new ConsoleOverride();

const serverOption = configLoader.getServerOption();
let htmlOutputDir = 'public';
if (!configLoader.isDisable('html')) {
    const htmlOption = configLoader.getHtmlOption();
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
