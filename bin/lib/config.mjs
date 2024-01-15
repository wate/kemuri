import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import shellQuote from 'shell-quote';
import duplexer from 'duplexer3';
import { fileURLToPath } from 'node:url';
import { cosmiconfigSync } from 'cosmiconfig';
import nunjucks from 'nunjucks';
import _ from 'lodash';
import chalk from 'chalk';
import { Console } from 'node:console';
import * as dotenv from 'dotenv';

class ConsoleOverride extends Console {
    constructor() {
        super(process.stdout, process.stderr);
    }
    debug(message, ...optionalParams) {
        super.debug(chalk.gray(message), ...optionalParams);
    }
    info(message, ...optionalParams) {
        super.info(chalk.cyan(message), ...optionalParams);
    }
    warn(message, ...optionalParams) {
        super.warn(chalk.yellow(message), ...optionalParams);
    }
    error(message, ...optionalParams) {
        super.error(chalk.red(message), ...optionalParams);
    }
    group(message, ...optionalParams) {
        super.group(chalk.blue(message), ...optionalParams);
    }
}
const console = new ConsoleOverride();

dotenv.config();
/**
 * 定義済みの環境変数のキーを取得する
 * @param envNamePrefix
 * @returns
 */
function getEnvKeys(envNamePrefix) {
    return Object.keys(process.env)
        .filter((key) => key.startsWith(envNamePrefix))
        .map((key) => key.replace(envNamePrefix, ''));
}
/**
 * 環境変数の値を配列に変換する
 * @param envValue
 * @returns
 */
function convertEnvValueToArray(envValue, toLowerCase = false) {
    return envValue
        .split(',')
        .map((item) => {
        if (toLowerCase) {
            return item.toLowerCase().trim();
        }
        else {
            return item.trim();
        }
    })
        .filter((item) => item.length > 0)
        .reduce((unique, current) => {
        return unique.includes(current) ? unique : [...unique, current];
    }, []);
}
/**
 * 環境変数の値をbooleanに変換する
 * @param envValue
 * @returns
 */
function convertEnvValueToBool(envValue) {
    return ['true', 'yes', 'on', '1'].includes(envValue.toLocaleLowerCase());
}
/**
 * 環境変数の値を数値に変換する
 * @param envValue
 * @returns
 */
function convertEnvValueToInt(envValue) {
    return envValue.length > 0 ? parseInt(envValue, 10) : null;
}
/**
 * 環境変数に設定された有効化するビルダーの一覧を取得する
 * @returns
 */
function parseEnableEnv() {
    //@ts-ignore
    return _.has(process.env, 'KEMURI_ENABLE') ? convertEnvValueToArray(process.env.KEMURI_ENABLE) : [];
}
/**
 * 環境変数に設定されたサーバーの設定を取得する
 * @returns
 */
function parseServerEnv() {
    const settings = {};
    const settingKeys = getEnvKeys('KEMURI_SERVER_');
    if (settingKeys.includes('BASE_DIR')) {
        //@ts-ignore
        settings.baseDir = convertEnvValueToArray(process.env.KEMURI_SERVER_BASE_DIR);
    }
    if (settingKeys.includes('PORT')) {
        //@ts-ignore
        settings.port = convertEnvValueToInt(process.env.KEMURI_SERVER_PORT);
    }
    if (settingKeys.includes('WATCH')) {
        //@ts-ignore
        settings.watch = convertEnvValueToBool(process.env.KEMURI_SERVER_WATCH);
    }
    if (settingKeys.includes('WATCH_FILES')) {
        //@ts-ignore
        settings.watchFiles = convertEnvValueToArray(process.env.KEMURI_SERVER_WATCH_FILES);
    }
    if (settingKeys.includes('PROXY')) {
        //@ts-ignore
        settings.proxy = _.get(process.env, 'KEMURI_SERVER_PROXY');
    }
    if (settingKeys.includes('OPEN')) {
        //@ts-ignore
        settings.open = convertEnvValueToBool(process.env.KEMURI_SERVER_OPEN);
    }
    if (settingKeys.includes('BROWSER')) {
        //@ts-ignore
        settings.browser = process.env.KEMURI_SERVER_BROWSER;
    }
    if (settingKeys.includes('NOTIFY')) {
        //@ts-ignore
        settings.notify = convertEnvValueToBool(process.env.KEMURI_SERVER_NOTIFY);
    }
    if (settingKeys.includes('UI')) {
        //@ts-ignore
        settings.ui = convertEnvValueToBool(process.env.KEMURI_SERVER_UI);
    }
    if (settingKeys.includes('UI_PORT')) {
        //@ts-ignore
        settings.uiPort = convertEnvValueToInt(process.env.KEMURI_SERVER_UI_PORT);
    }
    return settings;
}
/**
 * 環境変数に設定された共通の設定を取得する
 * @param settingKeys
 * @returns
 */
function parseEnvCommon(envKeyPrefix, settingKeys) {
    const settings = {};
    if (settingKeys.includes('SOURCE_DIR')) {
        settings.srcDir = _.get(process.env, envKeyPrefix + 'SOURCE_DIR');
    }
    if (settingKeys.includes('OUTPUT_DIR')) {
        settings.outputDir = _.get(process.env, envKeyPrefix + 'OUTPUT_DIR');
    }
    if (settingKeys.includes('TARGET_FILE_EXT')) {
        const envValue = _.get(process.env, envKeyPrefix + 'TARGET_FILE_EXT');
        //@ts-ignore
        settings.exts = convertEnvValueToArray(envValue, true);
    }
    if (settingKeys.includes('MODULE_FILE_EXT')) {
        const envValue = _.get(process.env, envKeyPrefix + 'MODULE_FILE_EXT');
        //@ts-ignore
        settings.moduleExts = convertEnvValueToArray(envValue, true);
    }
    if (_.filter(settingKeys, (key) => key.startsWith('IGNORE_')).length > 0) {
        settings.ignore = {};
    }
    if (settingKeys.includes('IGNORE_PREFIX')) {
        settings.ignore.prefix = _.get(process.env, envKeyPrefix + 'IGNORE_PREFIX');
    }
    if (settingKeys.includes('IGNORE_SUFFIX')) {
        settings.ignore.suffix = _.get(process.env, envKeyPrefix + 'IGNORE_SUFFIX');
    }
    if (settingKeys.includes('IGNORE_FILE_PREFIX')) {
        settings.ignore.filePrefix = _.get(process.env, envKeyPrefix + 'IGNORE_FILE_PREFIX');
    }
    if (settingKeys.includes('IGNORE_DIR_PREFIX')) {
        settings.ignore.dirPrefix = _.get(process.env, envKeyPrefix + 'IGNORE_DIR_PREFIX');
    }
    if (settingKeys.includes('IGNORE_FILE_SUFFIX')) {
        settings.ignore.fileSuffix = _.get(process.env, envKeyPrefix + 'IGNORE_FILE_SUFFIX');
    }
    if (settingKeys.includes('IGNORE_DIR_SUFFIX')) {
        settings.ignore.dirSuffix = _.get(process.env, envKeyPrefix + 'IGNORE_DIR_SUFFIX');
    }
    if (settingKeys.includes('IGNORE_DIR_NAMES')) {
        const envValue = _.get(process.env, envKeyPrefix + 'IGNORE_DIR_NAMES');
        //@ts-ignore
        settings.ignore.dirNames = convertEnvValueToArray(envValue);
    }
    return settings;
}
/**
 * 環境変数に設定されたHTMLビルダーの設定を取得する
 * @returns
 */
function parseHtmlEnv() {
    const settingKeys = getEnvKeys('KEMURI_HTML_');
    const settings = parseEnvCommon('KEMURI_HTML_', settingKeys);
    if (settingKeys.includes('VAR_FILE_NAME')) {
        //@ts-ignore
        settings.varFileName = process.env.KEMURI_HTML_VAR_FILE_NAME;
    }
    if (settingKeys.includes('SITE_URL')) {
        //@ts-ignore
        settings.siteUrl = process.env.KEMURI_HTML_SITE_URL;
    }
    if (settingKeys.includes('GENERATE_SITEMAP')) {
        //@ts-ignore
        settings.generateSiteMap = convertEnvValueToBool(process.env.KEMURI_HTML_GENERATE_SITEMAP);
    }
    if (settingKeys.includes('GENERATE_PAGE_LIST')) {
        //@ts-ignore
        settings.generatePageList = convertEnvValueToBool(process.env.KEMURI_HTML_GENERATE_PAGE_LIST);
    }
    return settings;
}
/**
 * 環境変数に設定されたCSSビルダーの設定を取得する
 * @returns
 */
function parseCssEnv() {
    const settingKeys = getEnvKeys('KEMURI_CSS_');
    const settings = parseEnvCommon('KEMURI_CSS_', settingKeys);
    if (settingKeys.includes('SASS_OUTPUT_STYLE')) {
        settings.style = process.env.KEMURI_CSS_SASS_OUTPUT_STYLE;
    }
    if (settingKeys.includes('SASS_GENERATE_INDEX')) {
        //@ts-ignore
        settings.generateIndex = convertEnvValueToBool(process.env.KEMURI_CSS_SASS_GENERATE_INDEX);
    }
    if (settingKeys.includes('SASS_INDEX_FILE_NAME')) {
        settings.indexFileName = process.env.KEMURI_CSS_SASS_INDEX_FILE_NAME;
    }
    if (settingKeys.includes('SASS_INDEX_IMPORT_TYPE')) {
        settings.indexImportType = process.env.KEMURI_CSS_SASS_INDEX_IMPORT_TYPE;
    }
    if (settingKeys.includes('SASS_SOURCE_MAP')) {
        //@ts-ignore
        settings.sourceMap = convertEnvValueToBool(process.env.KEMURI_CSS_SASS_SOURCE_MAP);
    }
    if (settingKeys.includes('SASS_LOAD_PATHS')) {
        const envValue = _.get(process.env, 'KEMURI_CSS_SASS_LOAD_PATHS');
        //@ts-ignore
        settings.loadPaths = convertEnvValueToArray(envValue);
    }
    return settings;
}
/**
 * 環境変数に設定されたJSビルダーの設定を取得する
 * @returns
 */
function parseJsEnv() {
    const settingKeys = getEnvKeys('KEMURI_JS_');
    const settings = parseEnvCommon('KEMURI_JS_', settingKeys);
    if (settingKeys.includes('OUTPUT_FORMAT')) {
        settings.format = process.env.KEMURI_JS_OUTPUT_FORMAT;
    }
    if (settingKeys.includes('GLOBALS')) {
        //@ts-ignore
        const envValues = convertEnvValueToArray(_.get(process.env, 'KEMURI_JS_GLOBALS'));
        envValues.forEach((envValue) => {
            const [key, value] = envValue.split(':');
            if (key && value) {
                settings.globals[key] = value;
            }
        });
    }
    if (settingKeys.includes('SOURCE_MAP')) {
        //@ts-ignore
        settings.generateIndex = convertEnvValueToBool(process.env.KEMURI_JS_SOURCE_MAP);
    }
    if (settingKeys.includes('MINIFY')) {
        //@ts-ignore
        settings.generateIndex = convertEnvValueToBool(process.env.KEMURI_JS_MINIFY);
    }
    return settings;
}
/**
 * 環境変数に設定されたスニペットビルダーの設定を取得する
 * @returns
 */
function parseSnippetEnv() {
    const settingKeys = getEnvKeys('KEMURI_SNIPPET_');
    const settings = parseEnvCommon('KEMURI_SNIPPET_', settingKeys);
    if (settingKeys.includes('SNIPPET_HAEDER_LEVEL')) {
        const envValue = _.get(process.env, 'KEMURI_SNIPPET_SNIPPET_HAEDER_LEVEL');
        //@ts-ignore
        settings.snippetHeaderLevel = convertEnvValueToInt(envValue);
    }
    if (settingKeys.includes('EXTRA_SETTING_HAEDER_LEVEL')) {
        const envValue = _.get(process.env, 'KEMURI_SNIPPET_EXTRA_SETTING_HAEDER_LEVEL');
        //@ts-ignore
        settings.extraSettingHeaderLevel = convertEnvValueToInt(envValue);
    }
    if (settingKeys.includes('EXTRA_SETTING_HAEDER_TEXT')) {
        const envValue = _.get(process.env, 'KEMURI_SNIPPET_EXTRA_SETTING_HAEDER_TEXT');
        //@ts-ignore
        settings.extraSettingHeaderTexts = convertEnvValueToArray(envValue);
    }
    return settings;
}
/**
 * 環境変数に設定されたスクリーンショットの設定を取得する
 * @returns
 */
function parseScreenshotEnv() {
    const settings = {};
    const settingKeys = getEnvKeys('KEMURI_SCREENSHOT_');
    if (settingKeys.includes('OUTPUT_DIR')) {
        settings.outputDir = _.get(process.env, 'KEMURI_SCREENSHOT_OUTPUT_DIR');
    }
    if (settingKeys.includes('SAVE_FLAT_PATH')) {
        const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_SAVE_FLAT_PATH');
        //@ts-ignore
        settings.saveFlatPath = convertEnvValueToBool(envValue);
    }
    if (_.filter(settingKeys, (key) => key.startsWith('DEFAULT_')).length > 0) {
        settings.default = {};
    }
    if (settingKeys.includes('DEFAULT_TYPE')) {
        settings.default.type = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_TYPE');
    }
    if (settingKeys.includes('DEFAULT_WIDTH')) {
        const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_WIDTH');
        //@ts-ignore
        settings.default.width = convertEnvValueToInt(envValue);
    }
    if (settingKeys.includes('DEFAULT_HEIGHT')) {
        const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_HEIGHT');
        //@ts-ignore
        settings.default.height = convertEnvValueToInt(envValue);
    }
    if (settingKeys.includes('HEADLESS')) {
        const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_HEADLESS');
        //@ts-ignore
        settings.headless = convertEnvValueToBool(envValue);
    }
    if (settingKeys.includes('FULL_PAGE')) {
        const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_FULL_PAGE');
        //@ts-ignore
        settings.fullPage = convertEnvValueToBool(envValue);
    }
    if (settingKeys.includes('RETRY_LIMIT')) {
        const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_RETRY_LIMIT');
        //@ts-ignore
        settings.retryLimit = convertEnvValueToInt(envValue);
    }
    if (settingKeys.includes('SITEMAP_LOCATION')) {
        settings.sitemapLocation = _.get(process.env, 'KEMURI_SCREENSHOT_SITEMAP_LOCATION');
    }
    if (_.filter(settingKeys, (key) => key.startsWith('TARGET_')).length > 0) {
        settings.targets = parseScreenshotTargetEnv(settingKeys);
    }
    return settings;
}
/**
 * スクリーンショットのターゲットの設定を取得する
 * @param settingKeys
 * @returns
 */
function parseScreenshotTargetEnv(settingKeys) {
    const targets = {};
    const targetKeys = settingKeys.filter((key) => {
        return key.startsWith('TARGET_') && key.endsWith('_TYPE');
    });
    targetKeys.forEach((targetKey) => {
        const keyPrefix = targetKey.replace(/_TYPE$/, '');
        const envNamePrefix = 'KEMURI_SCREENSHOT_' + keyPrefix;
        let targetName = targetKey
            .replace(/^TARGET_/, '')
            .replace(/_TYPE$/, '')
            .toLocaleLowerCase();
        if (settingKeys.includes(keyPrefix + '_NAME')) {
            //@ts-ignore
            targetName = _.get(process.env, envNamePrefix + '_NAME');
        }
        //@ts-ignore
        targets[targetName] = {
            type: _.get(process.env, envNamePrefix + '_TYPE'),
        };
        if (settingKeys.includes(keyPrefix + '_WIDTH')) {
            const envValue = _.get(process.env, envNamePrefix + '_WIDTH');
            //@ts-ignore
            targets[targetName].width = convertEnvValueToInt(envValue);
        }
        if (settingKeys.includes(keyPrefix + '_HEIGHT')) {
            const envValue = _.get(process.env, envNamePrefix + '_HEIGHT');
            //@ts-ignore
            targets[targetName].height = convertEnvValueToInt(envValue);
        }
    });
    return targets;
}
/**
 * 環境変数のパースと設定
 */
function parseEnv() {
    const enableConfig = {
        enable: parseEnableEnv(),
    };
    const serverConfig = {
        server: parseServerEnv(),
    };
    const htmlConfig = {
        html: parseHtmlEnv(),
    };
    const cssConfig = {
        css: parseCssEnv(),
    };
    const jsConfig = {
        js: parseJsEnv(),
    };
    const snippetConfig = {
        snippet: parseSnippetEnv(),
    };
    const screenshotConfig = {
        screenshot: parseScreenshotEnv(),
    };
    const envSettings = _.merge(_.cloneDeep(enableConfig), _.cloneDeep(serverConfig), _.cloneDeep(htmlConfig), _.cloneDeep(cssConfig), _.cloneDeep(jsConfig), _.cloneDeep(snippetConfig), _.cloneDeep(screenshotConfig));
    return envSettings;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
nunjucks.configure({ autoescape: false });
class configLoader {
    /**
     * 設定ファイルを生成する
     * @param force
     */
    static copyDefaultConfig(force) {
        const srcConfigFilePath = path.resolve(__dirname, '../../.kemurirc.default.yml');
        const destConfigFilePath = path.resolve(process.cwd(), '.kemurirc.yml');
        if (!fs.existsSync(destConfigFilePath) || force) {
            fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
        }
        else {
            console.error('Configuration file(.builderrc.yml) already exists');
        }
    }
    /**
     * TypeScriptの初期設定ファイルを生成する
     * @param force
     */
    static copyDefaultTSConfig(force) {
        const srcConfigFilePath = path.resolve(__dirname, '../../tsconfig.json');
        const destConfigFilePath = path.resolve(process.cwd(), 'tsconfig.json');
        if (!fs.existsSync(destConfigFilePath) || force) {
            fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
        }
        else {
            console.error('Configuration file(tsconfig.json) already exists');
        }
    }
    /**
     * 設定ファイルをロードする
     * @returns
     */
    static load() {
        let config = parseEnv();
        const explorerSync = cosmiconfigSync('kemuri');
        const result = configLoader.configFile
            ? explorerSync.load(configLoader.configFile)
            : explorerSync.search();
        if (result) {
            return _.merge(_.cloneDeep(config), _.cloneDeep(result.config));
        }
        return config;
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
            const removeKeys = ['enable', 'assetDir', 'server', 'html', 'css', 'js', 'copy', 'snippet', 'screenshot'];
            removeKeys.forEach((removeKey) => {
                _.unset(builderConfig, removeKey);
            });
        }
        if (overrideOption) {
            builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(overrideOption));
        }
        builderConfig = JSON.parse(nunjucks.renderString(JSON.stringify(builderConfig), allConfig));
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
        serverOption = JSON.parse(nunjucks.renderString(JSON.stringify(serverOption), allConfig));
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
     * コピーのオプションを取得する
     * @returns
     */
    static getCopyOption() {
        const allConfig = configLoader.load();
        let copySettings = _.has(allConfig, 'copy') && _.isArray(_.get(allConfig, 'copy')) ? _.get(allConfig, 'copy') : [];
        const copyOptions = copySettings
            .filter((copySetting) => {
            return copySetting.src && copySetting.src.length > 0 && copySetting.dest && copySetting.dest.length > 0;
        })
            .map((copySetting) => {
            const copyOption = {
                src: copySetting.src,
                dest: copySetting.dest,
                clean: copySetting.clean ?? false,
                dereference: copySetting.dereference ?? false,
                includeEmptyDirs: copySetting.includeEmptyDirs ?? false,
                preserve: copySetting.preserve ?? false,
                update: copySetting.update ?? false,
            };
            if (_.has(copySetting, 'commands') && _.isArray(_.get(copySetting, 'commands'))) {
                const transforms = _.get(copySetting, 'commands').map((filter) => {
                    if (typeof filter === 'string') {
                        return configLoader.convertCpxCommandParam(filter);
                    }
                    else {
                        if (_.has(filter, 'command')) {
                            return configLoader.convertCpxCommandParam(_.get(filter, 'command'));
                        }
                    }
                });
                if (transforms.length > 0) {
                    copyOption.transform = transforms;
                }
            }
            return copyOption;
        });
        return copyOptions;
    }
    /**
     * cpxのcommandパラメーターを変換する
     * @param commands
     * @returns
     * ※以下のコードを元に実装
     * @see https://github.com/bcomnes/cpx2/blob/master/bin/main.js#L50-L68
     */
    static convertCpxCommandParam(command) {
        return (file) => {
            const env = Object.create(process.env, {
                FILE: { value: file },
            });
            const parts = shellQuote.parse(command, env);
            //@ts-ignore
            const child = child_process.spawn(parts[0], parts.slice(1), { env });
            //@ts-ignore
            const outer = duplexer(child.stdin, child.stdout);
            //@ts-ignore
            child.on('exit', (code) => {
                if (code !== 0) {
                    const error = new Error(`non-zero exit code in command: ${command}`);
                    outer.emit('error', error);
                }
            });
            //@ts-ignore
            child.stderr.pipe(process.stderr);
            return outer;
        };
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
        snippetOption = JSON.parse(nunjucks.renderString(JSON.stringify(snippetOption), allConfig));
        return snippetOption;
    }
    /**
     * スクリーンショットのオプションを取得する
     * @param overrideOption
     * @returns
     */
    static getScreenshotOption(overrideOption) {
        const allConfig = configLoader.load();
        let screenshotOption = _.has(allConfig, 'screenshot') && !_.isNull(_.get(allConfig, 'screenshot')) ? _.get(allConfig, 'screenshot') : {};
        if (overrideOption) {
            screenshotOption = _.merge(_.cloneDeep(screenshotOption), _.cloneDeep(screenshotOption));
        }
        screenshotOption = JSON.parse(nunjucks.renderString(JSON.stringify(screenshotOption), allConfig));
        return screenshotOption;
    }
}

export { configLoader as a, console as c };
