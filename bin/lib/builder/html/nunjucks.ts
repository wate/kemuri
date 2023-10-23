import * as fs from 'node:fs';
import * as path from 'node:path';
import { baseBuilder, builderOption } from '../base';
import { glob } from 'glob';
import yaml from 'js-yaml';
import js_beautify from 'js-beautify';
import nunjucks from 'nunjucks';
import * as chokidar from 'chokidar';
import { rimraf } from 'rimraf';

/**
 * HTMLビルドの設定オプション
 */
export interface nunjucksBuilderOption extends builderOption {
  varFileName?: string;
}

/**
 * ビルド処理の抽象クラス
 */
export class nunjucksBuilder extends baseBuilder {
  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = ['njk', 'twig'];

  /**
   * 出力時の拡張子
   */
  protected outpuExt: string = 'html';

  /**
   * 変数ファイルの名前
   */
  protected varFileName: string = 'vars.yml';

  /**
   * テンプレート変数格納用メンバ変数
   */
  protected templateVars: any = {};

  /**
   * コンストラクタ
   * @param option
   */
  public constructor(option?: nunjucksBuilderOption) {
    super();
    if (option) {
      this.setOption(option);
    }
  }
  /**
   * -------------------------
   * このクラス固有のメソッド
   * -------------------------
   */

  /**
   * 変数ファイル名を設定する
   *
   * @param varFileName
   */
  public setVarFileName(varFileName: string): this {
    this.varFileName = varFileName;
    return this;
  }

  /**
   * テンプレート変数をロードする
   */
  protected loadTemplateVars() {
    const globPatterns = [this.varFileName, this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName];
    const varFiles = glob.sync(globPatterns);
    varFiles.forEach((varFilePath: string) => {
      const key = path.dirname(varFilePath);
      // @ts-ignore
      this.templateVars[key] = yaml.load(fs.readFileSync(varFilePath));
    });
  }
  /**
   * テンプレートに対応する変数を取得する
   * @param srcFile
   * @returns
   */
  protected getTemplateVars(srcFile: string): object {
    let templateVars = this.templateVars['.'] ?? {};
    let key: string = '';
    const srcFilePaths = path.dirname(srcFile).split(path.sep);
    srcFilePaths.forEach((dirName) => {
      key = path.join(key, dirName);
      if (this.templateVars[key]) {
        templateVars = Object.assign(templateVars, this.templateVars[key]);
      }
    });
    return templateVars;
  }

  /**
   * ルートディレクトリの変数ファイルかどうかを判定する
   *
   * @param filePath
   * @returns
   */
  protected isRootVarFile(varFilePath: string): boolean {
    const baseDir = this.getEntryPointBaseDir();
    const checkFileName = path.basename(varFilePath);
    const isProjectRootVarFile: boolean = varFilePath === this.varFileName;
    const isSrcRootVarFile = baseDir ? path.join(baseDir, this.varFileName) === varFilePath : false;
    return isProjectRootVarFile || isSrcRootVarFile;
  }
  /**
   * -------------------------
   * 既存メソッドのオーバーライド
   * -------------------------
   */
  /**
   * ビルドオプションを設定する
   *
   * @param option
   * @returns
   */
  public setOption(option: nunjucksBuilderOption): this {
    super.setOption(option);
    if (option.varFileName !== undefined && option.varFileName) {
      this.setVarFileName(option.varFileName);
    }
    return this;
  }
  /**
   * 監視対象ファイルのパターンを取得する
   * @returns
   */
  protected getWatchFilePattern(): string | string[] {
    const watchFileExts = Array.from(new Set([...this.fileExts, ...this.moduleExts]));
    const watchFilePattern = [
      this.varFileName,
      this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(watchFileExts),
      this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName,
    ];
    return watchFilePattern;
  }
  /**
   * ファイルの監視及びビルド処理
   */
  public watch() {
    let entryPoint = this.getEntryPoint();
    const watchFilePattern = this.getWatchFilePattern();
    chokidar
      .watch(watchFilePattern, {
        ignoreInitial: true,
      })
      .on('add', (filePath) => {
        try {
          const addFileName = path.basename(filePath);
          if (addFileName !== this.varFileName) {
            //エントリポイントを更新
            entryPoint = this.getEntryPoint();
            if (Array.from(entryPoint.values()).includes(filePath)) {
              const outputPath = this.convertOutputPath(filePath);
              this.buildFile(filePath, outputPath);
              console.log('Compile: ' + filePath + ' => ' + outputPath);
            } else {
              this.buildAll();
              console.log('Compile All');
            }
          } else {
            const isRootVarFile = this.isRootVarFile(filePath);
            if (isRootVarFile) {
              //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
              this.buildAll();
              console.log('Compile All');
            } else {
              //指定階層以下の変数ファイルが更新された場合は、その階層以下のファイルのみビルド
              entryPoint.forEach((srcFile) => {
                if (srcFile.startsWith(path.dirname(filePath) + path.sep)) {
                  const outputPath = this.convertOutputPath(srcFile);
                  this.buildFile(srcFile, outputPath);
                  console.log('Compile: ' + srcFile + ' => ' + outputPath);
                }
              });
            }
          }
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      })
      .on('change', (filePath) => {
        try {
          const changeFileName = path.basename(filePath);
          if (changeFileName !== this.varFileName) {
            if (Array.from(entryPoint.values()).includes(filePath)) {
              const outputPath = this.convertOutputPath(filePath);
              this.buildFile(filePath, outputPath);
              console.log('Compile: ' + filePath + ' => ' + outputPath);
            } else {
              this.buildAll();
              console.log('Compile All');
            }
          } else {
            const isRootVarFile = this.isRootVarFile(filePath);
            if (isRootVarFile) {
              //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
              this.buildAll();
              console.log('Compile All');
            } else {
              //指定階層以下の変数ファイルが更新された場合は、その階層以下のファイルのみビルド
              entryPoint.forEach((srcFile) => {
                if (srcFile.startsWith(path.dirname(filePath) + path.sep)) {
                  const outputPath = this.convertOutputPath(srcFile);
                  this.buildFile(srcFile, outputPath);
                  console.log('Compile: ' + srcFile + ' => ' + outputPath);
                }
              });
            }
          }
        } catch (error) {
          console.error(error);
          process.exit(1);
        }
      })
      .on('unlink', (filePath) => {
        if (path.basename(filePath) !== this.varFileName) {
          const outputPath = this.convertOutputPath(filePath);
          rimraf(outputPath);
          console.log('Remove: ' + outputPath);
        }
      })
      .on('unlinkDir', (dirPath) => {
        const outputPath = this.convertOutputPath(dirPath);
        rimraf(outputPath);
        console.log('Remove: ' + outputPath);
      })
      .on('error', (error) => console.log('Watcher error: ' + error));
  }
  /**
   * -------------------------
   * 抽象化メソッドの実装
   * -------------------------
   */

  /**
   * 単一ファイルのビルド処理
   * @param srcPath
   * @param outputPath
   */
  public async buildFile(srcPath: string, outputPath: string) {
    nunjucks.configure(this.srcDir, this.compileOption);
    const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
    this.loadTemplateVars();
    let templatePath: string = srcPath;
    let html: string;
    const baseDir = this.getEntryPointBaseDir();
    if (baseDir) {
      templatePath = path.relative(baseDir, templatePath);
    }
    const templateVars = this.getTemplateVars(srcPath);
    nunjucks.render(templatePath, templateVars, (error) => {
      if (error) {
        console.error(error.name + ' : ' + error.message);
        throw error;
      }
    });
  }

  /**
   * 全ファイルのビルド処理
   */
  public async buildAll() {
    const entries = this.getEntryPoint();
    if (entries.size > 0) {
      const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
      this.loadTemplateVars();
      nunjucks.configure(this.srcDir, this.compileOption);
      const baseDir = this.getEntryPointBaseDir();
      entries.forEach((srcFile, entryPoint) => {
        let templatePath:string  = srcFile;
        const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outpuExt);
        if (baseDir) {
          templatePath = path.relative(baseDir, templatePath);
        }
        const templateVars = this.getTemplateVars(srcFile);
        let html = nunjucks.render(templatePath, templateVars);
        //@ts-ignore
        html = js_beautify.html(html, beautifyOption);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
        console.log('Compile: ' + srcFile + ' => ' + outputPath);
      });
    }
  }
}
