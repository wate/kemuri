#!/usr/bin/env node
import jsBuilder from './builder/js';
import configLoader from './builder/config';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import './console';
dotenv.config();

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
 * minifyの出力オプション
 */
if (argv.minify !== undefined || mode === 'production') {
  orverrideOption.minify = true;
}
const builderOption = configLoader.getJsOption(orverrideOption);

jsBuilder.setOption(builderOption);

if (argv.watch) {
  jsBuilder.watch();
} else {
  jsBuilder.build();
}
