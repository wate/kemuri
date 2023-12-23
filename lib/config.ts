import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import resolve from 'resolve';
import shellQuote from 'shell-quote';
import duplexer from 'duplexer3';
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
    let copySettings = _.has(allConfig, 'copy') && _.isArray(_.get(allConfig, 'copy')) ? _.get(allConfig, 'copy') : [];
    const copyOptions = copySettings
      .filter((copySetting: any) => {
        return copySetting.src && copySetting.src.length > 0 && copySetting.dest && copySetting.dest.length > 0;
      })
      .map((copySetting: any) => {
        const copyOption: any = {
          clean: copySetting.clean ?? false,
          dereference: copySetting.dereference ?? false,
          includeEmptyDirs: copySetting.includeEmptyDirs ?? false,
          preserve: copySetting.preserve ?? false,
          update: copySetting.update ?? false,
        };
        if (_.has(copySetting, 'transforms') && _.isArray(_.get(copySetting, 'transforms'))) {
          const transforms = _.get(copySetting, 'transforms').map((filter: any) => {
            if (typeof filter === 'string') {
              return configLoader.convertCpxTransformParam(filter);
            } else {
              if (_.has(filter, 'command')) {
                return configLoader.convertCpxCommandParam(_.get(filter, 'command'));
              }
              if (_.has(filter, 'name')) {
                const args = _.has(filter, 'args') ? _.get(filter, 'args') : {};
                return configLoader.convertCpxTransformParam(_.get(filter, 'name'), args);
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
   * @see https://github.com/mysticatea/cpx/blob/master/bin/main.js#L41-L69
   */
  protected static convertCpxCommandParam(command: string): any {
    return (file: string) => {
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
   * cpxのtransformパラメーターを変換する
   * @param transforms
   * @returns
   * ※以下のコードを元に実装
   * @see https://github.com/mysticatea/cpx/blob/master/bin/main.js#L72-L92
   */
  protected static convertCpxTransformParam(name: string, args?: any): any {
    const createStream = /^[./]/.test(name)
      ? require(path.resolve(name))
      : require(resolve.sync(name, { basedir: process.cwd() }));
    return (file: string, opts: any) => createStream(file, Object.assign({ _flags: opts }, args));
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
