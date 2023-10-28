import * as fs from 'node:fs';
import * as path from 'node:path';
import { baseBuilder, builderOption } from '../base';
import { glob, Path } from 'glob';
import * as sass from 'sass';
import { rimraf } from 'rimraf';
import js_beautify from 'js-beautify';
import '../../console';

/**
 * CSSビルドの設定オプション
 */
export interface sassBuilderOption extends builderOption {
  style?: 'expanded' | 'compressed';
  sourcemap?: boolean;
  generateIndex?: boolean;
  indexFileName?: string;
  indexImportType?: 'use' | 'forward';
  loadPaths?: string[];
}

/**
 * ビルド処理の抽象クラス
 */
export class sassBuilder extends baseBuilder {
  /**
   * 出力先ディレクトリ
   */
  protected outputDir: string = 'public/assets/css';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = ['scss', 'sass', 'css'];

  /**
   * エントリポイントから除外するファイル名の接頭語
   */
  protected ignoreFilePrefix = '_';

  /**
   * エントリポイントから除外するディレクトリ名
   * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
   */
  protected ignoreDirNames = [];

  /**
   * 出力時の拡張子
   */
  protected outpuExt = 'css';

  /**
   * コンパイラーのオプション
   */
  protected compilerOption: any = {};

  /**
   * 出力スタイルの設定
   */
  private style?: 'expanded' | 'compressed';

  /**
   * SourceMapファイル出力の可否
   */
  private sourcemap?: boolean;

  /**
   * SassのloadPathsオプション
   */
  private loadPaths?: string[];

  /**
   * インデックスファイルの自動生成の可否
   */
  private generateIndex: boolean = false;

  /**
   * インデックスファイルの名前
   */
  private indexFileName: string = '_all.scss';

  /**
   * インデックスファイルにインポートする際の方法
   */
  private indexImportType: 'forward' | 'use' = 'forward';

  /**
   * コンストラクタ
   * @param option
   */
  constructor(option?: sassBuilderOption) {
    super(option);
  }

  /**
   * -------------------------
   * このクラス固有のメソッド
   * -------------------------
   */

  /**
   * 出力スタイルの設定
   *
   * @param style
   */
  public setStyle(style: 'expanded' | 'compressed'): void {
    this.style = style;
  }
  /**
   * SourceMapファイル出力の可否
   *
   * @param sourcemap
   */
  public setSourceMap(sourcemap: boolean): void {
    this.sourcemap = sourcemap;
  }
  /**
   * SassのloadPathsオプションを設定する
   *
   * @param loadPaths
   */
  public setLoadPaths(loadPaths: string[]): void {
    this.loadPaths = loadPaths;
  }
  /**
   * インデックスファイルの自動生成の可否を設定する
   *
   * @param generateIndex
   */
  public setGenerateIndex(generateIndex: boolean): void {
    this.generateIndex = generateIndex;
  }

  /**
   * インデックスファイルの名前を設定する
   *
   * @param indexFileName
   */
  public setIndexFileName(indexFileName: string): void {
    this.indexFileName = indexFileName;
  }
  /**
   * インデックスファイルのインポート形式を設定する
   *
   * @param importType
   */
  public setIndexImportType(importType: 'forward' | 'use'): void {
    this.indexImportType = importType;
  }

  /**
   * インデックスファイルの生成処理
   *
   * @param filePath
   */
  protected generateIndexFile(targetDir: string, recursive: boolean = true) {
    if (!this.generateIndex) {
      return;
    }
    const indexMatchPatterns = ['./_*.' + this.convertGlobPattern(this.fileExts), './*/' + this.indexFileName];
    const partialMatchFiles = glob
      .sync(indexMatchPatterns, {
        cwd: targetDir,
      })
      .filter((partialFile) => {
        // 同一階層のインデックスファイルは除外
        return partialFile !== this.indexFileName;
      })
      .sort();
    const indexFilePath = path.join(targetDir, this.indexFileName);
    if (partialMatchFiles.length === 0) {
      rimraf(indexFilePath);
      console.log('Remove index file: ' + indexFilePath);
    } else {
      const partialFiles = {
        children: [],
        files: [],
      };
      partialMatchFiles.forEach((partialFile) => {
        if (partialFile.includes(path.sep)) {
          //@ts-ignore
          partialFiles.children.push(partialFile);
        } else {
          //@ts-ignore
          partialFiles.files.push(partialFile);
        }
      });
      let indexFileContentLines: string[] = [
        '// ===============================',
        '// Auto generated by sassBuilder',
        '// Do not edit this file!',
        '// ===============================',
      ];
      if (partialFiles.children.length > 0) {
        indexFileContentLines = indexFileContentLines.concat(
          partialFiles.children.map((file) => {
            return `@${this.indexImportType} '${file}';`;
          }),
        );
      }
      if (partialFiles.files.length > 0) {
        indexFileContentLines = indexFileContentLines.concat(
          partialFiles.files.map((file) => {
            return `@${this.indexImportType} '${file}';`;
          }),
        );
      }
      const indexFileContent = indexFileContentLines.join('\n') + '\n';
      if (fs.existsSync(indexFilePath)) {
        const indexFileContentBefore = fs.readFileSync(indexFilePath, 'utf-8');
        if (indexFileContentBefore != indexFileContent) {
          fs.writeFileSync(indexFilePath, indexFileContent);
          console.log('Update index file: ' + indexFilePath);
        }
      } else {
        fs.writeFileSync(indexFilePath, indexFileContent);
        console.log('Generate index file: ' + indexFilePath);
      }
    }
    if (recursive && path.dirname(targetDir).startsWith(this.srcDir)) {
      this.generateIndexFile(path.dirname(targetDir));
    }
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
  public setOption(option: sassBuilderOption) {
    super.setOption(option);
    if (option.style !== undefined && option.style) {
      this.setStyle(option.style);
    }
    if (option.sourcemap !== undefined && option.sourcemap !== null) {
      this.setSourceMap(option.sourcemap);
    }
    if (option.generateIndex !== undefined && option.generateIndex !== null) {
      this.setGenerateIndex(option.generateIndex);
    }
    if (option.indexFileName !== undefined) {
      this.setIndexFileName(option.indexFileName);
    }
    let sassLoadPaths = [this.srcDir, 'node_modules'];
    if (option.loadPaths !== undefined) {
      sassLoadPaths = option.loadPaths;
    }
    this.setLoadPaths(sassLoadPaths);
  }

  /**
   * コンパイルオプションを取得する
   * @returns
   */
  protected getCompileOption(): any {
    let compileOption = this.compileOption;
    if (this.style !== undefined) {
      compileOption = Object.assign(compileOption, { style: this.style });
    }
    if (this.sourcemap !== undefined) {
      compileOption = Object.assign(compileOption, { sourceMap: this.sourcemap });
    }
    if (this.loadPaths && this.loadPaths.length > 0) {
      compileOption = Object.assign(compileOption, { loadPaths: this.loadPaths });
    }
    return compileOption;
  }

  /**
   * ファイル追加時のコールバック処理
   * @param filePath
   */
  protected watchAddCallBack(filePath: string) {
    if (this.generateIndex && path.basename(filePath) === this.indexFileName) {
      return;
    }
    console.group('Add file: ' + filePath);
    if (this.generateIndex) {
      // インデックスファイルの生成/更新
      this.generateIndexFile.bind(this)(path.dirname(filePath));
    }
    try {
      //エントリポイントを更新
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
   * @returns
   */
  protected watchChangeCallBack(filePath: string) {
    if (this.generateIndex && path.basename(filePath) === this.indexFileName) {
      return;
    }
    console.group('Update file: ' + filePath);
    if (this.generateIndex) {
      // インデックスファイルの更新
      this.generateIndexFile.bind(this)(path.dirname(filePath));
    }
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
   * @returns
   */
  protected watchUnlinkCallBack(filePath: string) {
    if (this.generateIndex && path.basename(filePath) === this.indexFileName) {
      return;
    }
    console.group('Remove file: ' + filePath);
    if (this.generateIndex) {
      // インデックスファイルの更新
      this.generateIndexFile.bind(this)(path.dirname(filePath));
    }
    if (Array.from(this.entryPoint.values()).includes(filePath)) {
      this.entryPoint.delete(filePath);
      const outputPath = this.convertOutputPath(filePath);
      rimraf(outputPath);
      console.log('Remove: ' + outputPath);
    }
    console.groupEnd();
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
    const compileOption = this.getCompileOption();
    const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
    const result = sass.compile(srcPath, compileOption);
    if (compileOption.style !== 'compressed') {
      result.css = js_beautify.css(result.css, beautifyOption);
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, result.css.trim() + '\n');
    if (result.sourceMap) {
      fs.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
    }
  }

  /**
   * 全ファイルのビルド処理
   */
  public async buildAll() {
    // console.group('Build entory point files');
    const entries = this.getEntryPoint();
    if (this.generateIndex) {
      //インデックスファイルの生成/更新
      const partialFilePattern = path.join(this.srcDir, '**/_*.' + this.convertGlobPattern(this.fileExts));
      const partialFiles = glob.sync(partialFilePattern);
      if (partialFiles.length > 0) {
        partialFiles
          .map((partialFile: string) => {
            return path.dirname(partialFile);
          })
          .reduce((unique: string[], item: string) => {
            return unique.includes(item) ? unique : [...unique, item];
          }, [])
          .forEach((generateIndexDir: string) => {
            this.generateIndexFile.bind(this)(generateIndexDir, false);
          });
      }
    }
    if (entries.size > 0) {
      const compileOption = this.getCompileOption();
      const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
      entries.forEach((srcFile, entryPoint) => {
        const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outpuExt);
        const result = sass.compile(srcFile, compileOption);
        if (compileOption.style !== 'compressed') {
          result.css = js_beautify.css(result.css, beautifyOption);
        }
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, result.css.trim() + '\n');
        console.log('Compile: ' + srcFile + ' => ' + outputPath);
        if (result.sourceMap) {
          fs.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
        }
      });
    }
    // console.groupEnd();
  }
}
