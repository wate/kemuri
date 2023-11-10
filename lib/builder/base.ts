import fs from 'node:fs';
import * as path from 'node:path';
import { glob, Path } from 'glob';
import * as chokidar from 'chokidar';
import { rimraf, rimrafSync } from 'rimraf';
import editorconfig from 'editorconfig';
import console from '../console';

/**
 * エントリポイント除外オプション
 */
export type ignoreOption = {
  /**
   * 除外するファイル及びディレクトリのプレフィックス
   */
  prefix?: string;
  /**
   * 除外するファイル及びディレクトリのサフィックス
   */
  suffix?: string;
  /**
   * 除外するファイルのプレフィックス
   */
  filePrefix?: string;
  /**
   * 除外するファイルのサフィックス
   */
  fileSuffix?: string;
  /**
   * 除外するディレクトリのプレフィックス
   */
  dirPrefix?: string;
  /**
   * 除外するディレクトリのサフィックス
   */
  dirSuffix?: string;
  /**
   * 除外ディレクトリ名
   */
  dirNames?: string[];
};

/**
 * ビルダーのコンストラクターオプション
 */
export interface builderOption {
  srcDir?: string;
  outputDir?: string;
  exts?: string[];
  moduleExts?: string[];
  ignore?: ignoreOption;
  compileOption?: any;
  beautifyOption?: any;
}

/**
 * ビルド処理の抽象クラス
 */
export abstract class baseBuilder {
  /**
   * ソースコードのディレクトリ
   */
  protected srcDir: string = 'src';
  /**
   * 出力先ディレクトリ
   */
  protected outputDir: string = 'public';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = [];

  /**
   * エントリポイントではないが変更の監視対象となるファイルの拡張子
   */
  protected moduleExts: string[] = [];
  /**
   * エントリポイントから除外するファイル名の接頭語
   */
  protected ignoreFilePrefix: string | null = null;
  /**
   * エントリポイントから除外するファイル名の接尾語
   */
  protected ignoreFileSuffix?: string | null = null;
  /**
   * エントリポイントから除外するディレクトリ名の接頭語
   * (この接頭語を持つディレクトリ以下に配置されているファイルはエントリポイントから除外される)
   */
  protected ignoreDirPrefix: string | null = null;
  /**
   * エントリポイントから除外するディレクトリ名の接尾語
   */
  protected ignoreDirSuffix: string | null = null;
  /**
   * エントリポイントから除外するディレクトリ名
   * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
   */
  protected ignoreDirNames: string[] = [];

  /**
   * 出力時の拡張子
   */
  protected outputExt: string = 'txt';

  /**
   * コンパイラーのオプション
   */
  protected compileOption: any = {};

  /**
   * js-beautifyのオプション
   */
  protected beautifyOption: any = {};

  /**
   * コンストラクタ
   * @param option
   */
  constructor(option?: builderOption) {
    if (option) {
      this.setOption(option);
    }
  }

  /**
   * ビルダーのオプションを設定する
   * @param option
   */
  public setOption(option: builderOption) {
    if (option.srcDir !== undefined && option.srcDir) {
      this.srcDir = option.srcDir;
    }
    if (option.outputDir !== undefined && option.outputDir) {
      this.outputDir = option.outputDir;
    }
    if (option.exts !== undefined) {
      this.fileExts = option.exts;
    }
    if (option.moduleExts !== undefined) {
      this.moduleExts = option.moduleExts;
    }
    if (option.ignore !== undefined && option.ignore) {
      this.setIgnoreOption(option.ignore);
    }
    if (option.compileOption !== undefined && option.compileOption) {
      this.setCompileOption(option.compileOption);
    }
    if (option.beautifyOption !== undefined && option.beautifyOption) {
      this.setBeautifyOption(option.beautifyOption);
    }
  }
  /**
   * コンパイラーのオプションを設定する
   *
   * @param compileOption
   */
  public setCompileOption(compileOption: any): void {
    this.compileOption = compileOption;
  }
  /**
   * js-beautifyのオプションを設定する
   *
   * @param compileOption
   */
  public setBeautifyOption(beautifyOption: any): void {
    this.beautifyOption = beautifyOption;
  }
  /**
   * エントリポイントのファイルの拡張子を設定する
   * @param fileExts
   * @returns
   */
  public setExt(fileExts: string[]): void {
    this.fileExts = fileExts;
  }
  /**
   * 監視対象に含めるモジュールファイルの拡張子を設定する
   * @param moduleExts
   * @returns
   */
  public setModuleExts(moduleExts: string[]): void {
    this.moduleExts = moduleExts;
  }
  /**
   * エントリポイントの除外オプションを設定する
   * @param option
   */
  public setIgnoreOption(option: ignoreOption): void {
    if (option.prefix && option.filePrefix === undefined) {
      option.filePrefix = option.prefix;
    }
    if (option.prefix && option.dirPrefix === undefined) {
      option.dirPrefix = option.prefix;
    }
    if (option.suffix && option.fileSuffix === undefined) {
      option.fileSuffix = option.suffix;
    }
    if (option.suffix && option.dirSuffix === undefined) {
      option.dirSuffix = option.suffix;
    }
    if (option.filePrefix !== undefined && option.filePrefix) {
      this.setIgnoreFilePrefix(option.filePrefix);
    }
    if (option.dirPrefix !== undefined && option.dirPrefix) {
      this.setIgnoreDirPrefix(option.dirPrefix);
    }
    if (option.fileSuffix !== undefined && option.fileSuffix) {
      this.setIgnoreFileSuffix(option.fileSuffix);
    }
    if (option.dirSuffix !== undefined && option.dirSuffix) {
      this.setIgnoreDirSuffix(option.dirSuffix);
    }
    if (option.dirNames !== undefined) {
      this.setIgnoreDirNames(option.dirNames);
    }
  }
  /**
   * エントリポイントから除外する接頭語を設定する
   * @param ignorePrefix
   * @returns
   */
  public setIgnorePrefix(ignorePrefix: string): void {
    this.setIgnoreFilePrefix(ignorePrefix);
    this.setIgnoreFilePrefix(ignorePrefix);
  }
  /**
   * エントリポイントから除外する接尾語を設定する
   * @param ignorePrefix
   * @returns
   */
  public setIgnoreSuffix(ignoreSuffix: string): void {
    this.setIgnoreFileSuffix(ignoreSuffix);
    this.setIgnoreDirSuffix(ignoreSuffix);
  }
  /**
   * エントリポイントから除外するファイル名の接尾語を設定する
   * @param ignorePrefix
   * @returns
   */
  public setIgnoreFilePrefix(ignorePrefix: string): void {
    this.ignoreFilePrefix = ignorePrefix;
  }
  /**
   * エントリポイントから除外するファイル名の接尾語を設定する
   * @param ignoreSuffix
   * @returns
   */
  public setIgnoreFileSuffix(ignoreSuffix: string): void {
    this.ignoreFileSuffix = ignoreSuffix;
  }
  /**
   * エントリポイントから除外するファイル名の接尾語を設定する
   * @param ignorePrefix
   * @returns
   */
  public setIgnoreDirPrefix(ignorePrefix: string): void {
    this.ignoreDirPrefix = ignorePrefix;
  }
  /**
   * エントリポイントから除外するディレクトリ名の接尾語を設定する
   * @param ignoreSuffix
   * @returns
   */
  public setIgnoreDirSuffix(ignoreSuffix: string): void {
    this.ignoreDirSuffix = ignoreSuffix;
  }
  /**
   * エントリポイントから除外するディレクトリ名を設定する
   * @param dirNames
   * @returns
   */
  public setIgnoreDirNames(dirNames: string[]): void {
    this.ignoreDirNames = dirNames;
  }
  /**
   * Globパターン文字列に変換する
   *
   * @param target
   * @returns
   */
  protected convertGlobPattern(target: string | string[]): string {
    let globPattern: string;
    if (typeof target === 'string') {
      globPattern = target;
    } else {
      if (target.length > 1) {
        globPattern = '{' + Array.from(new Set(target)).join(',') + '}';
      } else {
        globPattern = target[0];
      }
    }
    return globPattern;
  }

  /**
   * エントリポイントのGlobパターンを取得する
   * @returns
   */
  protected getEntryPointGlobPatetrn(): string {
    return this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(this.fileExts);
  }

  /**
   * エントリポイントからの除外ファイル判定処理
   * @param p
   * @returns
   */
  protected globIgnoredFunc(p: Path): boolean {
    const fileName = path.basename(p.name, path.extname(p.name));
    const prefixCheck = this.ignoreFilePrefix ? RegExp('^' + this.ignoreFilePrefix).test(fileName) : false;
    const suffixCheck = this.ignoreFileSuffix ? RegExp(this.ignoreFileSuffix + '$').test(fileName) : false;
    return prefixCheck || suffixCheck;
  }

  /**
   * エントリポイントからの除外ディレクトリ判定処理
   * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
   * @param p
   * @returns
   */
  protected globChildrenIgnoredFunc(p: Path): boolean {
    const dirName = p.name;
    const prefixCheck = this.ignoreDirPrefix ? RegExp('^' + this.ignoreDirPrefix).test(dirName) : false;
    const suffixCheck = this.ignoreDirSuffix ? RegExp(this.ignoreDirSuffix + '$').test(dirName) : false;
    return prefixCheck || suffixCheck || this.ignoreDirNames.includes(dirName);
  }

  /**
   * エントリポイントの対象ファイル一覧を取得する
   * @returns
   */
  protected findEntryPointFiles(): string[] {
    const entryPointGlobPatetrn = this.getEntryPointGlobPatetrn();
    const globOption = {
      ignore: {
        ignored: this.globIgnoredFunc.bind(this),
        childrenIgnored: this.globChildrenIgnoredFunc.bind(this),
      },
    };
    const entryPointFiles: string[] = glob.sync(entryPointGlobPatetrn, globOption);
    return entryPointFiles;
  }

  /**
   * エントリポイントファイルの一覧をエントリポイントに変換する
   *
   * @param entryPointFiles
   * @returns
   */
  protected convertEntryPoint(entryPointFiles: string[]): Map<string, string> {
    const entries: Map<string, string> = new Map();
    entryPointFiles.forEach((file: string) => {
      const targetFile = path.relative(this.srcDir, file);
      const key: string = path.join(path.dirname(targetFile), path.basename(targetFile, path.extname(targetFile)));
      entries.set(key, file);
    });
    return entries;
  }

  /**
   * エントリーポイント
   */
  protected entryPoint: Map<string, string> = new Map();

  /**
   * エントリーポイントを取得する
   *
   * @param srcDir
   * @param outputDir
   * @param fileExts
   * @param option
   */
  protected getEntryPoint(): Map<string, string> {
    const entryPointFiles = this.findEntryPointFiles();
    this.entryPoint = this.convertEntryPoint(entryPointFiles);
    return this.entryPoint;
  }
  /**
   * ソースコードのパスを出力先のパスに変換する
   *
   * @param srcPath
   * @param isDir
   * @returns
   */
  protected convertOutputPath(srcPath: string, isDir: boolean = false) {
    let outputName = path.basename(srcPath);
    if (!isDir && /\.[a-zA-Z0-9]{1,4}$/.test(srcPath)) {
      outputName = path.basename(srcPath, path.extname(srcPath)) + '.' + this.outputExt;
    }
    const outputDir = path.dirname(path.relative(this.srcDir, srcPath));
    const outputPath = path.join(this.outputDir, outputDir, outputName);
    return outputPath;
  }

  /**
   * 監視対象ファイルのパターンを取得する
   * @returns
   */
  protected getWatchFilePattern(): string | string[] {
    const watchFileExts = Array.from(new Set([...this.fileExts, ...this.moduleExts]));
    const watchFilePattern = this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(watchFileExts);
    return watchFilePattern;
  }

  /**
   * 監視時のオプションを取得する
   * @returns
   */
  protected getWatchOpton(): any {
    return {
      ignoreInitial: true,
    };
  }

  /**
   * ファイルの監視オブジェクト
   */
  protected watcher: chokidar.FSWatcher | null = null;

  /**
   * ファイルの監視とビルド
   */
  public watch() {
    console.group('Watch files:');
    this.getEntryPoint();
    const watchFilePattern = this.getWatchFilePattern.bind(this)();
    console.log(watchFilePattern);
    this.watcher = chokidar.watch(watchFilePattern, this.getWatchOpton.bind(this)());
    this.watcher
      .on('add', this.watchAddCallBack.bind(this))
      .on('change', this.watchChangeCallBack.bind(this))
      .on('unlink', this.watchUnlinkCallBack.bind(this))
      .on('addDir', this.watchAddDirCallBack.bind(this))
      .on('unlinkDir', this.watchUnlinkDirCallBack.bind(this))
      .on('error', (error) => {
        console.error('Watcher error: ' + error);
      });
    console.groupEnd();
  }
  /**
   * ファイル追加時のコールバック処理
   * @param filePath
   */
  protected watchAddCallBack(filePath: string) {
    console.group('Add file: ' + filePath);
    try {
      //エントリポイントを更新する
      this.getEntryPoint();
      if (Array.from(this.entryPoint.values()).includes(filePath)) {
        const outputPath = this.convertOutputPath(filePath);
        this.buildFile(filePath, outputPath);
      } else {
        this.buildAll();
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    console.groupEnd();
  }
  /**
   * ファイル更新時のコールバック処理
   * @param filePath
   */
  protected watchChangeCallBack(filePath: string) {
    console.group('Update file: ' + filePath);
    try {
      if (Array.from(this.entryPoint.values()).includes(filePath)) {
        const outputPath = this.convertOutputPath(filePath);
        this.buildFile(filePath, outputPath);
        console.log('Compile: ' + filePath + ' => ' + outputPath);
      } else {
        this.buildAll();
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    console.groupEnd();
  }
  /**
   * ファイル削除時のコールバック処理
   * @param filePath
   */
  protected watchUnlinkCallBack(filePath: string) {
    console.group('Remove file: ' + filePath);
    if (Array.from(this.entryPoint.values()).includes(filePath)) {
      const outputPath = this.convertOutputPath(filePath);
      if (fs.existsSync(outputPath)) {
        rimraf(outputPath);
        console.log('Remove: ' + outputPath);
      }
      //エントリポイントから該当ファイルのエントリを削除する
      const entries = this.entryPoint.entries();
      for (const entry of entries) {
        this.entryPoint.delete(entry[0]);
      }
      this.entryPoint.delete(filePath);
    }
    console.groupEnd();
  }
  /**
   * ディレクトリ追加時のコールバック処理
   * @param filePath
   */
  protected watchAddDirCallBack(filePath: string) {
    console.group('Add directory: ' + filePath);
    const outputPath = this.convertOutputPath(filePath, true);
    console.groupEnd();
  }
  /**
   * ディレクトリ削除時のコールバック処理
   *
   * @param filePath
   */
  protected watchUnlinkDirCallBack(filePath: string) {
    console.group('Remove directory: ' + filePath);
    const outputPath = this.convertOutputPath(filePath, true);
    if (fs.existsSync(outputPath)) {
      rimraf(outputPath);
      console.log('Remove: ' + outputPath);
    }
    //エントリポイントから該当ディレクトリのエントリを削除する
    const entries = this.entryPoint.entries();
    for (const entry of entries) {
      if (entry[1].startsWith(filePath)) {
        this.entryPoint.delete(entry[0]);
      }
    }
    console.groupEnd();
  }

  /**
   * コンパイルオプションを取得する
   * @returns
   */
  protected getCompileOption(): any {
    return this.compileOption;
  }
  /**
   * 整形オプションを取得する
   * @param targetFile
   * @returns
   */
  protected getBeautifyOption(targetFile: string) {
    const eConfigs = editorconfig.parseSync(targetFile);
    let beautifyOption: any = {};
    if (eConfigs.indent_style === 'tab') {
      beautifyOption.indent_with_tabs = true;
    } else if (eConfigs.indent_style === 'space') {
      beautifyOption.indent_with_tabs = false;
    }

    if (eConfigs.indent_size) {
      beautifyOption.indent_size = eConfigs.indent_size;
    }

    if (eConfigs.max_line_length) {
      if (eConfigs.max_line_length === 'off') {
        beautifyOption.wrap_line_length = 0;
      } else {
        // @ts-ignore
        beautifyOption.wrap_line_length = parseInt(eConfigs.max_line_length, 10);
      }
    }

    if (eConfigs.insert_final_newline === true) {
      beautifyOption.end_with_newline = true;
    } else if (eConfigs.insert_final_newline === false) {
      beautifyOption.end_with_newline = false;
    }

    if (eConfigs.end_of_line) {
      // @ts-ignore
      if (eConfigs.end_of_line === 'cr') {
        beautifyOption.eol = '\r';
      } else if (eConfigs.end_of_line === 'lf') {
        beautifyOption.eol = '\n';
      } else if (eConfigs.end_of_line === 'crlf') {
        beautifyOption.eol = '\r\n';
      }
    }
    return Object.assign(beautifyOption, this.beautifyOption);
  }

  /**
   * ビルド処理
   */
  public build(cleanup?: boolean): void {
    if (cleanup) {
      rimrafSync(this.outputDir, {
        preserveRoot: true,
      });
    }
    this.buildAll();
  }

  public abstract buildFile(srcPath: string, outputPath: string): void;
  public abstract buildAll(): void;
}
