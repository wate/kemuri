import browserSync from 'browser-sync';
import configLoader from '../config';
import _ from 'lodash';

export interface browserSyncServerOption {
  baseDir?: string;
  port?: number;
  watch?: boolean;
  watchFiles?: string | string[] | boolean;
  notify?: boolean;
  open?: boolean;
  browser?: string | string[];
  ui?: boolean;
  uiPort?: number;
}

/**
 * BrowserSyncのオプションを取得する
 * @returns
 */
export function getBrowserSyncOption(): browserSync.Options {
  const browserSyncOption: browserSync.Options = {
    port: 3000,
    open: true,
    notify: false,
    ui: false,
    watch: true,
    browser: 'default',
    server: {
      baseDir: 'public',
    },
  };
  /**
   * ベースディレクトリオプション
   */
  const serverOption = configLoader.getServerOption();
  if (!configLoader.isEnable('html')) {
    const htmlOption = configLoader.getHtmlOption();
    if (_.has(htmlOption, 'outputDir')) {
      //@ts-ignore
      browserSyncOption.server.baseDir = _.get(htmlOption, 'outputDir');
    }
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
   * UIオプション
   */
  if (_.has(serverOption, 'ui') && _.get(serverOption, 'ui')) {
    browserSyncOption.ui = true;
    if (browserSyncOption.ui && _.has(serverOption, 'uiPort')) {
      //browserSyncのUIポート番号を設定
      browserSyncOption.ui = {
        port: _.get(serverOption, 'uiPort'),
      };
    }
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
export function run(orverrideOption?: browserSync.Options) {
  let serverOption = getBrowserSyncOption();
  if (orverrideOption !== undefined) {
    serverOption = _.merge(_.cloneDeep(serverOption), _.cloneDeep(orverrideOption));
  }
  browserSync(serverOption);
}
