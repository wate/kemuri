import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosmiconfigSync } from 'cosmiconfig';
import _ from 'lodash';
import 'chalk';
import 'node:console';
import * as dotenv from 'dotenv';

var console$1 = console;

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
            console$1.error('Configuration file(.builderrc.yml) already exists');
        }
    }
    /**
     * 環境変数のパースと設定
     */
    static parseEnv() {
        const enableConfig = {
            enable: configLoader.parseEnableEnv(),
        };
        const serverConfig = {
            server: configLoader.parseServerEnv(),
        };
        const htmlConfig = {
            html: configLoader.parseHtmlEnv(),
        };
        const cssConfig = {
            css: configLoader.parseCssEnv(),
        };
        const jsConfig = {
            js: configLoader.parseJsEnv(),
        };
        const snippetConfig = {
            snippet: configLoader.parseSnippetEnv(),
        };
        const screenshotConfig = {
            screenshot: configLoader.parseScreenshotEnv(),
        };
        const envSettings = _.merge(_.cloneDeep(enableConfig), _.cloneDeep(serverConfig), _.cloneDeep(htmlConfig), _.cloneDeep(cssConfig), _.cloneDeep(jsConfig), _.cloneDeep(snippetConfig), _.cloneDeep(screenshotConfig));
        return envSettings;
    }
    /**
     * 定義済みの環境変数のキーを取得する
     * @param envNamePrefix
     * @returns
     */
    static getEnvkeys(envNamePrefix) {
        return Object.keys(process.env)
            .filter((key) => key.startsWith(envNamePrefix))
            .map((key) => key.replace(envNamePrefix, ''));
    }
    /**
     * 環境変数の値を配列に変換する
     * @param envValue
     * @returns
     */
    static convertEnvValueToArray(envValue, toLowerCase = false) {
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
    static convertEnvValueToBool(envValue) {
        return ['true', 'yes', 'on', '1'].includes(envValue.toLocaleLowerCase());
    }
    /**
     * 環境変数の値を数値に変換する
     * @param envValue
     * @returns
     */
    static convertEnvValueToInt(envValue) {
        return envValue.length > 0 ? parseInt(envValue, 10) : null;
    }
    /**
     * 環境変数に設定された有効化するビルダーの一覧を取得する
     * @returns
     */
    static parseEnableEnv() {
        //@ts-ignore
        return _.has(process.env, 'KEMURI_ENABLE') ? configLoader.convertEnvValueToArray(process.env.KEMURI_ENABLE) : [];
    }
    /**
     * 環境変数に設定されたサーバーの設定を取得する
     * @returns
     */
    static parseServerEnv() {
        const settings = {};
        const settingKeys = configLoader.getEnvkeys('KEMURI_SERVER_');
        if (settingKeys.includes('BASE_DIR')) {
            //@ts-ignore
            settings.baseDir = configLoader.convertEnvValueToArray(process.env.KEMURI_SERVER_BASE_DIR);
        }
        if (settingKeys.includes('PORT')) {
            //@ts-ignore
            settings.port = configLoader.convertEnvValueToInt(process.env.KEMURI_SERVER_PORT);
        }
        if (settingKeys.includes('WATCH')) {
            //@ts-ignore
            settings.watch = configLoader.convertEnvValueToBool(process.env.KEMURI_SERVER_WATCH);
        }
        if (settingKeys.includes('WATCH_FILES')) {
            //@ts-ignore
            settings.watchFiles = configLoader.convertEnvValueToArray(process.env.KEMURI_SERVER_WATCH_FILES);
        }
        if (settingKeys.includes('PROXY')) {
            //@ts-ignore
            settings.proxy = _.get(process.env, 'KEMURI_SERVER_PROXY');
        }
        if (settingKeys.includes('OPEN')) {
            //@ts-ignore
            settings.open = configLoader.convertEnvValueToBool(process.env.KEMURI_SERVER_OPEN);
        }
        if (settingKeys.includes('BROWSER')) {
            //@ts-ignore
            settings.browser = process.env.KEMURI_SERVER_BROWSER;
        }
        if (settingKeys.includes('NOTIFY')) {
            //@ts-ignore
            settings.notify = configLoader.convertEnvValueToBool(process.env.KEMURI_SERVER_NOTIFY);
        }
        if (settingKeys.includes('UI')) {
            //@ts-ignore
            settings.ui = configLoader.convertEnvValueToBool(process.env.KEMURI_SERVER_UI);
        }
        if (settingKeys.includes('UI_PORT')) {
            //@ts-ignore
            settings.uiPort = configLoader.convertEnvValueToInt(process.env.KEMURI_SERVER_UI_PORT);
        }
        return settings;
    }
    /**
     * 環境変数に設定された共通の設定を取得する
     * @param settingKeys
     * @returns
     */
    static parseEnvComon(envKeyPrefix, settingKeys) {
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
            settings.exts = configLoader.convertEnvValueToArray(envValue, true);
        }
        if (settingKeys.includes('MODULE_FILE_EXT')) {
            const envValue = _.get(process.env, envKeyPrefix + 'MODULE_FILE_EXT');
            //@ts-ignore
            settings.moduleExts = configLoader.convertEnvValueToArray(envValue, true);
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
            settings.ignore.dirNames = configLoader.convertEnvValueToArray(envValue);
        }
        return settings;
    }
    /**
     * 環境変数に設定されたHTMLビルダーの設定を取得する
     * @returns
     */
    static parseHtmlEnv() {
        const settingKeys = configLoader.getEnvkeys('KEMURI_HTML_');
        const settings = configLoader.parseEnvComon('KEMURI_HTML_', settingKeys);
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
            settings.generateSiteMap = configLoader.convertEnvValueToBool(process.env.KEMURI_HTML_GENERATE_SITEMAP);
        }
        if (settingKeys.includes('GENERATE_PAGE_LIST')) {
            //@ts-ignore
            settings.generatePageList = configLoader.convertEnvValueToBool(process.env.KEMURI_HTML_GENERATE_PAGE_LIST);
        }
        return settings;
    }
    /**
     * 環境変数に設定されたCSSビルダーの設定を取得する
     * @returns
     */
    static parseCssEnv() {
        const settingKeys = configLoader.getEnvkeys('KEMURI_CSS_');
        const settings = configLoader.parseEnvComon('KEMURI_CSS_', settingKeys);
        if (settingKeys.includes('SASS_OUTPUT_STYLE')) {
            settings.style = process.env.KEMURI_CSS_SASS_OUTPUT_STYLE;
        }
        if (settingKeys.includes('SASS_GENERATE_INDEX')) {
            //@ts-ignore
            settings.generateIndex = configLoader.convertEnvValueToBool(process.env.KEMURI_CSS_SASS_GENERATE_INDEX);
        }
        if (settingKeys.includes('SASS_INDEX_FILE_NAME')) {
            settings.indexFileName = process.env.KEMURI_CSS_SASS_INDEX_FILE_NAME;
        }
        if (settingKeys.includes('SASS_INDEX_IMPORT_TYPE')) {
            settings.indexImportType = process.env.KEMURI_CSS_SASS_INDEX_IMPORT_TYPE;
        }
        if (settingKeys.includes('SASS_SOURCE_MAP')) {
            //@ts-ignore
            settings.sourceMap = configLoader.convertEnvValueToBool(process.env.KEMURI_CSS_SASS_SOURCE_MAP);
        }
        if (settingKeys.includes('SASS_LOAD_PATHS')) {
            const envValue = _.get(process.env, 'KEMURI_CSS_SASS_LOAD_PATHS');
            //@ts-ignore
            settings.loadPaths = configLoader.convertEnvValueToArray(envValue);
        }
        return settings;
    }
    /**
     * 環境変数に設定されたJSビルダーの設定を取得する
     * @returns
     */
    static parseJsEnv() {
        const settingKeys = configLoader.getEnvkeys('KEMURI_JS_');
        const settings = configLoader.parseEnvComon('KEMURI_JS_', settingKeys);
        if (settingKeys.includes('OUTPUT_FORMAT')) {
            settings.format = process.env.KEMURI_JS_OUTPUT_FORMAT;
        }
        if (settingKeys.includes('GLOBALS')) {
            //@ts-ignore
            const envValues = configLoader.convertEnvValueToArray(_.get(process.env, 'KEMURI_JS_GLOBALS'));
            envValues.forEach((envValue) => {
                const [key, value] = envValue.split(':');
                if (key && value) {
                    settings.globals[key] = value;
                }
            });
        }
        if (settingKeys.includes('SOURCE_MAP')) {
            //@ts-ignore
            settings.generateIndex = configLoader.convertEnvValueToBool(process.env.KEMURI_JS_SOURCE_MAP);
        }
        if (settingKeys.includes('MINIFY')) {
            //@ts-ignore
            settings.generateIndex = configLoader.convertEnvValueToBool(process.env.KEMURI_JS_MINIFY);
        }
        return settings;
    }
    /**
     * 環境変数に設定されたスニペットビルダーの設定を取得する
     * @returns
     */
    static parseSnippetEnv() {
        const settingKeys = configLoader.getEnvkeys('KEMURI_SNIPPET_');
        const settings = configLoader.parseEnvComon('KEMURI_SNIPPET_', settingKeys);
        if (settingKeys.includes('SNIPPET_HAEDER_LEVEL')) {
            const envValue = _.get(process.env, 'KEMURI_SNIPPET_SNIPPET_HAEDER_LEVEL');
            //@ts-ignore
            settings.snippetHeaderLevel = configLoader.convertEnvValueToInt(envValue);
        }
        if (settingKeys.includes('EXTRA_SETTING_HAEDER_LEVEL')) {
            const envValue = _.get(process.env, 'KEMURI_SNIPPET_EXTRA_SETTING_HAEDER_LEVEL');
            //@ts-ignore
            settings.extraSettingHeaderLevel = configLoader.convertEnvValueToInt(envValue);
        }
        if (settingKeys.includes('EXTRA_SETTING_HAEDER_TEXT')) {
            const envValue = _.get(process.env, 'KEMURI_SNIPPET_EXTRA_SETTING_HAEDER_TEXT');
            //@ts-ignore
            settings.extraSettingHeaderTexts = configLoader.convertEnvValueToArray(envValue);
        }
        return settings;
    }
    /**
     * 環境変数に設定されたスクリーンショットの設定を取得する
     * @returns
     */
    static parseScreenshotEnv() {
        const settings = {};
        const settingKeys = configLoader.getEnvkeys('KEMURI_SCREENSHOT_');
        if (settingKeys.includes('OUTPUT_DIR')) {
            settings.outputDir = _.get(process.env, 'KEMURI_SCREENSHOT_OUTPUT_DIR');
        }
        if (settingKeys.includes('OUTPUT_DIR')) {
            const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_SAVE_FLAT_PATH');
            //@ts-ignore
            settings.saveFlatPath = configLoader.convertEnvValueToBool(envValue);
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
            settings.default.width = configLoader.convertEnvValueToInt(envValue);
        }
        if (settingKeys.includes('DEFAULT_HEIGHT')) {
            const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_HEIGHT');
            //@ts-ignore
            settings.default.height = configLoader.convertEnvValueToInt(envValue);
        }
        if (settingKeys.includes('HEADLESS')) {
            const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_HEADLESS');
            //@ts-ignore
            settings.headless = configLoader.convertEnvValueToBool(envValue);
        }
        if (settingKeys.includes('FULL_PAGE')) {
            const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_FULL_PAGE');
            //@ts-ignore
            settings.fullPage = configLoader.convertEnvValueToBool(envValue);
        }
        if (settingKeys.includes('RETRY_LIMIT')) {
            const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_RETRY_LIMIT');
            //@ts-ignore
            settings.retryLimit = configLoader.convertEnvValueToInt(envValue);
        }
        if (settingKeys.includes('SITEMAP_LOCATION')) {
            settings.sitemapLocation = _.get(process.env, 'KEMURI_SCREENSHOT_SITEMAP_LOCATION');
        }
        if (_.filter(settingKeys, (key) => key.startsWith('TARGET_')).length > 0) {
            settings.targets = configLoader.parseScreenshotTargetEnv(settingKeys);
        }
        return settings;
    }
    /**
     * スクリーンショットのターゲットの設定を取得する
     * @param settingKeys
     * @returns
     */
    static parseScreenshotTargetEnv(settingKeys) {
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
                targets[targetName].width = configLoader.convertEnvValueToInt(envValue);
            }
            if (settingKeys.includes(keyPrefix + '_HEIGHT')) {
                const envValue = _.get(process.env, envNamePrefix + '_HEIGHT');
                //@ts-ignore
                targets[targetName].height = configLoader.convertEnvValueToInt(envValue);
            }
        });
        return targets;
    }
    /**
     * 設定ファイルをロードする
     * @returns
     */
    static load() {
        let config = configLoader.parseEnv();
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
            const removeKeys = ['enable', 'server', 'html', 'css', 'js', 'snippet', 'screenshot'];
            removeKeys.forEach((removeKey) => {
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
        return screenshotOption;
    }
}

export { console$1 as a, configLoader as c };
