import * as fs from 'node:fs';
import * as path from 'node:path';
import { baseBuilder, builderOption } from '../base';
import * as sass from 'sass';
import js_beautify from 'js-beautify';

/**
 * CSSビルドの設定オプション
 */
export interface sassBuilderOption extends builderOption {
  style?: 'expanded' | 'compressed';
  sourcemap?: boolean;
  generateIndexFile?: boolean;
  indexFileName?: string;
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
  protected ignoreDirNames = ['node_modules'];

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
   * インデックスファイルの名前
   */
  private indexFileName: string = '_index.scss';

  /**
   * インデックスファイルの自動生成の可否
   */
  private generateIndexFile: boolean = false;

  /**
   * コンストラクタ
   * @param option
   */
  constructor(option?: sassBuilderOption) {
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
   * インデックスファイル名の名前を設定する
   *
   * @param indexFileName
   */
  public setIndexFileName(indexFileName: string): void {
    this.indexFileName = indexFileName;
  }
  /**
   * インデックスファイル名の名前を設定する
   *
   * @param generateIndexFile
   */
  public setGenerateIndexFile(generateIndexFile: boolean): void {
    this.generateIndexFile = generateIndexFile;
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
    if (option.sourcemap !== undefined) {
      this.setSourceMap(option.sourcemap);
    }
    if (option.indexFileName !== undefined) {
      this.setIndexFileName(option.indexFileName);
    }
    if (option.generateIndexFile !== undefined) {
      this.setGenerateIndexFile(option.generateIndexFile);
    }
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
    return compileOption;
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
    const entries = this.getEntryPoint();
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
  }
}
