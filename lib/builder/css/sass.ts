import * as path from 'node:path';
import fs from 'fs-extra';
import * as glob from 'glob';
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import js_beautify from 'js-beautify';
import console from '../../console';
import _ from 'lodash';
import { baseBuilder, builderOption, ignoreOption } from '../base';
import micromatch from 'micromatch';

const beautify = js_beautify.css;

type sassBuilderIndexImportTypeOption = 'use' | 'forward';
type generateIndexIgnore = Omit<ignoreOption, 'prefix' | 'suffix'>
/**
 * CSSビルドの設定オプション
 */
export interface sassBuilderOption extends builderOption {
  style?: sass.OutputStyle;
  sourcemap?: boolean;
  generateIndex?: boolean;
  indexFileName?: string;
  indexImportType?: sassBuilderIndexImportTypeOption;
  generateIndexIgnore?: generateIndexIgnore;
  loadPaths?: string[];
}

/**
 * ビルド処理の抽象クラス
 */
export class sassBuilder extends baseBuilder {
  /**
   * 出力先ディレクトリ
   */
  protected outputDir = 'public/assets/css';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts = ['scss', 'sass', 'css'];

  /**
   * エントリポイントから除外するファイル名の接頭語
   */
  protected ignoreFilePrefix = '_';

  /**
   * 出力時の拡張子
   */
  protected outputExt = 'css';

  /**
   * -------------------------
   * このクラス固有のメンバ変数/メソッド
   * -------------------------
   */

  /**
   * 出力スタイルの設定
   */
  private style: sass.OutputStyle = 'expanded';

  /**
   * SourceMapファイル出力の可否
   */
  private sourcemap: boolean | null = null;

  /**
   * SassのloadPathsオプション
   */
  private loadPaths: string[] = [];

  /**
   * インデックスファイルの自動生成の可否
   */
  private generateIndex = false;

  /**
   * インデックスファイルの名前
   */
  private indexFileName = '_index.scss';

  /**
   * インデックスファイルにインポートする際の方法
   */
  private indexImportType: sassBuilderIndexImportTypeOption = 'forward';

  /**
   * インデックスファイルの自動生成を行う際の除外設定
   */
  private generateIndexIgnore: generateIndexIgnore = {};

  /**
   * 出力スタイルの設定
   *
   * @param style
   */
  public setStyle(style: sass.OutputStyle): void {
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
  public setIndexImportType(
    importType: sassBuilderIndexImportTypeOption,
  ): void {
    this.indexImportType = importType;
  }

  /**
   * インデックスファイル自動生成時に除外するファイル/ディレクトリ名の設定
   *
   * @param generateIndexIgnore
   */
  public setGenerateIndexIgnore(generateIndexIgnore: generateIndexIgnore): void {
    this.generateIndexIgnore = generateIndexIgnore;
  }

  /**
   * インデックスファイルの生成処理
   *
   * @param filePath
   */
  protected generateIndexFile(targetDir: string, recursive = true) {
    if (!this.generateIndex) {
      return;
    }
    const fileExtPattern = this.convertGlobPattern(this.fileExts);
    const ignorePatterns: string[] = [];
    /**
     * インデックスファイル生成から除外するパターンを生成
     */
    if (this.generateIndexIgnore.filePrefix) {
      ignorePatterns.push('**/' + this.generateIndexIgnore.filePrefix + '*.' + fileExtPattern);
    }
    if (this.generateIndexIgnore.fileSuffix) {
      ignorePatterns.push('**/*' + this.generateIndexIgnore.fileSuffix + '.' + fileExtPattern);
    }
    if (this.generateIndexIgnore.fileNames && this.generateIndexIgnore.fileNames.length > 0) {
      ignorePatterns.push('**/' + this.convertGlobPattern(this.generateIndexIgnore.fileNames) + '.' + fileExtPattern);
    }
    if (this.generateIndexIgnore.dirPrefix) {
      ignorePatterns.push('**/' + this.generateIndexIgnore.dirPrefix + '*/**');
    }
    if (this.generateIndexIgnore.dirSuffix) {
      ignorePatterns.push('**/*' + this.generateIndexIgnore.dirSuffix + '/**');
    }
    if (this.generateIndexIgnore.dirNames && this.generateIndexIgnore.dirNames.length > 0) {
      ignorePatterns.push('**/' + this.convertGlobPattern(this.generateIndexIgnore.dirNames) + '/**');
    }
    if (micromatch.isMatch(targetDir, ignorePatterns)) {
      // 除外パターンに一致するディレクトリは処理しない
      // console.debug('Ignore generate index file dir: ', targetDir);
      return;
    }

    const indexMatchPatterns = [
      './_*.' + fileExtPattern,
      './*/' + this.indexFileName,
    ];
    const partialMatchFiles = glob
      .sync(indexMatchPatterns, {
        cwd: targetDir,
      })
      .filter((partialFile) => {
        // カレントディレクトリのインデックスファイル、及び、除外パターンに一致するファイルを除外
        return partialFile !== this.indexFileName && !micromatch.isMatch(partialFile, ignorePatterns);
      })
      .sort();
    // console.debug('partialMatchFiles: ', partialMatchFiles);

    const indexFilePath = path.join(targetDir, this.indexFileName);
    if (partialMatchFiles.length === 0) {
      fs.remove(indexFilePath);
      console.log('Remove index file: ' + indexFilePath);
    } else {
      const partialFilesChildren: string[] = [];
      const partialFilesFiles: string[] = [];
      const partialFiles = {
        children: partialFilesChildren,
        files: partialFilesFiles,
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
        if (indexFileContentBefore !== indexFileContent) {
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
    /**
     * インデックスファイルの自動生成時の設定
     */
    if (this.generateIndex) {
      if (option.indexFileName !== undefined) {
        this.setIndexFileName(option.indexFileName);
      }
      if (option.indexImportType !== undefined) {
        this.setIndexImportType(option.indexImportType);
      }
      let generateIndexIgnore: generateIndexIgnore = {};
      if (option.generateIndexIgnore !== undefined) {
        generateIndexIgnore = option.generateIndexIgnore;
      } else {
        if (this.ignoreFilePrefix !== '_') {
          generateIndexIgnore.filePrefix = _.clone(this.ignoreFilePrefix);
        }
        if (this.ignoreFileSuffix) {
          generateIndexIgnore.fileSuffix = _.clone(this.ignoreFileSuffix);
        }
        if (_.isArray(this.ignoreFileNames)) {
          generateIndexIgnore.fileNames = _.clone(this.ignoreFileNames);
        }
        if (this.ignoreDirPrefix) {
          generateIndexIgnore.dirPrefix = _.clone(this.ignoreDirPrefix);
        }
        if (this.ignoreDirSuffix) {
          generateIndexIgnore.dirSuffix = _.clone(this.ignoreDirSuffix);
        }
        if (_.isArray(this.ignoreDirNames)) {
          generateIndexIgnore.dirNames = _.clone(this.ignoreDirNames);
        }
      }
      this.setGenerateIndexIgnore(generateIndexIgnore);
      const ignoreIndexFileName = path.basename(this.indexFileName, path.extname(this.indexFileName));
      if (_.isArray(this.ignoreFileNames) && !this.ignoreFileNames.includes(ignoreIndexFileName)) {
        this.ignoreFileNames.push(ignoreIndexFileName);
      }
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
      compileOption = Object.assign(compileOption, {
        sourceMap: this.sourcemap,
      });
    }
    if (this.loadPaths && this.loadPaths.length > 0) {
      compileOption = Object.assign(compileOption, {
        loadPaths: this.loadPaths,
      });
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
    if (this.generateIndex) {
      // インデックスファイルの生成/更新
      this.generateIndexFile.bind(this)(path.dirname(filePath));
    }
    super.watchAddCallBack(filePath);
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
    if (this.generateIndex) {
      // インデックスファイルの更新
      this.generateIndexFile.bind(this)(path.dirname(filePath));
    }
    super.watchChangeCallBack(filePath);
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
    if (this.generateIndex) {
      // インデックスファイルの更新
      this.generateIndexFile.bind(this)(path.dirname(filePath));
    }
    super.watchUnlinkCallBack(filePath);
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
    try {
      console.log('Compile: ' + srcPath + ' => ' + outputPath);
      const compileOption = this.getCompileOption();
      const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
      const result = sass.compile(srcPath, compileOption);
      postcss([autoprefixer])
        .process(result.css, { from: srcPath })
        .then((result) => {
          result.warnings().forEach((warn) => {
            console.warn(warn.toString());
          });
          let css = result.css.toString();
          if (compileOption.style !== 'compressed' && this.beautify) {
            css = beautify(css, beautifyOption);
          }
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, css.trim() + '\n');
        });
      if (result.sourceMap) {
        fs.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
      }
    } catch (error) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      const cssErrorStyleContent = error
        .toString()
        .replace(/\x1b\[3[0-9]m/g, ' ')
        .replace(/\x1b\[0m/g, '')
        .replace(/╷/g, '\\2577')
        .replace(/│/g, '\\2502')
        .replace(/╵/g, '\\2575')
        .replace(/\n/g, '\\A');
      const cssContent = `@charset "UTF-8";
body::before {
  font-family: "Source Code Pro", "SF Mono", Monaco, Inconsolata, "Fira Mono", "Droid Sans Mono", monospace, monospace;
  white-space: pre;
  display: block;
  padding: 1em;
  margin-bottom: 1em;
  border-bottom: 2px solid black;
  content: '${cssErrorStyleContent}';
}`;
      fs.writeFileSync(outputPath, cssContent + '\n');
      throw error;
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
      const fileExtPattern = this.convertGlobPattern(this.fileExts);
      const partialFilePattern = path.join(
        this.srcDir,
        '**/_*.' + fileExtPattern,
      );
      let partialFiles = glob.sync(partialFilePattern);
      let ignorePatterns: string[] = [];
      /**
       * インデックスファイル生成を除外するパターンを生成
       */
      if (this.generateIndexIgnore.dirPrefix) {
        ignorePatterns.push('**/' + this.generateIndexIgnore.dirPrefix + '*/**');
      }
      if (this.generateIndexIgnore.dirSuffix) {
        ignorePatterns.push('**/*' + this.generateIndexIgnore.dirSuffix + '/**');
      }
      if (this.generateIndexIgnore.dirNames && this.generateIndexIgnore.dirNames.length > 0) {
        ignorePatterns.push('**/' + this.convertGlobPattern(this.generateIndexIgnore.dirNames) + '/**');
      }
      if (partialFiles.length > 0) {
        partialFiles
          // パスの階層が深い順にソート
          .sort((a: string, b: string) => b.length - a.length)
          .filter((generateIndexDir: string) => {
            // 除外パターンにマッチしないものを返す
            return !micromatch.isMatch(generateIndexDir, ignorePatterns);
          })
          // ディレクトリ名のみに変換
          .map((partialFile: string) => {
            return path.dirname(partialFile);
          })
          // 重複を除外
          .reduce((unique: string[], item: string) => {
            if (!unique.includes(item)) {
              unique.push(item);
            }
            //最上位ディレクトリまでのパスを取得し重複を除外して追加
            while (item.startsWith(this.srcDir) && item !== this.srcDir) {
              item = path.dirname(item);
              if (!unique.includes(item)) {
                unique.push(item);
              }
            }
            return unique;
          }, [])
          // インデックスファイルの生成/更新
          .forEach((generateIndexDir: string) => {
            // console.debug('Generate index file dir: ', generateIndexDir);
            this.generateIndexFile.bind(this)(generateIndexDir, false);
          });
      }
    }
    if (entries.size === 0) {
      return;
    }
    const compileOption = this.getCompileOption();
    const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
    entries.forEach((srcFile, entryPoint) => {
      const outputPath = path.join(
        this.outputDir,
        entryPoint + '.' + this.outputExt,
      );
      const result = sass.compile(srcFile, compileOption);
      postcss([autoprefixer])
        .process(result.css, { from: srcFile })
        .then((result) => {
          result.warnings().forEach((warn) => {
            console.warn(warn.toString());
          });
          let css = result.css.toString();
          if (compileOption.style !== 'compressed' && this.beautify) {
            css = beautify(css, beautifyOption);
          }
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, css.trim() + '\n');
          console.log('Compile: ' + srcFile + ' => ' + outputPath);
        });
      if (result.sourceMap) {
        fs.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
      }
    });
  }
}
