import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cosmiconfigSync, CosmiconfigResult } from 'cosmiconfig';
import _ from 'lodash';
import console from './console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type settingType = 'js' | 'css' | 'html';

class configLoader {
  /**
   * 設定ファイルを生成する
   * @param force
   */
  public static init(force?: boolean): void {
    const srcConfigFilePath = path.resolve(__dirname, '../../.builderrc.default.yml');
    const destConfigFilePath = path.resolve(process.cwd(), '.builderrc.yml');
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
    const explorerSync = cosmiconfigSync('builder');
    const result: CosmiconfigResult = explorerSync.search();
    return result && result.config ? result.config : {};
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
