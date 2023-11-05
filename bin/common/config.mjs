import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosmiconfigSync } from 'cosmiconfig';
import _ from 'lodash';
import chalk from 'chalk';
import { Console } from 'node:console';

class ConsoleOverride extends Console {
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
var console$1 = console;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class configLoader {
    /**
     * 設定ファイルを生成する
     * @param force
     */
    static init(force) {
        const srcConfigFilePath = path.resolve(__dirname, '../../.builderrc.default.yml');
        const destConfigFilePath = path.resolve(process.cwd(), '.builderrc.yml');
        if (!fs.existsSync(destConfigFilePath) || force) {
            fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
        }
        else {
            console$1.error('Configuration file(.builderrc.yml) already exists');
        }
    }
    /**
     * 設定ファイルをロードする
     * @returns
     */
    static load() {
        const explorerSync = cosmiconfigSync('builder');
        const result = explorerSync.search();
        return result && result.config ? result.config : {};
    }
    /**
     * 指定のビルダーが有効化されているか確認する
     * @param type
     * @returns
     */
    static isEnable(type) {
        const allConfig = configLoader.load();
        if (allConfig && _.has(allConfig, 'enable') && _.get(allConfig, 'enable')) {
            return _.get(allConfig, 'enable').includes(type);
        }
        return false;
    }
    /**
     * 指定のビルダーが無効化されているか確認する
     *
     * @param type
     * @returns
     */
    static isDisable(type) {
        return !this.isEnable(type);
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
            ['enable', 'server', 'html', 'css', 'js'].forEach((removeKey) => {
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
     * @param overrideOption
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
     * スニペットのオプションを取得する
     * @param overrideOption
     * @returns
     */
    static getSnippetOption(overrideOption) {
        const allConfig = configLoader.load();
        let snippetOption = _.has(allConfig, 'snippet') && !_.isNull(_.get(allConfig, 'snippet')) ? _.get(allConfig, 'snippet') : {};
        if (overrideOption) {
            snippetOption = _.merge(_.cloneDeep(snippetOption), _.cloneDeep(overrideOption));
        }
        return snippetOption;
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
}

export { console$1 as a, configLoader as c };
