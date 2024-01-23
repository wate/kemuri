import * as child_process from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CosmiconfigResult, cosmiconfigSync } from 'cosmiconfig';
import duplexer from 'duplexer3';
import _ from 'lodash';
import nunjucks from 'nunjucks';
import shellQuote from 'shell-quote';
import parseEnv from './config/env';
import console from './console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

nunjucks.configure({ autoescape: false });

export type settingType = 'js' | 'css' | 'html' | 'copy';

class builderConfig {
  /**
   * 設定ファイルのパス
   */
  configFile: string = null;

  /**
   * 設定ファイルを生成する
   * @param force
   */
  public copyDefaultConfig(force?: boolean): void {
    const srcConfigFilePath = path.resolve(
      __dirname,
      '../../.kemurirc.default.yml',
    );
    const destConfigFilePath = path.resolve(process.cwd(), '.kemurirc.yml');
    if (!fs.existsSync(destConfigFilePath) || force) {
      fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
    } else {
      console.error('Configuration file(.builderrc.yml) already exists');
    }
  }
  /**
   * TypeScriptの初期設定ファイルを生成する
   * @param force
   */
  public copyDefaultTSConfig(force?: boolean): void {
    const srcConfigFilePath = path.resolve(__dirname, '../../tsconfig.json');
    const destConfigFilePath = path.resolve(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(destConfigFilePath) || force) {
      fs.copyFileSync(srcConfigFilePath, destConfigFilePath);
    } else {
      console.error('Configuration file(tsconfig.json) already exists');
    }
  }

  /**
   * 設定ファイルをロードする
   * @returns
   */
  public load(): any {
    const config = parseEnv();
    const explorerSync = cosmiconfigSync('kemuri');
    const result: CosmiconfigResult = this.configFile
      ? explorerSync.load(this.configFile)
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
  public isEnable(type: settingType): boolean {
    const allConfig = this.load();
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
  public isDisable(type: settingType): boolean {
    return !this.isEnable(type);
  }
  /**
   * 設定の指定のキーの値を取得する
   * @param key
   * @returns
   */
  public get(key: string, defaultValue?: any): any {
    const allConfig = this.load();
    return _.get(allConfig, key, defaultValue);
  }
  /**
   * 指定されたビルダーのオプションを取得する
   * @param type
   * @returns
   */
  public getOption(type: settingType, overrideOption?: object): object {
    const allConfig = this.load();
    let builderConfig = {};
    if (allConfig) {
      builderConfig = allConfig;
      if (_.has(allConfig, type) && _.get(allConfig, type)) {
        builderConfig = _.merge(
          _.cloneDeep(builderConfig),
          _.cloneDeep(_.get(allConfig, type)),
        );
      }
      const removeKeys = [
        'enable',
        'assetDir',
        'server',
        'html',
        'css',
        'js',
        'copy',
        'snippet',
        'screenshot',
      ];
      removeKeys.forEach((removeKey) => {
        _.unset(builderConfig, removeKey);
      });
    }
    if (overrideOption) {
      builderConfig = _.merge(
        _.cloneDeep(builderConfig),
        _.cloneDeep(overrideOption),
      );
    }
    const configVars = _.merge(allConfig, { rootDir: process.cwd() });
    const configString = nunjucks.renderString(
      JSON.stringify(builderConfig),
      configVars,
    );
    builderConfig = JSON.parse(configString);
    return builderConfig;
  }
  /**
   * サーバーのオプションを取得する
   * @param overrideOption
   * @returns
   */
  public getServerOption(overrideOption?: object): object {
    const allConfig = this.load();
    let serverOption =
      _.has(allConfig, 'server') && !_.isNull(_.get(allConfig, 'server'))
        ? _.get(allConfig, 'server')
        : {};
    if (overrideOption) {
      serverOption = _.merge(
        _.cloneDeep(serverOption),
        _.cloneDeep(overrideOption),
      );
    }
    serverOption = JSON.parse(
      nunjucks.renderString(JSON.stringify(serverOption), allConfig),
    );
    return serverOption;
  }

  /**
   * HTMLビルダーのオプションを取得する
   * @returns
   */
  public getHtmlOption(overrideOption?: any): object {
    return this.getOption('html', overrideOption);
  }
  /**
   * CSSビルダーのオプションを取得する
   * @returns
   */
  public getCssOption(overrideOption?: any): object {
    return this.getOption('css', overrideOption);
  }
  /**
   * JSビルダーのオプションを取得する
   * @returns
   */
  public getJsOption(overrideOption?: any): object {
    return this.getOption('js', overrideOption);
  }
  /**
   * コピーのオプションを取得する
   * @returns
   */
  public getCopyOption(): Array<object> {
    const allConfig = this.load();
    const copySettings =
      _.has(allConfig, 'copy') && _.isArray(_.get(allConfig, 'copy'))
        ? _.get(allConfig, 'copy')
        : [];
    const copyOptions = copySettings
      .filter((copySetting: any) => {
        return (
          copySetting.src &&
          copySetting.src.length > 0 &&
          copySetting.dest &&
          copySetting.dest.length > 0
        );
      })
      .map((copySetting: any) => {
        const copyOption: any = {
          src: copySetting.src,
          dest: copySetting.dest,
          clean: copySetting.clean ?? false,
          dereference: copySetting.dereference ?? false,
          includeEmptyDirs: copySetting.includeEmptyDirs ?? false,
          preserve: copySetting.preserve ?? false,
          update: copySetting.update ?? false,
        };
        if (
          _.has(copySetting, 'commands') &&
          _.isArray(_.get(copySetting, 'commands'))
        ) {
          const transforms = _.get(copySetting, 'commands').map(
            (filter: any) => {
              if (typeof filter === 'string') {
                return this.convertCpxCommandParam(filter);
              }
              if (_.has(filter, 'command')) {
                return this.convertCpxCommandParam(_.get(filter, 'command'));
              }
            },
          );
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
  protected convertCpxCommandParam(command: string): any {
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
   * スニペットのオプションを取得する
   * @param overrideOption
   * @returns
   */
  public getSnippetOption(overrideOption?: object): object {
    const allConfig = this.load();
    let snippetOption =
      _.has(allConfig, 'snippet') && !_.isNull(_.get(allConfig, 'snippet'))
        ? _.get(allConfig, 'snippet')
        : {};
    if (overrideOption) {
      snippetOption = _.merge(
        _.cloneDeep(snippetOption),
        _.cloneDeep(overrideOption),
      );
    }
    snippetOption = JSON.parse(
      nunjucks.renderString(JSON.stringify(snippetOption), allConfig),
    );
    return snippetOption;
  }
  /**
   * スクリーンショットのオプションを取得する
   * @param overrideOption
   * @returns
   */
  public getScreenshotOption(overrideOption?: object): object {
    const allConfig = this.load();
    let screenshotOption =
      _.has(allConfig, 'screenshot') &&
      !_.isNull(_.get(allConfig, 'screenshot'))
        ? _.get(allConfig, 'screenshot')
        : {};
    if (overrideOption) {
      screenshotOption = _.merge(
        _.cloneDeep(screenshotOption),
        _.cloneDeep(screenshotOption),
      );
    }
    screenshotOption = JSON.parse(
      nunjucks.renderString(JSON.stringify(screenshotOption), allConfig),
    );
    return screenshotOption;
  }
}
const configLoader = new builderConfig();
export default configLoader;
