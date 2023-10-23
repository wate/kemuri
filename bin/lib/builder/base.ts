import * as path from 'node:path';
import { glob, Path } from 'glob';
import * as chokidar from 'chokidar';
import { rimraf, rimrafSync } from 'rimraf';
import editorconfig from 'editorconfig';

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
  srcDir?: string | string[];
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
  protected srcDir: string | string[] = 'src';
  /**
   * 出力先ディレクトリ
   */
  protected outputDir: string = 'public';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = ['txt'];

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
  protected outpuExt: string = 'txt';

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
      this.setIgnoreFilePrefix(option.fileSuffix);
    }
    if (option.dirPrefix !== undefined && option.dirPrefix) {
      this.setIgnoreDirSuffix(option.dirPrefix);
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
   * エントリポイントのGlobパターンを取得する
   * @returns
   */
  protected getEntryPointGlobPatetrn(): string | string[] {
    return this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(this.fileExts);
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
   * エントリポイントのベースディレクトリを取得する
   */
  protected getEntryPointBaseDir(): string | null {
    let baseDir: string | null = typeof this.srcDir === 'string' ? this.srcDir : null;
    if (Array.isArray(this.srcDir) && this.srcDir.length === 1) {
      baseDir = this.srcDir[0];
    }
    return baseDir;
  }

  /**
   * エントリポイントファイルの一覧をエントリポイントに変換する
   *
   * @param entryPointFiles
   * @returns
   */
  protected convertEntryPoint(entryPointFiles: string[]): Map<string, string> {
    const entries: Map<string, string> = new Map();
    const baseDir = this.getEntryPointBaseDir();
    entryPointFiles.forEach((file: string) => {
      const targetFile = baseDir ? path.relative(baseDir, file) : file;
      const key: string = path.join(path.dirname(targetFile), path.basename(targetFile, path.extname(targetFile)));
      entries.set(key, file);
    });
    return entries;
  }

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
    return this.convertEntryPoint(entryPointFiles);
  }
  /**
   * ソースコードのパスを出力先のパスに変換する
   *
   * @param srcPath
   * @returns
   */
  protected convertOutputPath(srcPath: string) {
    let outputName = path.basename(srcPath);
    if (/\.[a-zA-Z0-9]{1,4}$/.test(srcPath)) {
      outputName = path.basename(srcPath, path.extname(srcPath)) + '.' + this.outpuExt;
    }
    const baseDir = this.getEntryPointBaseDir();
    const outputDir = path.dirname(baseDir ? path.relative(baseDir, srcPath) : srcPath);
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
   * ファイルの監視とビルド
   */
  public watch() {
    this.buildAll();
    let entryPoint = this.getEntryPoint();
    const watchFilePattern = this.getWatchFilePattern();
    chokidar
      .watch(watchFilePattern, {
        ignoreInitial: true,
      })
      .on('add', (filePath) => {
        try {
          //エントリポイントを更新
          entryPoint = this.getEntryPoint();
          if (Array.from(entryPoint.values()).includes(filePath)) {
            const outputPath = this.convertOutputPath(filePath);
            this.buildFile(filePath, outputPath);
          } else {
            this.buildAll();
            console.log('Compile All');
          }
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      })
      .on('change', (filePath) => {
        try {
          if (Array.from(entryPoint.values()).includes(filePath)) {
            const outputPath = this.convertOutputPath(filePath);
            this.buildFile(filePath, outputPath);
            console.log('Compile: ' + filePath + ' => ' + outputPath);
          } else {
            this.buildAll();
            console.log('Compile All');
          }
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      })
      .on('unlink', (filePath) => {
        const outputPath = this.convertOutputPath(filePath);
        rimraf(outputPath);
        console.log('Remove: ' + outputPath);
      })
      .on('unlinkDir', (dirPath) => {
        const outputPath = this.convertOutputPath(dirPath);
        rimraf(outputPath);
        console.log('Remove: ' + outputPath);
      })
      .on('error', (error) => console.log('Watcher error: ' + error));
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
  protected getBeautifyOption(targetFile) {
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
        beautifyOption.wrap_line_length = parseInt(eConfigs.max_line_length, 10);
      }
    }

    if (eConfigs.insert_final_newline === true) {
      beautifyOption.end_with_newline = true;
    } else if (eConfigs.insert_final_newline === false) {
      beautifyOption.end_with_newline = false;
    }

    if (eConfigs.end_of_line) {
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

  abstract buildFile(srcPath: string, outputPath: string): void;
  abstract buildAll(): void;
}
