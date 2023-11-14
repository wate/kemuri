import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosmiconfigSync, CosmiconfigResult } from 'cosmiconfig';
import _ from 'lodash';
import console from './console';
import * as dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type settingType = 'js' | 'css' | 'html';

class configLoader {
  /**
   * 設定ファイルを生成する
   * @param force
   */
  public static init(force?: boolean): void {
    const srcConfigFilePath = path.resolve(__dirname, '../../.kemurirc.default.yml');
    const destConfigFilePath = path.resolve(process.cwd(), '.kemurirc.yml');
    if (!fs.existsSync(destConfigFilePath) || force) {
      fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
    } else {
      console.error('Configuration file(.builderrc.yml) already exists');
    }
  }

  /**
   * 環境変数のパースと設定
   */
  public static parseEnv(): object {
    const enableConfig = {
      enable: configLoader.parseEnableEnv(),
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
    return _.merge(
      _.cloneDeep(enableConfig),
      _.cloneDeep(htmlConfig),
      _.cloneDeep(cssConfig),
      _.cloneDeep(jsConfig),
      _.cloneDeep(snippetConfig),
      _.cloneDeep(screenshotConfig),
    );
  }
  /**
   * 定義済みの環境変数のキーを取得する
   * @param envNamePrefix
   * @returns
   */
  protected static getEnvkeys(envNamePrefix: string): Array<string> {
    return Object.keys(process.env)
      .filter((key) => key.startsWith(envNamePrefix))
      .map((key) => key.replace(envNamePrefix, ''));
  }
  /**
   * 環境変数の値を配列に変換する
   * @param envValue
   * @returns
   */
  protected static convertEnvValueToArray(envValue: string, toLowerCase: boolean = false): Array<string> {
    return envValue
      .split(',')
      .map((item) => {
        if (toLowerCase) {
          return item.toLowerCase().trim();
        } else {
          return item.trim();
        }
      })
      .filter((item) => item.length > 0)
      .reduce((unique: string[], current: string) => {
        return unique.includes(current) ? unique : [...unique, current];
      }, []);
  }

  /**
   * 環境変数の値をbooleanに変換する
   * @param envValue
   * @returns
   */
  protected static convertEnvValueToBool(envValue: string): boolean {
    return ['true', 'yes', 'on', '1'].includes(envValue.toLocaleLowerCase());
  }
  /**
   * 環境変数の値を数値に変換する
   * @param envValue
   * @returns
   */
  protected static convertEnvValueToInt(envValue: string): Number | null {
    return envValue.length > 0 ? parseInt(envValue, 10) : null;
  }
  /**
   * 環境変数に設定された有効化するビルダーの一覧を取得する
   * @returns
   */
  public static parseEnableEnv(): Array<string> {
    //@ts-ignore
    return _.has(process.env, 'KEMURI_ENABLE') ? configLoader.convertEnvValueToArray(process.env.KEMURI_ENABLE) : [];
  }

  /**
   * 環境変数に設定されたサーバーの設定を取得する
   * @returns
   */
  public static parseServerEnv(): object {
    const settings: any = {};
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
   * 環境変数に設定されたHTMLビルダーの設定を取得する
   * @returns
   */
  public static parseHtmlEnv(): object {
    const settingKeys = configLoader.getEnvkeys('KEMURI_HTML_');
    return {};
  }
  /**
   * 環境変数に設定されたJSビルダーの設定を取得する
   * @returns
   */
  public static parseJsEnv(): object {
    const settingKeys = configLoader.getEnvkeys('KEMURI_JS_');
    return {};
  }
  /**
   * 環境変数に設定されたCSSビルダーの設定を取得する
   * @returns
   */
  public static parseCssEnv(): object {
    const settingKeys = configLoader.getEnvkeys('KEMURI_CSS_');
    return {};
  }
  /**
   * 環境変数に設定されたスニペットビルダーの設定を取得する
   * @returns
   */
  public static parseSnippetEnv(): object {
    const settingKeys = configLoader.getEnvkeys('KEMURI_SNIPPET_');
    return {};
  }
  /**
   * 環境変数に設定されたスクリーンショットの設定を取得する
   * @returns
   */
  public static parseScreenshotEnv(): object {
    const settingKeys = configLoader.getEnvkeys('KEMURI_SCREENSHOT_');
    return {};
  }
  /**
   * 設定ファイルをロードする
   * @returns
   */
  public static load(): any {
    let config = configLoader.parseEnv();
    const explorerSync = cosmiconfigSync('kemuri');
    const result: CosmiconfigResult = explorerSync.search();
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
  public static isEnable(type: settingType): boolean {
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
  public static isDisable(type: settingType): boolean {
    return !this.isEnable(type);
  }
  /**
   * 設定の指定のキーの値を取得する
   * @param key
   * @returns
   */
  public static get(key: string, defaultValue?: any): any {
    const allConfig = configLoader.load();
    return _.get(allConfig, key, defaultValue);
  }
  /**
   * 指定されたビルダーのオプションを取得する
   * @param type
   * @returns
   */
  public static getOption(type: settingType, overrideOption?: object): object {
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
  public static getServerOption(overrideOption?: object): object {
    const allConfig = configLoader.load();
    let serverOption =
      _.has(allConfig, 'server') && !_.isNull(_.get(allConfig, 'server')) ? _.get(allConfig, 'server') : {};
    if (overrideOption) {
      serverOption = _.merge(_.cloneDeep(serverOption), _.cloneDeep(overrideOption));
    }
    return serverOption;
  }

  /**
   * HTMLビルダーのオプションを取得する
   * @returns
   */
  public static getHtmlOption(overrideOption?: any): object {
    return configLoader.getOption('html', overrideOption);
  }
  /**
   * CSSビルダーのオプションを取得する
   * @returns
   */
  public static getCssOption(overrideOption?: any): object {
    return configLoader.getOption('css', overrideOption);
  }
  /**
   * JSビルダーのオプションを取得する
   * @returns
   */
  public static getJsOption(overrideOption?: any): object {
    return configLoader.getOption('js', overrideOption);
  }

  /**
   * スニペットのオプションを取得する
   * @param overrideOption
   * @returns
   */
  public static getSnippetOption(overrideOption?: object): object {
    const allConfig = configLoader.load();
    let snippetOption =
      _.has(allConfig, 'snippet') && !_.isNull(_.get(allConfig, 'snippet')) ? _.get(allConfig, 'snippet') : {};
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
  public static getScreenshotOption(overrideOption?: object): object {
    const allConfig = configLoader.load();
    let screenshotOption =
      _.has(allConfig, 'screenshot') && !_.isNull(_.get(allConfig, 'screenshot')) ? _.get(allConfig, 'screenshot') : {};
    if (overrideOption) {
      screenshotOption = _.merge(_.cloneDeep(screenshotOption), _.cloneDeep(screenshotOption));
    }
    return screenshotOption;
  }
}

export default configLoader;
