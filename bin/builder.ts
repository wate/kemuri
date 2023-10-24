import { typescriptBuilder, typescriptBuilderOption } from './lib/builder/js/typescript';
import { sassBuilder, sassBuilderOption } from './lib/builder/css/sass';
import { nunjucksBuilder, nunjucksBuilderOption } from './lib/builder/html/nunjucks';
import configLoader from './lib/builder/config';
import yargs from 'yargs';
import * as dotenv from 'dotenv'
dotenv.config()

const argv = yargs(process.argv.slice(2))
  .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
    m: {
      type: 'string',
      choices: ['develop', 'production'],
      default: 'develop',
      alias: 'mode',
      description: 'ビルド処理のモード指定',
    },
    p: { type: 'boolean', alias: ['prod', 'production'], description: '本番モード指定のショートハンド' },
    d: { type: 'boolean', alias: ['dev', 'develop'], description: '開発モード指定のショートハンド' },
    c: { type: 'string', alias: 'config', description: '設定ファイルの指定' },
    sourcemap: { type: 'boolean', description: 'sourcemapファイルを出力する' },
    minify: { type: 'boolean', description: 'minify化するか否か' },
  })
  .parseSync();

let mode: string = 'develop';
if (argv.mode !== undefined) {
  mode = String(argv.mode);
} else if (argv.develop !== undefined) {
  mode = 'develop';
} else if (argv.production !== undefined) {
  mode = 'production';
}

/**
 * ソースマップの出力オプション
 */
const jsOrverrideOption: typescriptBuilderOption = {};
const cssOrverrideOption: sassBuilderOption = {};
if (argv.sourcemap !== undefined) {
  jsOrverrideOption.sourcemap = true;
  cssOrverrideOption.sourcemap = true;
}
/**
 * minifyの出力オプション
 */
if (argv.minify !== undefined || mode === 'production') {
  jsOrverrideOption.minify = true;
  cssOrverrideOption.style = 'compressed';
}

// console.log('jsOrverrideOption', jsOrverrideOption);
// console.log('cssOrverrideOption', cssOrverrideOption);

const builders = new Map();
if (!configLoader.isDisable('js')) {
  const builderOption = configLoader.getJsOption(jsOrverrideOption);
  console.log('jsBuildOption', builderOption);
  builders.set('js', new typescriptBuilder(builderOption));
}
if (!configLoader.isDisable('css')) {
  const builderOption = configLoader.getCssOption(cssOrverrideOption);
  console.log('cssBuildOption', builderOption);
  builders.set('css', new sassBuilder(builderOption));
}
if (!configLoader.isDisable('html')) {
  const builderOption = configLoader.getHtmlOption();
  console.log('htmlBuildOption', builderOption);
  builders.set('html', new nunjucksBuilder(builderOption));
}

if (argv.watch) {
  builders.forEach((builder) => {
    builder.watch();
  });
} else {
  builders.forEach((builder) => {
    builder.build();
  });
}
