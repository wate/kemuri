import { cosmiconfigSync, CosmiconfigResult } from 'cosmiconfig';
import _ from 'lodash';

class configLoader {
  /**
   * ロード結果の
   */
  protected static result?: CosmiconfigResult;

  /**
   * デフォルトのコンパイラー
   */
  protected static defaultCompiler = {
    js: 'typescript',
    css: 'sass',
    html: 'nunjucks',
  };

  /**
   * 設定ファイルをロードする
   * @returns
   */
  public static load(): any {
    if (configLoader.result === undefined) {
      const explorerSync = cosmiconfigSync('builder');
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
  public static isDisable(type: 'js' | 'css' | 'html') {
    const allConfig = configLoader.load();
    if (allConfig && _.has(allConfig, 'disabled')) {
      return _.get(allConfig, 'disabled').includes(type);
    }
    return false;
  }
  /**
   * 設定の指定のキーの値を取得する
   * @param key
   * @returns
   */
  public static get(key: string, defaultValue?: any) {
    const allConfig = configLoader.load();
    return _.get(allConfig, key, defaultValue);
  }
  /**
   * 指定されたビルダーのオプションを取得する
   * @param type
   * @returns
   */
  public static getOption(type: 'js' | 'css' | 'html', overrideOption?: any): any {
    const allConfig = configLoader.load();
    let builderConfig = {};
    if (allConfig) {
      builderConfig = allConfig;
      if (_.has(allConfig, type) && _.get(allConfig, type)) {
        builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(_.get(allConfig, type)));
      }
      ['disabled', 'js', 'css', 'html'].forEach((removeKey) => {
        _.unset(builderConfig, removeKey);
      });
    }
    if (overrideOption) {
      builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(overrideOption));
    }
    return builderConfig;
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
  public static getCssOption(overrideOption?: any) {
    return configLoader.getOption('css', overrideOption);
  }
  /**
   * JSビルダーのオプションを取得する
   * @returns
   */
  public static getJsOption(overrideOption?: any) {
    return configLoader.getOption('js', overrideOption);
  }
  /**
   * コンパイラーを取得する
   * @param type
   */
  public static getCompiler(type: 'js' | 'css' | 'html'): string {
    let compiler = _.get(configLoader.defaultCompiler, type);
    const builderOption = this.getOption(type);
    if (_.has(builderOption, 'compiler') && _.has(builderOption, 'compiler')) {
      compiler = _.get(builderOption, 'compiler');
    }
    return compiler;
  }
}

export default configLoader;
