#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sass = require('sass');
const chokidar = require('chokidar');
require('dotenv').config();

//Sassファイルのディレクトリ
let srcDir = 'scss';
//CSS出力先ディレクトリ
let destDir = 'css';
//マスターSassファイル名
const mainFileName = process.env.SCSS_MAIN_FILE || 'style.scss';

/**
 * ターゲットディレクトリの設定およびチェック
 */
if (process.env.SOURCE_SCSS_DIR) {
  const realPath = path.resolve(process.cwd(), process.env.SOURCE_SCSS_DIR);
  if (!realPath.startsWith(process.cwd())) {
    //作業ディレクトリ以下のディレクトリではなかった場合はエラー扱いで終了
    throw new Exception('Sassファイルのディレクトリ指定が不正です');
  }
  srcDir = realPath;
}
if (process.env.OUTPUT_CSS_DIR) {
  const realPath = path.resolve(process.cwd(), process.env.OUTPUT_CSS_DIR);
  if (!realPath.startsWith(process.cwd())) {
    //作業ディレクトリ以下のディレクトリではなかった場合はエラー扱いで終了
    throw new Exception('出力先ディレクトリ指定が不正です');
  }
  destDir = realPath;
}
//インデックスファイル名
const indexFileName = process.env.SCSS_INDEX_FILE_NAME || '_index.scss';
//抽出対象ファイルの拡張子
let fileExtensions = ['scss', 'sass'];
if (process.env.SCSS_FILE_EXTENSIONS) {
  fileExtensions = process.env.SCSS_FILE_EXTENSIONS.toLowerCase().split(',');
}
//ファイル名の抽出パターン(接頭語)
const includeFilePrefix = process.env.SCSS_INCLUDE_FILE_PREFIX || '_';
//ファイル名の除外パターン(接尾語)
const excludeFileSuffix = process.env.SCSS_EXCLUDE_FILE_SUFFIX || '-bk';
//インデックスファイル用コメントタグ
const indexCommentTag = process.env.SCSS_INDEX_COMMENT_TAG || '@package';
//インデックスファイルのコメント継承
// const inheritIndexComment = false;

class buildCSS {
  srcDir = 'scss';
  destDir = 'css';
  /**
   * インデックスファイル情報
   */
  indexFiles = [];
  /**
   * コンパイル対象のSassファイルの一覧
   */
  sassFiles = [];
  /**
   * 対象ファイルの拡張子
   */
  allowExts = ['scss', 'sass'];
  /**
   * 抽出ファイル名パターン
   */
  includeFilePattern = new RegExp('^_');
  /**
   * 除外ファイル名パターン
   */
  excludeFilePattern = new RegExp('-bk$');
  /**
   * インデックスファイル用コメントタグパターン文字列
   */
  indexCommentTagPatternString = '^\/\/\\s+@package\\s+(.+)';
  /**
   * インデックスファイル名
   */
  indexFileName = '_index.scss';
  /**
   * メインファイル名
   */
  mainFileName = 'style.scss';

  /**
   * コンストラクタ
   *
   * @param {String} srcDir
   * @param {String} destDir
   * @param {Object} buildOption
   */
  constructor(srcDir = null, destDir = null, buildOption = {}) {
    if (srcDir) {
      this.srcDir = srcDir;
    }
    if (destDir) {
      this.destDir = destDir;
    }
    if (buildOption.allowExts && buildOption.allowExts.length > 0) {
      this.allowExts = buildOption.allowExts.map((ext) => ext.toLowerCase());
    }
    if (buildOption.includeFilePrefix) {
      this.includeFilePattern = new RegExp('^' + this.regexpQuote(buildOption.includeFilePrefix));
    }
    if (buildOption.excludeFileSuffix) {
      this.excludeFilePattern = new RegExp('^' + this.regexpQuote(buildOption.excludeFileSuffix));
    }
    if (buildOption.indexCommentTag) {
      this.indexCommentTagPatternString = '^\/\/\\s+' + this.regexpQuote(buildOption.indexCommentTag) + '\\s+(.+)';
    }
    if (buildOption.indexFileName) {
      this.indexFileName = buildOption.indexFileName || '_index.scss';
    }
    if (buildOption.mainFileName) {
      this.mainName = buildOption.mainFileName || 'style.scss';
    }
  }
  /**
   * 正規表現文字をクオートする
   *
   * @param {String} regexpStr 正規表現文字列
   * @return {String}
   */
  regexpQuote(regexpStr) {
    const metaChars = ['$', '^', '*', '\\', '/', '.', '[', ']', '|', '?', '+', '{', '}', '(', ')'];
    const escapedChars = metaChars.map((char) => '\\' + char).join('');
    return regexpStr.replace(new RegExp('[' + escapedChars + ']', 'g'), '\\$&');
  }
  /**
   * (インデックスファイルを生成する)パーシャルファイルを抽出する
   *
   * @param {string} targetDir 対象ディレクトリ
   */
  findPartialFiles(targetDir) {
    //インデックスファイルのパス
    const indexPath = path.join(targetDir, this.indexFileName);
    if (!this.indexFiles[indexPath]) {
      this.indexFiles[indexPath] = [];
    }
    //対象ディレクトリのファイルの一覧を抽出
    const allItems = fs.readdirSync(targetDir);
    allItems.forEach(item => {
      const fullPath = path.join(targetDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        /**
         * @todo ディレクトリを除外できるようにする
         */
        this.findPartialFiles(fullPath);
        const childDirIndexPath = fullPath + path.sep + this.indexFileName;
        const childDirIndexName = item + path.sep + this.indexFileName;
        if (
          this.indexFiles[childDirIndexPath].length > 0
          &&
          !this.indexFiles[indexPath].includes(childDirIndexName)
        ) {
          let indexComments = [];
          // if (inheritIndexComment) {
          //   const inheritIndexComments = this.indexFiles[childDirIndexPath]
          //     .forEach(comments => {
          //       if (comments && comments.length) {
          //         indexComments.push(comments);
          //       }
          //     })
          // }
          const indexFileEntry = {
            comments: indexComments,
            file: childDirIndexName
          };
          this.indexFiles[indexPath].unshift(indexFileEntry);
        }
      } else if (fs.statSync(fullPath).isFile()) {
        const fileName = path.basename(item, path.extname(item));
        const fileExt = path.extname(item).toLowerCase().slice(1);
        if (
          //インデックファイルではない
          path.basename(item) !== this.indexFileName
          &&
          //ファイルの拡張子が抽出対象の拡張子に一致する
          this.allowExts.includes(fileExt)
          &&
          //ファイル名が抽出パターンに一致する
          fileName.match(this.includeFilePattern)
          &&
          //ファイル名が除外パターンに一致しない
          !fileName.match(this.excludeFilePattern)
        ) {
          //アノテーションの抽出
          const indexCommentMatch = fs.readFileSync(fullPath)
            .toString()
            .match(new RegExp(this.indexCommentTagPattern, 'm'));
          const indexFileEntry = {
            file: item,
            comments: indexCommentMatch ? [indexCommentMatch[1]] : null,
          };
          this.indexFiles[indexPath].push(indexFileEntry)
        }
      }
    });
  }
  /**
   * インデックスファイルを生成
   *
   * @param {String} indexFilePath
   * @param {Array} forwardFiles
   */
  generateIndex(indexFilePath, forwardFiles = []) {
    const indexFileContents = forwardFiles.map(item => {
      let indexEntryString = '';
      if (item.comments && item.comments.length) {
        indexEntryString += item.comments
          .map(comment => '// ' + indexCommentTag + ' ' + comment)
          .join("\n");
        indexEntryString += "\n"
      }
      indexEntryString += '@forward "' + item.file + '";'
      return indexEntryString;
    });
    let indexFileContent = "// ===============================\n";
    indexFileContent += "// Auto generated by " + path.basename(__filename) + "\n";
    indexFileContent += "// Do not edit this file!\n";
    indexFileContent += "// ===============================\n\n";
    indexFileContent += indexFileContents.join("\n\n");
    fs.writeFileSync(indexFilePath, indexFileContent);
  }
  /**
   * インデックスファイルの生成
   */
  generateIndexFiles() {
    this.indexFiles = [];
    this.findPartialFiles(this.srcDir);

    // メインファイルに記載する内容を専用の変数に格納し、
    // ルートディレクトリ直下のインデックスファイルのエントリーを削除
    const mainFileEntries = this.indexFiles[path.join(this.srcDir, this.indexFileName)]
    delete this.indexFiles[path.join(this.srcDir, this.indexFileName)];

    // 各ディレクトリにインデックスファイルを生成、または、不要なインデックスファイルの削除
    Object.keys(this.indexFiles).forEach((indexFilePath) => {
      if (this.indexFiles[indexFilePath].length > 0) {
        this.generateIndex(indexFilePath, this.indexFiles[indexFilePath]);
      } else {
        if (fs.existsSync(indexFilePath)) {
          fs.unlinkSync(indexFilePath);
        }
        delete this.indexFiles[indexFilePath];
      }
    });
    // メインファイルの生成
    if (this.mainFileName && mainFileEntries.length > 0) {
      this.generateIndex(path.join(this.srcDir, this.mainFileName), mainFileEntries);
    }
  }
  /**
   * コンパイル対象ファイルを抽出する
   *
   * @param {String} targetDir
   */
  findCompileFiles(targetDir) {
    //コンパイルするファイル名のパターン
    const compileFilePattern = new RegExp('^[a-zA-Z0-9]');
    const allItems = fs.readdirSync(targetDir);
    allItems.forEach(item => {
      const fullPath = path.join(targetDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        this.findCompileFiles(fullPath);
      } else if (fs.statSync(fullPath).isFile()) {
        const fileName = path.basename(item, path.extname(item));
        const fileExt = path.extname(item).toLowerCase().slice(1);
        if (this.allowExts.includes(fileExt) && fileName.match(compileFilePattern)) {
          this.sassFiles.push(fullPath);
        }
      }
    });
  }

  /**
   * Sassファイルのコンパイル
   */
  compileSassFiles(sassCompileOption = {}) {
    this.sassFiles = [];
    // コンパイル対象のSassファイルを抽出
    this.findCompileFiles(this.srcDir);
    //Sassファイルのコンパイル
    this.sassFiles.forEach((compileSassFilePath) => {
      const sassFilePath = path.relative(this.srcDir, compileSassFilePath);
      const cssFileName = path.basename(sassFilePath, path.extname(sassFilePath)) + '.css';
      const cssFilePath = path.dirname(sassFilePath) + path.sep + cssFileName;
      const cssOutputPath = path.join(destDir, cssFilePath);
      const result = sass.compile(compileSassFilePath, sassCompileOption);
      if (!fs.existsSync(path.dirname(cssOutputPath))) {
        fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true }, (err) => { if (err) throw err; });
      }
      fs.writeFileSync(cssOutputPath, result.css, (err) => { if (err) throw err; });
    });
  }
  /**
   * ビルド処理
   */
  build(sassCompileOption = {}) {
    this.generateIndexFiles();
    this.compileSassFiles(sassCompileOption);
  }
}
/**
 * ---------------------
 * メイン処理部
 * ---------------------
 */
//コマンドライン引数
const args = process.argv.slice(2);
//ファイル変更の監視モード
const isWatch = args.includes('-w') || args.includes('--watch');
//コンパイル時のスタイル指定
//※コマンドライン引数に「--production」がある場合はcompressed、それ以外はexpandedで出力
const isProduction = args.includes('--production');
const builder = new buildCSS(srcDir, destDir, {
  allowExts: fileExtensions,
  includeFilePrefix: includeFilePrefix,
  excludeFileSuffix: excludeFileSuffix,
  indexCommentTag: indexCommentTag,
  indexFileName: indexFileName,
  mainFileName: mainFileName
});
const sassLoadPaths = [
  srcDir,
  process.cwd() + path.sep + 'node_modules'
];
let sassCompileOption = {
  loadPaths: sassLoadPaths,
  style: 'expanded',
  sourceMap: true,
  charset: true,
};
if (isProduction) {
  sassCompileOption = {
    loadPaths: sassLoadPaths,
    style: 'compressed',
    sourceMap: false,
  };
}
if (isWatch === true) {
  chokidar.watch(srcDir, {
    ignored: indexFileName
  })
    .on('add', (path) => {
      console.log('add:' + path);
      builder.build(sassCompileOption);
    })
    .on('unlink', (path) => {
      console.log('unlink:' + path);
      builder.build(sassCompileOption);
    })
    .on('unlinkDir', (path) => {
      builder.build(sassCompileOption);
    })
    .on('error', (error) => {
      console.error(error);
    });
} else {
  builder.build(sassCompileOption);
}
