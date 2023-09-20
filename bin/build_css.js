#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sass = require('sass');
const chokidar = require('chokidar');
require('dotenv').config();

//Sassファイルのディレクトリ
let srcDir = 'src/scss';
//CSS出力先ディレクトリ
let destDir = 'dist/assets/css';
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
    throw new Exception('CSS出力先ディレクトリ指定が不正です');
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
//ディレクトリの除外パターン(接尾語)
const excludeDirSuffix = process.env.SCSS_EXCLUDE_DIR_SUFFIX || null;
//インデックスファイル用コメントタグ
const indexCommentTag = process.env.SCSS_INDEX_COMMENT_TAG || '@package';

class buildCSS {
  /**
   * ソースディレクトリ
   */
  srcDir = 'scss';
  /**
   * 出力先ディレクトリ
   */
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
   * 除外ディレクトリ名パターン
   */
  excludeDirPattern = null;
  /**
   *  インデックスファイル用コメントタグ
   */
  indexCommentTag = '@package';
  /**
   * インデックスファイル名
   */
  indexFileName = '_index.scss';
  /**
   * メインファイル名
   */
  mainFileName = null;

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
      this.excludeFilePattern = new RegExp(this.regexpQuote(buildOption.excludeFileSuffix) + '$');
    }
    if (buildOption.excludeDirSuffix) {
      this.excludeDirPattern = new RegExp(this.regexpQuote(buildOption.excludeDirSuffix) + '$');
    }
    if (buildOption.indexCommentTag) {
      this.indexCommentTag = buildOption.indexCommentTag;
    }
    if (buildOption.indexFileName) {
      this.indexFileName = buildOption.indexFileName || '_index.scss';
    }
    if (buildOption.mainFileName) {
      this.mainName = buildOption.mainFileName;
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
   * (インデックスファイルを生成する)パーシャルファイルを探す
   *
   * @param {string} targetDir 対象ディレクトリ
   */
  findPartialFiles(targetDir) {
    // インデックスファイルのパス
    const indexPath = path.join(targetDir, this.indexFileName);
    if (!this.indexFiles[indexPath]) {
      this.indexFiles[indexPath] = {
        'files': [],
        'subDirectoryIndexes': []
      };
    }
    // 対象ディレクトリのファイルの一覧を抽出
    const allItems = fs.readdirSync(targetDir);
    allItems.forEach(item => {
      const fullPath = path.join(targetDir, item);
      if (fs.statSync(fullPath).isFile()) {
        //指定されたパスがファイルだった場合
        const fileName = path.basename(item, path.extname(item));
        const fileExt = path.extname(item).toLowerCase().slice(1);
        if (
          // インデックファイルではない
          path.basename(item) !== this.indexFileName
          &&
          // ファイルの拡張子が抽出対象の拡張子に一致する
          this.allowExts.includes(fileExt)
          &&
          // ファイル名が抽出パターンに一致する
          fileName.match(this.includeFilePattern)
          &&
          // ファイル名が除外パターンに一致しない
          !fileName.match(this.excludeFilePattern)
        ) {
          //アノテーションの抽出
          const indexCommentMatch = fs.readFileSync(fullPath)
            .toString()
            .match(new RegExp('^\/\/\\s+' + this.regexpQuote(this.indexCommentTag) + '\\s+(.+)', 'm'));
          const indexFileEntry = {
            file: item,
            comments: indexCommentMatch ? [indexCommentMatch[1]] : [],
          };
          this.indexFiles[indexPath]['files'].push(indexFileEntry)
        }
      } else if (fs.statSync(fullPath).isDirectory()) {
        //指定されたパスがディレクトリだった場合
        if (!this.excludeDirPattern || !item.match(this.excludeDirPattern)) {
          this.findPartialFiles(fullPath);
          const childDirIndexPath = fullPath + path.sep + this.indexFileName;
          const childDirIndexName = item + path.sep + this.indexFileName;
          if (
            this.indexFiles[childDirIndexPath]['subDirectoryIndexes'].length > 0
            ||
            this.indexFiles[childDirIndexPath]['files'].length > 0
          ) {
            const indexFileEntry = {
              file: childDirIndexName,
              comments: []
            };
            this.indexFiles[indexPath]['subDirectoryIndexes'].push(indexFileEntry);
          }
        }
      }
    });
  }
  /**
   * インデックスファイルを生成する
   *
   * @param {String} indexFilePath
   * @param {Array} forwardFiles
   */
  generateIndex(indexFilePath, forwardFiles = []) {
    let indexFileContents = [];
    indexFileContents = indexFileContents.concat(this.getIndexEntiryContents(forwardFiles['subDirectoryIndexes']));
    indexFileContents = indexFileContents.concat(this.getIndexEntiryContents(forwardFiles['files']));

    let indexFileContent = "// ===============================\n";
    indexFileContent += "// Auto generated by " + path.basename(__filename) + "\n";
    indexFileContent += "// Do not edit this file!\n";
    indexFileContent += "// ===============================\n\n";
    indexFileContent += indexFileContents.join("\n\n");
    fs.writeFileSync(indexFilePath, indexFileContent + "\n");
  }
  /**
   * インデックスファイルに出力する内容を取得する
   *
   * @param {Array} indexFileEntries
   * @returns {String}
   */
  getIndexEntiryContents(indexFileEntries) {
    let indexEntryContents = [];
    if (indexFileEntries.length > 0) {
      indexEntryContents = indexFileEntries.map((entry) => {
        let indexEntryString = '';
        if (entry.comments && entry.comments.length > 0) {
          //コメントを追加出力
          indexEntryString += entry.comments
            .map(comment => '// ' + this.indexCommentTag + ' ' + comment)
            .join("\n");
          indexEntryString += "\n"
        }
        indexEntryString += '@forward "' + entry.file + '";'
        return indexEntryString;
      });
    }
    return indexEntryContents;
  }
  /**
   * インデックスファイルの生成
   */
  generateIndexFiles() {
    this.indexFiles = {};
    this.findPartialFiles(this.srcDir);

    // メインファイルに記載する内容を専用の変数に格納し、
    // ルートディレクトリ直下のインデックスファイルのエントリーを削除
    const mainIndexFilePath = path.join(this.srcDir, this.indexFileName);
    const mainFileEntries = this.indexFiles[mainIndexFilePath]
    delete this.indexFiles[mainIndexFilePath];

    // 各ディレクトリにインデックスファイルを生成、または、不要なインデックスファイルの削除
    Object.keys(this.indexFiles).forEach((indexFilePath) => {
      if (
        this.indexFiles[indexFilePath]['subDirectoryIndexes'].length > 0
        ||
        this.indexFiles[indexFilePath]['files'].length > 0
      ) {
        this.generateIndex(indexFilePath, this.indexFiles[indexFilePath]);
      } else {
        if (fs.existsSync(indexFilePath)) {
          fs.unlinkSync(indexFilePath);
        }
        delete this.indexFiles[indexFilePath];
      }
    });
    // メインファイルの生成
    if (
      this.mainName
      &&
      (mainFileEntries['subDirectoryIndexes'].length > 0 || mainFileEntries['file'].length > 0)
    ) {
      this.generateIndex(path.join(this.srcDir, this.mainName), mainFileEntries);
    }
  }
  /**
   * コンパイル対象ファイルを探す
   *
   * @param {String} targetDir
   */
  findCompileFiles(targetDir) {
    // コンパイルするファイル名のパターン
    const compileFilePattern = new RegExp('^[a-zA-Z0-9]');
    const allItems = fs.readdirSync(targetDir);
    allItems.forEach(item => {
      const fullPath = path.join(targetDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!this.excludeDirPattern || !item.match(this.excludeDirPattern)) {
          this.findCompileFiles(fullPath);
        }
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
   *
   * @param {Object} sassCompileOption
   */
  compileSassFiles(sassCompileOption = {}) {
    this.sassFiles = [];
    // コンパイル対象のSassファイルを抽出
    this.findCompileFiles(this.srcDir);
    const sourceMapReplaceSrcPath = 'file://' + this.srcDir + path.sep;
    const sourceMapReplacedPath = path.relative(this.destDir, this.srcDir) + path.sep;
    let cssContent = '';
    // Sassファイルのコンパイル
    this.sassFiles.forEach((compileSassFilePath) => {
      const sassFilePath = path.relative(this.srcDir, compileSassFilePath);
      const cssFileName = path.basename(sassFilePath, path.extname(sassFilePath)) + '.css';
      const cssFilePath = path.dirname(sassFilePath) + path.sep + cssFileName;
      const cssOutputPath = path.join(this.destDir, cssFilePath);
      const sourceMapFilePath = cssOutputPath + '.map';

      console.log('Compile:' + sassFilePath);
      /**
       * @todo エラートラップを入れてコンパイルエラー時には、エラーメッセージ用のCSSを強制出力
       */
      try {
        if (!fs.existsSync(path.dirname(cssOutputPath))) {
          fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true }, (err) => { if (err) throw err; });
        }
        const result = sass.compile(compileSassFilePath, sassCompileOption);
        cssContent = result.css;
        if (result.sourceMap) {
          result.sourceMap.file = path.basename(cssOutputPath);
          result.sourceMap.sources = result.sourceMap.sources.map((sourcePath) => {
            return sourcePath.replace(sourceMapReplaceSrcPath, sourceMapReplacedPath);
          });
          fs.writeFileSync(sourceMapFilePath, JSON.stringify(result.sourceMap));
        } else {
          if (fs.existsSync(sourceMapFilePath)) {
            fs.unlinkSync(sourceMapFilePath);
          }
        }
      } catch (error) {
        console.error(error);
        const cssErrorStyleContent = error.toString()
          .replace(/\x1b\[3[0-9]m/g, ' ')
          .replace(/\x1b\[0m/g, '')
          .replace(/╷/g, '\\2577')
          .replace(/│/g, '\\2502')
          .replace(/╵/g, '\\2575')
          .replace(/\n/g, "\\A");
        cssContent = `@charset "UTF-8";
body::before {
  font-family: "Source Code Pro", "SF Mono", Monaco, Inconsolata, "Fira Mono", "Droid Sans Mono", monospace, monospace;
  white-space: pre;
  display: block;
  padding: 1em;
  margin-bottom: 1em;
  border-bottom: 2px solid black;
  content: '${cssErrorStyleContent}';
}`;
      }
      fs.writeFileSync(cssOutputPath, cssContent);
    });
  }
  /**
   * ビルド処理
   *
   * @param {Object} sassCompileOption
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
const isDebug = args.includes('--debug');
const builder = new buildCSS(srcDir, destDir, {
  allowExts: fileExtensions,
  includeFilePrefix: includeFilePrefix,
  excludeFileSuffix: excludeFileSuffix,
  excludeDirSuffix: excludeDirSuffix,
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
  const watchGlobPattern = srcDir + '/**/*.{' + fileExtensions.join(',') + '}';
  const mainFilePath = mainFileName ? path.join(srcDir, mainFileName) : null;
  const watcher = chokidar.watch(watchGlobPattern, {
    ignoreInitial: true,
  });
  watcher
    .on('add', (filePath) => {
      if (mainFilePath !== filePath && path.basename(filePath) !== indexFileName) {
        if (isDebug) console.log('add:' + filePath);
        builder.build(sassCompileOption);
      }
    })
    .on('change', (filePath) => {
      if (mainFilePath !== filePath && path.basename(filePath) !== indexFileName) {
        if (isDebug) console.log('change:' + filePath);
        builder.build(sassCompileOption);
      }
    })
    .on('unlink', (filePath) => {
      if (isDebug) console.log('unlink:' + filePath);
      builder.build(sassCompileOption);
    })
    .on('addDir', (dirPath) => {
      if (isDebug) console.log('addDir:' + dirPath);
      builder.build(sassCompileOption);
    })
    .on('unlinkDir', (dirPath) => {
      if (isDebug) console.log('unlinkDir:' + dirPath);
      builder.build(sassCompileOption);
    })
    .on('error', (error) => {
      console.error(error);
    });
} else {
  builder.build(sassCompileOption);
}
