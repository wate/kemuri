import browserSync from 'browser-sync';
import configLoader from '../config';
import _ from 'lodash';

export interface browserSyncServerOption {
  baseDir?: string;
  port?: number;
  watch?: boolean;
  watchFiles?: string | string[] | boolean;
  proxy?: string;
  open?: boolean;
  notify?: boolean;
  browser?: string | string[];
}

/**
 * browserSyncのオプションを取得する
 * @param orverrideOption
 * @returns
 */
export function getBrowserSyncOption(orverrideOption?: browserSyncServerOption): browserSync.Options {
  const browserSyncOption: browserSync.Options = {
    port: 3000,
    open: true,
    notify: false,
    ui: false,
    watch: true,
    browser: 'default',
  };
  /**
   * HTMLビルダーが有効になっている場合は
   * ベースディレクトリオプションを自動設定する
   */

  const serverOption = configLoader.getServerOption(orverrideOption);
  const staticServer = {
    baseDir: 'public',
  };
  if (configLoader.isEnable('html')) {
    const htmlOption = configLoader.getHtmlOption();
    if (_.has(htmlOption, 'outputDir')) {
      //@ts-ignore
      staticServer.baseDir = _.get(htmlOption, 'outputDir');
    }
  }
  /**
   * ベースディレクトリのオプション
   */
  if (_.has(serverOption, 'baseDir')) {
    //@ts-ignore
    staticServer.baseDir = _.get(serverOption, 'baseDir');
  }
  /**
   * プロキシのオプション
   */
  if (_.has(serverOption, 'proxy')) {
    browserSyncOption.proxy = _.get(serverOption, 'proxy');
    browserSyncOption.files = [staticServer.baseDir + '/**'];
  } else {
    browserSyncOption.server = staticServer;
  }
  /**
   * portオプション
   */
  if (_.has(serverOption, 'port')) {
    //@ts-ignore
    browserSyncOption.port = _.get(serverOption, 'port');
  }

  /**
   * watchオプション
   */
  if (_.has(serverOption, 'watch')) {
    //@ts-ignore
    browserSyncOption.watch = _.get(serverOption, 'watch');
  }
  /**
   * filesオプション
   */
  if (_.has(serverOption, 'watchFiles')) {
    //@ts-ignore
    browserSyncOption.files = _.get(serverOption, 'watchFiles');
  }

  /**
   * ブラウザ起動のオプション
   */
  if (_.has(serverOption, 'open')) {
    //@ts-ignore
    browserSyncOption.open = _.get(serverOption, 'open');
  }

  /**
   * ブラウザオプション
   */
  if (_.has(serverOption, 'browser')) {
    //@ts-ignore
    browserSyncOption.browser = _.get(serverOption, 'browser');
  }

  /**
   * 通知オプション
   */
  if (_.has(serverOption, 'notify')) {
    //@ts-ignore
    browserSyncOption.notify = _.get(serverOption, 'notify');
  }

  return browserSyncOption;
}
/**
 * BrowserSyncを起動する
 * @param orverrideOption
 */
export function run(orverrideOption?: browserSyncServerOption) {
  let serverOption = getBrowserSyncOption(orverrideOption);
  browserSync(serverOption);
}
