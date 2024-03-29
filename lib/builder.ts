#!/usr/bin/env node

import chalk from 'chalk';
// @ts-ignore
import cpx from 'cpx2';
import fs from 'fs-extra';
import yargs from 'yargs';
import cssBuilder from './builder/css';
import htmlBuilder from './builder/html';
import jsBuilder from './builder/js';
import configLoader from './config';
import type { settingType } from './config';
import console from './console';
import * as server from './server/browser-sync';

const argv = yargs(process.argv.slice(2))
  .options({
    w: {
      type: 'boolean',
      default: false,
      alias: 'watch',
      description: 'watchモード',
    },
    m: {
      type: 'string',
      choices: ['develop', 'production'],
      alias: 'mode',
      description: 'ビルド処理のモード指定',
    },
    p: {
      type: 'boolean',
      alias: ['prod', 'production'],
      description: '本番モード指定のショートハンド',
    },
    d: {
      type: 'boolean',
      alias: ['dev', 'develop'],
      description: '開発モード指定のショートハンド',
    },
    html: { type: 'boolean', description: 'HTMLのビルド機能を利用する' },
    css: { type: 'boolean', description: 'CSSのビルド機能をを利用する' },
    js: { type: 'boolean', description: 'JSのビルド機能を利用する' },
    copy: { type: 'boolean', description: 'コピー機能を利用する' },
    server: { type: 'boolean', description: 'browserSyncサーバーを起動する' },
    c: {
      type: 'string',
      alias: 'config',
      description: '設定ファイルを指定する',
    },
    init: { type: 'boolean', description: 'プロジェクトの初期設定を行う' },
    force: {
      type: 'boolean',
      default: false,
      alias: 'f',
      description: '設定ファイルを強制的に上書きする',
    },
    configOnly: {
      type: 'boolean',
      default: false,
      description: '設定ファイルのみを出力する',
    },
    clean: {
      type: 'boolean',
      default: false,
      description: 'ビルド前に出力ディレクトリを空にする',
    },
  })
  .parseSync();

if (argv.init) {
  if (fs.existsSync('.builderrc.yml')) {
    if (argv.force) {
      configLoader.copyDefaultConfig(argv.force);
      console.log(
        chalk.green('Configuration file(.builderrc.yml) has been overwritten.'),
      );
    } else {
      console.warn('Configuration file(.builderrc.yml) already exists.');
    }
  } else {
    configLoader.copyDefaultConfig(argv.force);
    console.log(
      chalk.green('Configuration file(.builderrc.yml) has been generated.'),
    );
  }
  if (fs.existsSync('tsconfig.json')) {
    if (argv.force) {
      configLoader.copyDefaultTSConfig(argv.force);
      console.log(
        chalk.green('Configuration file(tsconfig.json) has been overwritten.'),
      );
    } else {
      console.warn('Configuration file(tsconfig.json) already exists.');
    }
  }

  if (argv.configOnly) {
    process.exit(0);
  }
  const createDirectories: string[] = [];
  const htmlBuilderOption = configLoader.getHtmlOption();
  createDirectories.push(
    // @ts-ignore
    htmlBuilderOption.srcDir !== undefined ? htmlBuilderOption.srcDir : 'src',
  );
  createDirectories.push(
    //@ts-ignore
    htmlBuilderOption.outputDir !== undefined
      ? //@ts-ignore
        htmlBuilderOption.outputDir
      : 'public',
  );
  const jsBuilderOption = configLoader.getJsOption();
  createDirectories.push(
    //@ts-ignore
    jsBuilderOption.srcDir !== undefined ? jsBuilderOption.srcDir : 'src',
  );
  createDirectories.push(
    //@ts-ignore
    jsBuilderOption.outputDir !== undefined
      ? //@ts-ignore
        jsBuilderOption.outputDir
      : 'public/assets/js',
  );
  const cssBuilderOption = configLoader.getCssOption();
  createDirectories.push(
    //@ts-ignore
    cssBuilderOption.srcDir !== undefined ? cssBuilderOption.srcDir : 'src',
  );
  createDirectories.push(
    //@ts-ignore
    cssBuilderOption.outputDir !== undefined
      ? //@ts-ignore
        cssBuilderOption.outputDir
      : 'public/assets/css',
  );
  const snippetBuilderOption = configLoader.getSnippetOption();
  //@ts-ignore
  createDirectories.push(
    //@ts-ignore
    snippetBuilderOption.srcDir !== undefined
      ? //@ts-ignore
        snippetBuilderOption.srcDir
      : 'docs/cheatsheet',
  );
  createDirectories.push(
    //@ts-ignore
    snippetBuilderOption.outputDir !== undefined
      ? //@ts-ignore
        snippetBuilderOption.outputDir
      : '.vscode',
  );
  const screenshotOption = configLoader.getScreenshotOption();
  //@ts-ignore
  createDirectories.push(
    //@ts-ignore
    screenshotOption.outputDir !== undefined
      ? //@ts-ignore
        screenshotOption.outputDir
      : 'screenshots',
  );
  createDirectories
    .reduce((unique: string[], item: string) => {
      if (!unique.includes(item)) {
        unique.push(item);
      }
      return unique;
    }, [])
    .sort()
    .forEach((dir) => {
      if (!fs.existsSync(dir)) {
        console.log(chalk.green('Create directory: ' + dir));
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  process.exit(0);
}

let mode: 'develop' | 'production' = 'develop';
// console.log(argv);
if (argv.mode !== undefined) {
  // @ts-ignore
  mode = String(argv.mode);
} else if (argv.develop !== undefined) {
  mode = 'develop';
} else if (argv.production !== undefined) {
  mode = 'production';
}
// console.log(mode);

if (argv.config !== undefined) {
  //@ts-ignore
  configLoader.configFile = argv.config;
}

const orverrideEnable: settingType[] = [];
const builders: any[] = [];
const outputDirectories: string[] = [];

if (configLoader.isEnable('js') || argv.js) {
  orverrideEnable.push('js');
  const jsOrverrideOption: any = {};
  if (argv.sourcemap !== undefined) {
    jsOrverrideOption.sourcemap = true;
  }
  if (argv.minify !== undefined || mode === 'production') {
    jsOrverrideOption.minify = true;
  }
  const jsBuilderOption = configLoader.getJsOption(jsOrverrideOption);
  console.group(chalk.blue('JavaScript Builder Option'));
  console.log(jsBuilderOption);
  console.groupEnd();
  jsBuilder.setOption(jsBuilderOption);
  outputDirectories.push(jsBuilder.getOutputDir());
  builders.push(jsBuilder);
}
if (configLoader.isEnable('css') || argv.css) {
  orverrideEnable.push('css');
  const cssOrverrideOption: any = {};
  if (argv.sourcemap !== undefined) {
    cssOrverrideOption.sourcemap = true;
  }
  if (argv.minify !== undefined || mode === 'production') {
    cssOrverrideOption.style = 'compressed';
  }
  const cssBuilderOption = configLoader.getCssOption(cssOrverrideOption);
  console.group(chalk.blue('CSS Builder Option'));
  console.log(cssBuilderOption);
  console.groupEnd();
  cssBuilder.setOption(cssBuilderOption);
  outputDirectories.push(cssBuilder.getOutputDir());
  builders.push(cssBuilder);
}
if (configLoader.isEnable('html') || argv.html) {
  orverrideEnable.push('html');
  const htmlBuilderOption = configLoader.getHtmlOption();
  console.group(chalk.blue('HTML Builder Option'));
  console.log(htmlBuilderOption);
  console.groupEnd();
  htmlBuilder.setOption(htmlBuilderOption);
  outputDirectories.push(htmlBuilder.getOutputDir());
  builders.push(htmlBuilder);
}
let copyFiles: any = [];
if (configLoader.isEnable('copy') || argv.copy) {
  copyFiles = configLoader.getCopyOption();
  copyFiles.forEach((copyOption: any) => {
    outputDirectories.push(copyOption.dest);
  });
  console.group(chalk.blue('Copy Option'));
  console.log(copyFiles);
  console.groupEnd();
}

if (argv.clean) {
  //出力先ディレクトリを空にする
  console.log(chalk.yellow('Clean up output directories'));
  outputDirectories
    .sort()
    .reverse()
    .forEach((dir) => {
      console.log(chalk.yellow('Remove directory: ' + dir));
      fs.emptyDirSync(dir);
    });
}

builders.forEach((builder) => {
  builder.buildAll();
});

copyFiles.forEach((copyOption: any) => {
  cpx.copy(copyOption.src, copyOption.dest, copyOption);
});

if (argv.watch) {
  builders.forEach((builder) => {
    builder.watch();
  });
  if (copyFiles.length > 0) {
    console.group(chalk.blue('Watch files'));
    console.log(copyFiles.map((copyOption: any) => copyOption.src));
    console.groupEnd();
    copyFiles.forEach((copyOption: any) => {
      cpx.watch(
        copyOption.src,
        copyOption.dest,
        Object.assign(copyOption, { initialCopy: false }),
      );
    });
  }
}

if (argv.server) {
  const browserSyncOption = server.getBrowserSyncOption({}, orverrideEnable);
  console.group(chalk.blue('browserSync Server Option'));
  console.log(browserSyncOption);
  console.groupEnd();
  server.run(browserSyncOption, orverrideEnable);
}
