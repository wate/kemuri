#!/usr/bin/env node

import cssBuilder from './builder/css';
import configLoader from './config';
import yargs from 'yargs';

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
    style: { type: 'string', choices: ['expanded', 'compressed'], description: '出力形式を指定する' },
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
const orverrideOption: any = {};
if (argv.sourcemap !== undefined && argv.sourcemap) {
  orverrideOption.sourcemap = true;
}
/**
 * 出力形式のオプション
 */
if (argv.style !== undefined) {
  orverrideOption.style = argv.style;
} else if (argv.minify !== undefined || mode === 'production') {
  orverrideOption.style = 'compressed';
}
const builderOption = configLoader.getCssOption(orverrideOption);
cssBuilder.setOption(builderOption);

if (argv.watch) {
  cssBuilder.watch();
} else {
  cssBuilder.build();
}
