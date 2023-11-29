import _ from 'lodash';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * 定義済みの環境変数のキーを取得する
 * @param envNamePrefix
 * @returns
 */
function getEnvKeys(envNamePrefix: string): Array<string> {
  return Object.keys(process.env)
    .filter((key) => key.startsWith(envNamePrefix))
    .map((key) => key.replace(envNamePrefix, ''));
}
/**
 * 環境変数の値を配列に変換する
 * @param envValue
 * @returns
 */
function convertEnvValueToArray(envValue: string, toLowerCase: boolean = false): Array<string> {
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
function convertEnvValueToBool(envValue: string): boolean {
  return ['true', 'yes', 'on', '1'].includes(envValue.toLocaleLowerCase());
}
/**
 * 環境変数の値を数値に変換する
 * @param envValue
 * @returns
 */
function convertEnvValueToInt(envValue: string): Number | null {
  return envValue.length > 0 ? parseInt(envValue, 10) : null;
}
/**
 * 環境変数に設定された有効化するビルダーの一覧を取得する
 * @returns
 */
function parseEnableEnv(): Array<string> {
  //@ts-ignore
  return _.has(process.env, 'KEMURI_ENABLE') ? convertEnvValueToArray(process.env.KEMURI_ENABLE) : [];
}

/**
 * 環境変数に設定されたサーバーの設定を取得する
 * @returns
 */
function parseServerEnv(): object {
  const settings: any = {};
  const settingKeys = getEnvKeys('KEMURI_SERVER_');
  if (settingKeys.includes('BASE_DIR')) {
    //@ts-ignore
    settings.baseDir = convertEnvValueToArray(process.env.KEMURI_SERVER_BASE_DIR);
  }
  if (settingKeys.includes('PORT')) {
    //@ts-ignore
    settings.port = convertEnvValueToInt(process.env.KEMURI_SERVER_PORT);
  }
  if (settingKeys.includes('WATCH')) {
    //@ts-ignore
    settings.watch = convertEnvValueToBool(process.env.KEMURI_SERVER_WATCH);
  }
  if (settingKeys.includes('WATCH_FILES')) {
    //@ts-ignore
    settings.watchFiles = convertEnvValueToArray(process.env.KEMURI_SERVER_WATCH_FILES);
  }
  if (settingKeys.includes('PROXY')) {
    //@ts-ignore
    settings.proxy = _.get(process.env, 'KEMURI_SERVER_PROXY');
  }
  if (settingKeys.includes('OPEN')) {
    //@ts-ignore
    settings.open = convertEnvValueToBool(process.env.KEMURI_SERVER_OPEN);
  }
  if (settingKeys.includes('BROWSER')) {
    //@ts-ignore
    settings.browser = process.env.KEMURI_SERVER_BROWSER;
  }
  if (settingKeys.includes('NOTIFY')) {
    //@ts-ignore
    settings.notify = convertEnvValueToBool(process.env.KEMURI_SERVER_NOTIFY);
  }
  if (settingKeys.includes('UI')) {
    //@ts-ignore
    settings.ui = convertEnvValueToBool(process.env.KEMURI_SERVER_UI);
  }
  if (settingKeys.includes('UI_PORT')) {
    //@ts-ignore
    settings.uiPort = convertEnvValueToInt(process.env.KEMURI_SERVER_UI_PORT);
  }
  return settings;
}
/**
 * 環境変数に設定された共通の設定を取得する
 * @param settingKeys
 * @returns
 */
function parseEnvCommon(envKeyPrefix: string, settingKeys: string[]): object {
  const settings: any = {};
  if (settingKeys.includes('SOURCE_DIR')) {
    settings.srcDir = _.get(process.env, envKeyPrefix + 'SOURCE_DIR');
  }
  if (settingKeys.includes('OUTPUT_DIR')) {
    settings.outputDir = _.get(process.env, envKeyPrefix + 'OUTPUT_DIR');
  }
  if (settingKeys.includes('TARGET_FILE_EXT')) {
    const envValue = _.get(process.env, envKeyPrefix + 'TARGET_FILE_EXT');
    //@ts-ignore
    settings.exts = convertEnvValueToArray(envValue, true);
  }
  if (settingKeys.includes('MODULE_FILE_EXT')) {
    const envValue = _.get(process.env, envKeyPrefix + 'MODULE_FILE_EXT');
    //@ts-ignore
    settings.moduleExts = convertEnvValueToArray(envValue, true);
  }
  if (_.filter(settingKeys, (key) => key.startsWith('IGNORE_')).length > 0) {
    settings.ignore = {};
  }
  if (settingKeys.includes('IGNORE_PREFIX')) {
    settings.ignore.prefix = _.get(process.env, envKeyPrefix + 'IGNORE_PREFIX');
  }
  if (settingKeys.includes('IGNORE_SUFFIX')) {
    settings.ignore.suffix = _.get(process.env, envKeyPrefix + 'IGNORE_SUFFIX');
  }
  if (settingKeys.includes('IGNORE_FILE_PREFIX')) {
    settings.ignore.filePrefix = _.get(process.env, envKeyPrefix + 'IGNORE_FILE_PREFIX');
  }
  if (settingKeys.includes('IGNORE_DIR_PREFIX')) {
    settings.ignore.dirPrefix = _.get(process.env, envKeyPrefix + 'IGNORE_DIR_PREFIX');
  }
  if (settingKeys.includes('IGNORE_FILE_SUFFIX')) {
    settings.ignore.fileSuffix = _.get(process.env, envKeyPrefix + 'IGNORE_FILE_SUFFIX');
  }
  if (settingKeys.includes('IGNORE_DIR_SUFFIX')) {
    settings.ignore.dirSuffix = _.get(process.env, envKeyPrefix + 'IGNORE_DIR_SUFFIX');
  }
  if (settingKeys.includes('IGNORE_DIR_NAMES')) {
    const envValue = _.get(process.env, envKeyPrefix + 'IGNORE_DIR_NAMES');
    //@ts-ignore
    settings.ignore.dirNames = convertEnvValueToArray(envValue);
  }
  return settings;
}
/**
 * 環境変数に設定されたHTMLビルダーの設定を取得する
 * @returns
 */
function parseHtmlEnv(): object {
  const settingKeys = getEnvKeys('KEMURI_HTML_');
  const settings: any = parseEnvCommon('KEMURI_HTML_', settingKeys);
  if (settingKeys.includes('VAR_FILE_NAME')) {
    //@ts-ignore
    settings.varFileName = process.env.KEMURI_HTML_VAR_FILE_NAME;
  }
  if (settingKeys.includes('SITE_URL')) {
    //@ts-ignore
    settings.siteUrl = process.env.KEMURI_HTML_SITE_URL;
  }
  if (settingKeys.includes('GENERATE_SITEMAP')) {
    //@ts-ignore
    settings.generateSiteMap = convertEnvValueToBool(process.env.KEMURI_HTML_GENERATE_SITEMAP);
  }
  if (settingKeys.includes('GENERATE_PAGE_LIST')) {
    //@ts-ignore
    settings.generatePageList = convertEnvValueToBool(process.env.KEMURI_HTML_GENERATE_PAGE_LIST);
  }
  return settings;
}
/**
 * 環境変数に設定されたCSSビルダーの設定を取得する
 * @returns
 */
function parseCssEnv(): object {
  const settingKeys = getEnvKeys('KEMURI_CSS_');
  const settings: any = parseEnvCommon('KEMURI_CSS_', settingKeys);
  if (settingKeys.includes('SASS_OUTPUT_STYLE')) {
    settings.style = process.env.KEMURI_CSS_SASS_OUTPUT_STYLE;
  }
  if (settingKeys.includes('SASS_GENERATE_INDEX')) {
    //@ts-ignore
    settings.generateIndex = convertEnvValueToBool(process.env.KEMURI_CSS_SASS_GENERATE_INDEX);
  }
  if (settingKeys.includes('SASS_INDEX_FILE_NAME')) {
    settings.indexFileName = process.env.KEMURI_CSS_SASS_INDEX_FILE_NAME;
  }
  if (settingKeys.includes('SASS_INDEX_IMPORT_TYPE')) {
    settings.indexImportType = process.env.KEMURI_CSS_SASS_INDEX_IMPORT_TYPE;
  }
  if (settingKeys.includes('SASS_SOURCE_MAP')) {
    //@ts-ignore
    settings.sourceMap = convertEnvValueToBool(process.env.KEMURI_CSS_SASS_SOURCE_MAP);
  }
  if (settingKeys.includes('SASS_LOAD_PATHS')) {
    const envValue = _.get(process.env, 'KEMURI_CSS_SASS_LOAD_PATHS');
    //@ts-ignore
    settings.loadPaths = convertEnvValueToArray(envValue);
  }
  return settings;
}
/**
 * 環境変数に設定されたJSビルダーの設定を取得する
 * @returns
 */
function parseJsEnv(): object {
  const settingKeys = getEnvKeys('KEMURI_JS_');
  const settings: any = parseEnvCommon('KEMURI_JS_', settingKeys);
  if (settingKeys.includes('OUTPUT_FORMAT')) {
    settings.format = process.env.KEMURI_JS_OUTPUT_FORMAT;
  }
  if (settingKeys.includes('GLOBALS')) {
    //@ts-ignore
    const envValues = convertEnvValueToArray(_.get(process.env, 'KEMURI_JS_GLOBALS'));
    envValues.forEach((envValue) => {
      const [key, value] = envValue.split(':');
      if (key && value) {
        settings.globals[key] = value;
      }
    });
  }
  if (settingKeys.includes('SOURCE_MAP')) {
    //@ts-ignore
    settings.generateIndex = convertEnvValueToBool(process.env.KEMURI_JS_SOURCE_MAP);
  }
  if (settingKeys.includes('MINIFY')) {
    //@ts-ignore
    settings.generateIndex = convertEnvValueToBool(process.env.KEMURI_JS_MINIFY);
  }
  return settings;
}

/**
 * 環境変数に設定されたスニペットビルダーの設定を取得する
 * @returns
 */
function parseSnippetEnv(): object {
  const settingKeys = getEnvKeys('KEMURI_SNIPPET_');
  const settings: any = parseEnvCommon('KEMURI_SNIPPET_', settingKeys);
  if (settingKeys.includes('SNIPPET_HAEDER_LEVEL')) {
    const envValue = _.get(process.env, 'KEMURI_SNIPPET_SNIPPET_HAEDER_LEVEL');
    //@ts-ignore
    settings.snippetHeaderLevel = convertEnvValueToInt(envValue);
  }
  if (settingKeys.includes('EXTRA_SETTING_HAEDER_LEVEL')) {
    const envValue = _.get(process.env, 'KEMURI_SNIPPET_EXTRA_SETTING_HAEDER_LEVEL');
    //@ts-ignore
    settings.extraSettingHeaderLevel = convertEnvValueToInt(envValue);
  }
  if (settingKeys.includes('EXTRA_SETTING_HAEDER_TEXT')) {
    const envValue = _.get(process.env, 'KEMURI_SNIPPET_EXTRA_SETTING_HAEDER_TEXT');
    //@ts-ignore
    settings.extraSettingHeaderTexts = convertEnvValueToArray(envValue);
  }
  return settings;
}
/**
 * 環境変数に設定されたスクリーンショットの設定を取得する
 * @returns
 */
function parseScreenshotEnv(): object {
  const settings: any = {};
  const settingKeys = getEnvKeys('KEMURI_SCREENSHOT_');
  if (settingKeys.includes('OUTPUT_DIR')) {
    settings.outputDir = _.get(process.env, 'KEMURI_SCREENSHOT_OUTPUT_DIR');
  }
  if (settingKeys.includes('SAVE_FLAT_PATH')) {
    const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_SAVE_FLAT_PATH');
    //@ts-ignore
    settings.saveFlatPath = convertEnvValueToBool(envValue);
  }
  if (_.filter(settingKeys, (key) => key.startsWith('DEFAULT_')).length > 0) {
    settings.default = {};
  }
  if (settingKeys.includes('DEFAULT_TYPE')) {
    settings.default.type = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_TYPE');
  }
  if (settingKeys.includes('DEFAULT_WIDTH')) {
    const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_WIDTH');
    //@ts-ignore
    settings.default.width = convertEnvValueToInt(envValue);
  }
  if (settingKeys.includes('DEFAULT_HEIGHT')) {
    const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_DEFAULT_HEIGHT');
    //@ts-ignore
    settings.default.height = convertEnvValueToInt(envValue);
  }
  if (settingKeys.includes('HEADLESS')) {
    const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_HEADLESS');
    //@ts-ignore
    settings.headless = convertEnvValueToBool(envValue);
  }
  if (settingKeys.includes('FULL_PAGE')) {
    const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_FULL_PAGE');
    //@ts-ignore
    settings.fullPage = convertEnvValueToBool(envValue);
  }
  if (settingKeys.includes('RETRY_LIMIT')) {
    const envValue = _.get(process.env, 'KEMURI_SCREENSHOT_RETRY_LIMIT');
    //@ts-ignore
    settings.retryLimit = convertEnvValueToInt(envValue);
  }
  if (settingKeys.includes('SITEMAP_LOCATION')) {
    settings.sitemapLocation = _.get(process.env, 'KEMURI_SCREENSHOT_SITEMAP_LOCATION');
  }
  if (_.filter(settingKeys, (key) => key.startsWith('TARGET_')).length > 0) {
    settings.targets = parseScreenshotTargetEnv(settingKeys);
  }
  return settings;
}
/**
 * スクリーンショットのターゲットの設定を取得する
 * @param settingKeys
 * @returns
 */
function parseScreenshotTargetEnv(settingKeys: string[]): object {
  const targets = {};
  const targetKeys = settingKeys.filter((key) => {
    return key.startsWith('TARGET_') && key.endsWith('_TYPE');
  });
  targetKeys.forEach((targetKey) => {
    const keyPrefix = targetKey.replace(/_TYPE$/, '');
    const envNamePrefix = 'KEMURI_SCREENSHOT_' + keyPrefix;
    let targetName = targetKey
      .replace(/^TARGET_/, '')
      .replace(/_TYPE$/, '')
      .toLocaleLowerCase();
    if (settingKeys.includes(keyPrefix + '_NAME')) {
      //@ts-ignore
      targetName = _.get(process.env, envNamePrefix + '_NAME');
    }
    //@ts-ignore
    targets[targetName] = {
      type: _.get(process.env, envNamePrefix + '_TYPE'),
    };
    if (settingKeys.includes(keyPrefix + '_WIDTH')) {
      const envValue = _.get(process.env, envNamePrefix + '_WIDTH');
      //@ts-ignore
      targets[targetName].width = convertEnvValueToInt(envValue);
    }
    if (settingKeys.includes(keyPrefix + '_HEIGHT')) {
      const envValue = _.get(process.env, envNamePrefix + '_HEIGHT');
      //@ts-ignore
      targets[targetName].height = convertEnvValueToInt(envValue);
    }
  });
  return targets;
}

/**
 * 環境変数のパースと設定
 */
export default function parseEnv(): object {
  const enableConfig = {
    enable: parseEnableEnv(),
  };
  const serverConfig = {
    server: parseServerEnv(),
  };
  const htmlConfig = {
    html: parseHtmlEnv(),
  };
  const cssConfig = {
    css: parseCssEnv(),
  };
  const jsConfig = {
    js: parseJsEnv(),
  };
  const snippetConfig = {
    snippet: parseSnippetEnv(),
  };
  const screenshotConfig = {
    screenshot: parseScreenshotEnv(),
  };
  const envSettings = _.merge(
    _.cloneDeep(enableConfig),
    _.cloneDeep(serverConfig),
    _.cloneDeep(htmlConfig),
    _.cloneDeep(cssConfig),
    _.cloneDeep(jsConfig),
    _.cloneDeep(snippetConfig),
    _.cloneDeep(screenshotConfig),
  );
  return envSettings;
}
