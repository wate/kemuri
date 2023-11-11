import browserSync from 'browser-sync';
import { c as configLoader } from './config.mjs';
import _ from 'lodash';

/**
 * BrowserSyncのオプションを取得する
 * @returns
 */
function getBrowserSyncOption() {
    const browserSyncOption = {
        port: 3000,
        open: true,
        notify: false,
        ui: false,
        watch: true,
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
     * ブラウザopenのオプション
     */
    if (_.has(serverOption, 'open')) {
        //@ts-ignore
        browserSyncOption.open = _.get(serverOption, 'open');
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
function run(orverrideOption) {
    let serverOption = getBrowserSyncOption();
    if (orverrideOption !== undefined) {
        serverOption = _.merge(_.cloneDeep(serverOption), _.cloneDeep(orverrideOption));
    }
    browserSync(serverOption);
}

export { getBrowserSyncOption as g, run as r };
