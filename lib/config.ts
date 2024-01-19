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

export const configFile: string = undefined;

/**
 * 設定ファイルを生成する
 * @param force
 */
export function copyDefaultConfig(force?: boolean): void {
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
export function copyDefaultTSConfig(force?: boolean): void {
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
export function load(): any {
  const config = parseEnv();
  const explorerSync = cosmiconfigSync('kemuri');
  const result: CosmiconfigResult = configFile
    ? explorerSync.load(configFile)
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
export function isEnable(type: settingType): boolean {
  const allConfig = load();
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
export function isDisable(type: settingType): boolean {
  return !isEnable(type);
}
/**
 * 設定の指定のキーの値を取得する
 * @param key
 * @returns
 */
export function get(key: string, defaultValue?: any): any {
  const allConfig = load();
  return _.get(allConfig, key, defaultValue);
}
/**
 * 指定されたビルダーのオプションを取得する
 * @param type
 * @returns
 */
export function getOption(type: settingType, overrideOption?: object): object {
  const allConfig = load();
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
  builderConfig = JSON.parse(
    nunjucks.renderString(JSON.stringify(builderConfig), allConfig),
  );
  return builderConfig;
}
/**
 * サーバーのオプションを取得する
 * @param overrideOption
 * @returns
 */
export function getServerOption(overrideOption?: object): object {
  const allConfig = load();
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
export function getHtmlOption(overrideOption?: any): object {
  return getOption('html', overrideOption);
}
/**
 * CSSビルダーのオプションを取得する
 * @returns
 */
export function getCssOption(overrideOption?: any): object {
  return getOption('css', overrideOption);
}
/**
 * JSビルダーのオプションを取得する
 * @returns
 */
export function getJsOption(overrideOption?: any): object {
  return getOption('js', overrideOption);
}
/**
 * コピーのオプションを取得する
 * @returns
 */
export function getCopyOption(): Array<object> {
  const allConfig = load();
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
        const transforms = _.get(copySetting, 'commands').map((filter: any) => {
          if (typeof filter === 'string') {
            return convertCpxCommandParam(filter);
          }
          if (_.has(filter, 'command')) {
            return convertCpxCommandParam(_.get(filter, 'command'));
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
function convertCpxCommandParam(command: string): any {
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
export function getSnippetOption(overrideOption?: object): object {
  const allConfig = load();
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
export function getScreenshotOption(overrideOption?: object): object {
  const allConfig = load();
  let screenshotOption =
    _.has(allConfig, 'screenshot') && !_.isNull(_.get(allConfig, 'screenshot'))
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
