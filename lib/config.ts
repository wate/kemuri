import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosmiconfigSync, CosmiconfigResult } from 'cosmiconfig';
import nunjucks from 'nunjucks';
import _ from 'lodash';
import console from './console';
import parseEnv from './config/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

nunjucks.configure({ autoescape: false });

type settingType = 'js' | 'css' | 'html' | 'copy';

class configLoader {
  /**
   * 設定ファイルのパス
   */
  static configFile?: string;

  /**
   * 設定ファイルを生成する
   * @param force
   */
  public static copyDefaultConfig(force?: boolean): void {
    const srcConfigFilePath = path.resolve(__dirname, '../../.kemurirc.default.yml');
    const destConfigFilePath = path.resolve(process.cwd(), '.kemurirc.yml');
    if (!fs.existsSync(destConfigFilePath) || force) {
      fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
    } else {
      console.error('Configuration file(.builderrc.yml) already exists');
    }
  }

  /**
   * 設定ファイルをロードする
   * @returns
   */
  public static load(): any {
    let config = parseEnv();
    const explorerSync = cosmiconfigSync('kemuri');
    const result: CosmiconfigResult = configLoader.configFile
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
      const removeKeys = ['enable', 'assetDir', 'server', 'html', 'css', 'js', 'snippet', 'screenshot'];
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
  public static getServerOption(overrideOption?: object): object {
    const allConfig = configLoader.load();
    let serverOption =
      _.has(allConfig, 'server') && !_.isNull(_.get(allConfig, 'server')) ? _.get(allConfig, 'server') : {};
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
   * コピーのオプションを取得する
   * @returns
   */
  public static getCopyOption(): Array<object> {
    const allConfig = configLoader.load();
    let copyOption = _.has(allConfig, 'copy') && _.isArray(_.get(allConfig, 'copy')) ? _.get(allConfig, 'copy') : [];
    return copyOption;
  }

  /**
   * コピーオプションをcpxのオプションに変換する
   * @param copyOption
   */
  public static convertCpxOption(copyOption: any): object {
    const cpxOption: any = {
      clean: copyOption.clean ?? false,
      dereference: copyOption.dereference ?? false,
      includeEmptyDirs: copyOption.includeEmptyDirs ?? false,
      preserve: copyOption.preserve ?? false,
      update: copyOption.update ?? false,
    };
    return cpxOption;
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
    snippetOption = JSON.parse(nunjucks.renderString(JSON.stringify(snippetOption), allConfig));
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
    screenshotOption = JSON.parse(nunjucks.renderString(JSON.stringify(screenshotOption), allConfig));
    return screenshotOption;
  }
}

export default configLoader;
