'use strict';

var fs = require('node:fs');
var path = require('node:path');
var glob = require('glob');
var chokidar = require('chokidar');
var rimraf = require('rimraf');
var editorconfig = require('editorconfig');
require('.console');
var sass = require('sass');
var js_beautify = require('js-beautify');
var chalk = require('chalk');
var node_console = require('node:console');
var cosmiconfig = require('cosmiconfig');
var _ = require('lodash');
var yargs = require('yargs');
var dotenv = require('dotenv');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var chokidar__namespace = /*#__PURE__*/_interopNamespaceDefault(chokidar);
var sass__namespace = /*#__PURE__*/_interopNamespaceDefault(sass);
var dotenv__namespace = /*#__PURE__*/_interopNamespaceDefault(dotenv);

/**
 * ビルド処理の抽象クラス
 */
class baseBuilder {
    /**
     * コンストラクタ
     * @param option
     */
    constructor(option) {
        /**
         * ソースコードのディレクトリ
         */
        this.srcDir = 'src';
        /**
         * 出力先ディレクトリ
         */
        this.outputDir = 'public';
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = [];
        /**
         * エントリポイントではないが変更の監視対象となるファイルの拡張子
         */
        this.moduleExts = [];
        /**
         * エントリポイントから除外するファイル名の接頭語
         */
        this.ignoreFilePrefix = null;
        /**
         * エントリポイントから除外するファイル名の接尾語
         */
        this.ignoreFileSuffix = null;
        /**
         * エントリポイントから除外するディレクトリ名の接頭語
         * (この接頭語を持つディレクトリ以下に配置されているファイルはエントリポイントから除外される)
         */
        this.ignoreDirPrefix = null;
        /**
         * エントリポイントから除外するディレクトリ名の接尾語
         */
        this.ignoreDirSuffix = null;
        /**
         * エントリポイントから除外するディレクトリ名
         * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
         */
        this.ignoreDirNames = [];
        /**
         * 出力時の拡張子
         */
        this.outpuExt = 'txt';
        /**
         * コンパイラーのオプション
         */
        this.compileOption = {};
        /**
         * js-beautifyのオプション
         */
        this.beautifyOption = {};
        /**
         * エントリーポイント
         */
        this.entryPoint = new Map();
        /**
         * ファイルの監視オブジェクト
         */
        this.watcher = null;
        if (option) {
            this.setOption(option);
        }
    }
    /**
     * ビルダーのオプションを設定する
     * @param option
     */
    setOption(option) {
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
    setCompileOption(compileOption) {
        this.compileOption = compileOption;
    }
    /**
     * js-beautifyのオプションを設定する
     *
     * @param compileOption
     */
    setBeautifyOption(beautifyOption) {
        this.beautifyOption = beautifyOption;
    }
    /**
     * エントリポイントのファイルの拡張子を設定する
     * @param fileExts
     * @returns
     */
    setExt(fileExts) {
        this.fileExts = fileExts;
    }
    /**
     * 監視対象に含めるモジュールファイルの拡張子を設定する
     * @param moduleExts
     * @returns
     */
    setModuleExts(moduleExts) {
        this.moduleExts = moduleExts;
    }
    /**
     * エントリポイントの除外オプションを設定する
     * @param option
     */
    setIgnoreOption(option) {
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
    setIgnorePrefix(ignorePrefix) {
        this.setIgnoreFilePrefix(ignorePrefix);
        this.setIgnoreFilePrefix(ignorePrefix);
    }
    /**
     * エントリポイントから除外する接尾語を設定する
     * @param ignorePrefix
     * @returns
     */
    setIgnoreSuffix(ignoreSuffix) {
        this.setIgnoreFileSuffix(ignoreSuffix);
        this.setIgnoreDirSuffix(ignoreSuffix);
    }
    /**
     * エントリポイントから除外するファイル名の接尾語を設定する
     * @param ignorePrefix
     * @returns
     */
    setIgnoreFilePrefix(ignorePrefix) {
        this.ignoreFilePrefix = ignorePrefix;
    }
    /**
     * エントリポイントから除外するファイル名の接尾語を設定する
     * @param ignoreSuffix
     * @returns
     */
    setIgnoreFileSuffix(ignoreSuffix) {
        this.ignoreFileSuffix = ignoreSuffix;
    }
    /**
     * エントリポイントから除外するファイル名の接尾語を設定する
     * @param ignorePrefix
     * @returns
     */
    setIgnoreDirPrefix(ignorePrefix) {
        this.ignoreDirPrefix = ignorePrefix;
    }
    /**
     * エントリポイントから除外するディレクトリ名の接尾語を設定する
     * @param ignoreSuffix
     * @returns
     */
    setIgnoreDirSuffix(ignoreSuffix) {
        this.ignoreDirSuffix = ignoreSuffix;
    }
    /**
     * エントリポイントから除外するディレクトリ名を設定する
     * @param dirNames
     * @returns
     */
    setIgnoreDirNames(dirNames) {
        this.ignoreDirNames = dirNames;
    }
    /**
     * Globパターン文字列に変換する
     *
     * @param target
     * @returns
     */
    convertGlobPattern(target) {
        let globPattern;
        if (typeof target === 'string') {
            globPattern = target;
        }
        else {
            if (target.length > 1) {
                globPattern = '{' + Array.from(new Set(target)).join(',') + '}';
            }
            else {
                globPattern = target[0];
            }
        }
        return globPattern;
    }
    /**
     * エントリポイントのGlobパターンを取得する
     * @returns
     */
    getEntryPointGlobPatetrn() {
        return this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(this.fileExts);
    }
    /**
     * エントリポイントからの除外ファイル判定処理
     * @param p
     * @returns
     */
    globIgnoredFunc(p) {
        const fileName = path__namespace.basename(p.name, path__namespace.extname(p.name));
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
    globChildrenIgnoredFunc(p) {
        const dirName = p.name;
        const prefixCheck = this.ignoreDirPrefix ? RegExp('^' + this.ignoreDirPrefix).test(dirName) : false;
        const suffixCheck = this.ignoreDirSuffix ? RegExp(this.ignoreDirSuffix + '$').test(dirName) : false;
        return prefixCheck || suffixCheck || this.ignoreDirNames.includes(dirName);
    }
    /**
     * エントリポイントの対象ファイル一覧を取得する
     * @returns
     */
    findEntryPointFiles() {
        const entryPointGlobPatetrn = this.getEntryPointGlobPatetrn();
        const globOption = {
            ignore: {
                ignored: this.globIgnoredFunc.bind(this),
                childrenIgnored: this.globChildrenIgnoredFunc.bind(this),
            },
        };
        const entryPointFiles = glob.glob.sync(entryPointGlobPatetrn, globOption);
        return entryPointFiles;
    }
    /**
     * エントリポイントファイルの一覧をエントリポイントに変換する
     *
     * @param entryPointFiles
     * @returns
     */
    convertEntryPoint(entryPointFiles) {
        const entries = new Map();
        entryPointFiles.forEach((file) => {
            const targetFile = path__namespace.relative(this.srcDir, file);
            const key = path__namespace.join(path__namespace.dirname(targetFile), path__namespace.basename(targetFile, path__namespace.extname(targetFile)));
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
    getEntryPoint() {
        const entryPointFiles = this.findEntryPointFiles();
        this.entryPoint = this.convertEntryPoint(entryPointFiles);
        return this.entryPoint;
    }
    /**
     * ソースコードのパスを出力先のパスに変換する
     *
     * @param srcPath
     * @returns
     */
    convertOutputPath(srcPath) {
        let outputName = path__namespace.basename(srcPath);
        if (/\.[a-zA-Z0-9]{1,4}$/.test(srcPath)) {
            outputName = path__namespace.basename(srcPath, path__namespace.extname(srcPath)) + '.' + this.outpuExt;
        }
        const outputDir = path__namespace.dirname(path__namespace.relative(this.srcDir, srcPath));
        const outputPath = path__namespace.join(this.outputDir, outputDir, outputName);
        return outputPath;
    }
    /**
     * 監視対象ファイルのパターンを取得する
     * @returns
     */
    getWatchFilePattern() {
        const watchFileExts = Array.from(new Set([...this.fileExts, ...this.moduleExts]));
        const watchFilePattern = this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(watchFileExts);
        return watchFilePattern;
    }
    /**
     * 監視時のオプションを取得する
     * @returns
     */
    getWatchOpton() {
        return {
            ignoreInitial: true,
        };
    }
    /**
     * ファイルの監視とビルド
     */
    watch() {
        console.group('Watch files:');
        this.getEntryPoint();
        const watchFilePattern = this.getWatchFilePattern.bind(this)();
        console.log(watchFilePattern);
        this.watcher = chokidar__namespace.watch(watchFilePattern, this.getWatchOpton.bind(this)());
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
    watchAddCallBack(filePath) {
        console.group('Add file: ' + filePath);
        try {
            //エントリポイントを更新
            this.getEntryPoint();
            if (Array.from(this.entryPoint.values()).includes(filePath)) {
                const outputPath = this.convertOutputPath(filePath);
                this.buildFile(filePath, outputPath);
            }
            else {
                this.buildAll();
            }
        }
        catch (error) {
            console.error(error);
            process.exit(1);
        }
        console.groupEnd();
    }
    /**
     * ファイル更新時のコールバック処理
     * @param filePath
     */
    watchChangeCallBack(filePath) {
        console.group('Update file: ' + filePath);
        try {
            if (Array.from(this.entryPoint.values()).includes(filePath)) {
                const outputPath = this.convertOutputPath(filePath);
                this.buildFile(filePath, outputPath);
                console.log('Compile: ' + filePath + ' => ' + outputPath);
            }
            else {
                this.buildAll();
            }
        }
        catch (error) {
            console.error(error);
            process.exit(1);
        }
        console.groupEnd();
    }
    /**
     * ディレクトリ時のコールバック処理
     * @param filePath
     */
    watchAddDirCallBack(filePath) {
        console.group('Add directory: ' + filePath);
        console.groupEnd();
    }
    /**
     * ファイル削除時のコールバック処理
     * @param filePath
     */
    watchUnlinkCallBack(filePath) {
        console.group('Remove file: ' + filePath);
        if (Array.from(this.entryPoint.values()).includes(filePath)) {
            const outputPath = this.convertOutputPath(filePath);
            if (fs.existsSync(outputPath)) {
                rimraf.rimraf(outputPath);
                console.log('Remove: ' + outputPath);
            }
        }
        console.groupEnd();
    }
    /**
     * ディレクトリ削除時のコールバック処理
     *
     * @param filePath
     */
    watchUnlinkDirCallBack(filePath) {
        console.group('Remove directory: ' + filePath);
        const outputPath = this.convertOutputPath(filePath);
        if (fs.existsSync(outputPath)) {
            rimraf.rimraf(outputPath);
            console.log('Remove: ' + outputPath);
        }
        console.groupEnd();
    }
    /**
     * コンパイルオプションを取得する
     * @returns
     */
    getCompileOption() {
        return this.compileOption;
    }
    /**
     * 整形オプションを取得する
     * @param targetFile
     * @returns
     */
    getBeautifyOption(targetFile) {
        const eConfigs = editorconfig.parseSync(targetFile);
        let beautifyOption = {};
        if (eConfigs.indent_style === 'tab') {
            beautifyOption.indent_with_tabs = true;
        }
        else if (eConfigs.indent_style === 'space') {
            beautifyOption.indent_with_tabs = false;
        }
        if (eConfigs.indent_size) {
            beautifyOption.indent_size = eConfigs.indent_size;
        }
        if (eConfigs.max_line_length) {
            if (eConfigs.max_line_length === 'off') {
                beautifyOption.wrap_line_length = 0;
            }
            else {
                // @ts-ignore
                beautifyOption.wrap_line_length = parseInt(eConfigs.max_line_length, 10);
            }
        }
        if (eConfigs.insert_final_newline === true) {
            beautifyOption.end_with_newline = true;
        }
        else if (eConfigs.insert_final_newline === false) {
            beautifyOption.end_with_newline = false;
        }
        if (eConfigs.end_of_line) {
            // @ts-ignore
            if (eConfigs.end_of_line === 'cr') {
                beautifyOption.eol = '\r';
            }
            else if (eConfigs.end_of_line === 'lf') {
                beautifyOption.eol = '\n';
            }
            else if (eConfigs.end_of_line === 'crlf') {
                beautifyOption.eol = '\r\n';
            }
        }
        return Object.assign(beautifyOption, this.beautifyOption);
    }
    /**
     * ビルド処理
     */
    build(cleanup) {
        if (cleanup) {
            rimraf.rimrafSync(this.outputDir, {
                preserveRoot: true,
            });
        }
        this.buildAll();
    }
}

class ConsoleOverride extends node_console.Console {
    constructor() {
        super(process.stdout, process.stderr);
    }
    debug(message, ...optionalParams) {
        return super.debug(chalk.gray(message), ...optionalParams);
    }
    info(message, ...optionalParams) {
        return super.info(chalk.blue(message), ...optionalParams);
    }
    warn(message, ...optionalParams) {
        return super.warn(chalk.yellow(message), ...optionalParams);
    }
    error(message, ...optionalParams) {
        return super.error(chalk.red(message), ...optionalParams);
    }
    group(message, ...optionalParams) {
        return super.group(chalk.cyan(message), ...optionalParams);
    }
}
console = new ConsoleOverride();

/**
 * ビルド処理の抽象クラス
 */
class sassBuilder extends baseBuilder {
    /**
     * コンストラクタ
     * @param option
     */
    constructor(option) {
        super();
        /**
         * 出力先ディレクトリ
         */
        this.outputDir = 'public/assets/css';
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['scss', 'sass', 'css'];
        /**
         * エントリポイントから除外するファイル名の接頭語
         */
        this.ignoreFilePrefix = '_';
        /**
         * エントリポイントから除外するディレクトリ名
         * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
         */
        this.ignoreDirNames = [];
        /**
         * 出力時の拡張子
         */
        this.outpuExt = 'css';
        /**
         * コンパイラーのオプション
         */
        this.compilerOption = {};
        /**
         * インデックスファイルの自動生成の可否
         */
        this.generateIndex = false;
        /**
         * インデックスファイルの名前
         */
        this.indexFileName = '_all.scss';
        /**
         * インデックスファイルにインポートする際の方法
         */
        this.indexImportType = 'forward';
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
    setStyle(style) {
        this.style = style;
    }
    /**
     * SourceMapファイル出力の可否
     *
     * @param sourcemap
     */
    setSourceMap(sourcemap) {
        this.sourcemap = sourcemap;
    }
    /**
     * SassのloadPathsオプションを設定する
     *
     * @param loadPaths
     */
    setLoadPaths(loadPaths) {
        this.loadPaths = loadPaths;
    }
    /**
     * インデックスファイルの自動生成の可否を設定する
     *
     * @param generateIndex
     */
    setGenerateIndex(generateIndex) {
        this.generateIndex = generateIndex;
    }
    /**
     * インデックスファイルの名前を設定する
     *
     * @param indexFileName
     */
    setIndexFileName(indexFileName) {
        this.indexFileName = indexFileName;
    }
    /**
     * インデックスファイルのインポート形式を設定する
     *
     * @param importType
     */
    setIndexImportType(importType) {
        this.indexImportType = importType;
    }
    /**
     * インデックスファイルの生成処理
     *
     * @param filePath
     */
    generateIndexFile(targetDir, recursive = true) {
        if (!this.generateIndex) {
            return;
        }
        const indexMatchPatterns = ['./_*.' + this.convertGlobPattern(this.fileExts), './*/' + this.indexFileName];
        const partialMatchFiles = glob.glob
            .sync(indexMatchPatterns, {
            cwd: targetDir,
        })
            .filter((partialFile) => {
            // 同一階層のインデックスファイルは除外
            return partialFile !== this.indexFileName;
        })
            .sort();
        const indexFilePath = path__namespace.join(targetDir, this.indexFileName);
        if (partialMatchFiles.length === 0) {
            rimraf.rimraf(indexFilePath);
            console.log('Remove index file: ' + indexFilePath);
        }
        else {
            const partialFiles = {
                children: [],
                files: [],
            };
            partialMatchFiles.forEach((partialFile) => {
                if (partialFile.includes(path__namespace.sep)) {
                    //@ts-ignore
                    partialFiles.children.push(partialFile);
                }
                else {
                    //@ts-ignore
                    partialFiles.files.push(partialFile);
                }
            });
            let indexFileContentLines = [
                '// ===============================',
                '// Auto generated by sassBuilder',
                '// Do not edit this file!',
                '// ===============================',
            ];
            if (partialFiles.children.length > 0) {
                indexFileContentLines = indexFileContentLines.concat(partialFiles.children.map((file) => {
                    return `@${this.indexImportType} '${file}';`;
                }));
            }
            if (partialFiles.files.length > 0) {
                indexFileContentLines = indexFileContentLines.concat(partialFiles.files.map((file) => {
                    return `@${this.indexImportType} '${file}';`;
                }));
            }
            const indexFileContent = indexFileContentLines.join('\n') + '\n';
            if (fs__namespace.existsSync(indexFilePath)) {
                const indexFileContentBefore = fs__namespace.readFileSync(indexFilePath, 'utf-8');
                if (indexFileContentBefore != indexFileContent) {
                    fs__namespace.writeFileSync(indexFilePath, indexFileContent);
                    console.log('Update index file: ' + indexFilePath);
                }
            }
            else {
                fs__namespace.writeFileSync(indexFilePath, indexFileContent);
                console.log('Generate index file: ' + indexFilePath);
            }
        }
        if (recursive && path__namespace.dirname(targetDir).startsWith(this.srcDir)) {
            this.generateIndexFile(path__namespace.dirname(targetDir));
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
    setOption(option) {
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
    getCompileOption() {
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
    watchAddCallBack(filePath) {
        if (this.generateIndex && path__namespace.basename(filePath) === this.indexFileName) {
            return;
        }
        console.group('Add file: ' + filePath);
        if (this.generateIndex) {
            // インデックスファイルの生成/更新
            this.generateIndexFile.bind(this)(path__namespace.dirname(filePath));
        }
        try {
            //エントリポイントを更新
            this.getEntryPoint();
            if (Array.from(this.entryPoint.values()).includes(filePath)) {
                const outputPath = this.convertOutputPath(filePath);
                this.buildFile(filePath, outputPath);
            }
            else {
                this.buildAll();
            }
        }
        catch (error) {
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
    watchChangeCallBack(filePath) {
        if (this.generateIndex && path__namespace.basename(filePath) === this.indexFileName) {
            return;
        }
        console.group('Update file: ' + filePath);
        if (this.generateIndex) {
            // インデックスファイルの更新
            this.generateIndexFile.bind(this)(path__namespace.dirname(filePath));
        }
        try {
            if (Array.from(this.entryPoint.values()).includes(filePath)) {
                const outputPath = this.convertOutputPath(filePath);
                this.buildFile(filePath, outputPath);
                console.log('Compile: ' + filePath + ' => ' + outputPath);
            }
            else {
                this.buildAll();
            }
        }
        catch (error) {
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
    watchUnlinkCallBack(filePath) {
        if (this.generateIndex && path__namespace.basename(filePath) === this.indexFileName) {
            return;
        }
        console.group('Remove file: ' + filePath);
        if (this.generateIndex) {
            // インデックスファイルの更新
            this.generateIndexFile.bind(this)(path__namespace.dirname(filePath));
        }
        if (Array.from(this.entryPoint.values()).includes(filePath)) {
            this.entryPoint.delete(filePath);
            const outputPath = this.convertOutputPath(filePath);
            rimraf.rimraf(outputPath);
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
    async buildFile(srcPath, outputPath) {
        const compileOption = this.getCompileOption();
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
        const result = sass__namespace.compile(srcPath, compileOption);
        if (compileOption.style !== 'compressed') {
            result.css = js_beautify.css(result.css, beautifyOption);
        }
        fs__namespace.mkdirSync(path__namespace.dirname(outputPath), { recursive: true });
        fs__namespace.writeFileSync(outputPath, result.css.trim() + '\n');
        if (result.sourceMap) {
            fs__namespace.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
        }
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        console.group('Build entory point files');
        const entries = this.getEntryPoint();
        if (this.generateIndex) {
            //インデックスファイルの生成/更新
            const partialFilePattern = path__namespace.join(this.srcDir, '**/_*.' + this.convertGlobPattern(this.fileExts));
            const partialFiles = glob.glob.sync(partialFilePattern);
            if (partialFiles.length > 0) {
                partialFiles
                    .map((partialFile) => {
                    return path__namespace.dirname(partialFile);
                })
                    .reduce((unique, item) => {
                    return unique.includes(item) ? unique : [...unique, item];
                }, [])
                    .forEach((generateIndexDir) => {
                    this.generateIndexFile.bind(this)(generateIndexDir, false);
                });
            }
        }
        if (entries.size > 0) {
            const compileOption = this.getCompileOption();
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
            entries.forEach((srcFile, entryPoint) => {
                const outputPath = path__namespace.join(this.outputDir, entryPoint + '.' + this.outpuExt);
                const result = sass__namespace.compile(srcFile, compileOption);
                if (compileOption.style !== 'compressed') {
                    result.css = js_beautify.css(result.css, beautifyOption);
                }
                fs__namespace.mkdirSync(path__namespace.dirname(outputPath), { recursive: true });
                fs__namespace.writeFileSync(outputPath, result.css.trim() + '\n');
                console.log('Compile: ' + srcFile + ' => ' + outputPath);
                if (result.sourceMap) {
                    fs__namespace.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
                }
            });
        }
        console.groupEnd();
    }
}

class configLoader {
    /**
     * 設定ファイルをロードする
     * @returns
     */
    static load() {
        if (configLoader.result === undefined) {
            const explorerSync = cosmiconfig.cosmiconfigSync('builder');
            configLoader.result = explorerSync.search();
        }
        return configLoader.result ? configLoader.result.config : {};
    }
    /**
     * 指定のビルダーが無効化されているか確認する
     *
     * @param type
     * @returns
     */
    static isDisable(type) {
        const allConfig = configLoader.load();
        if (allConfig && _.has(allConfig, 'disabled') && _.get(allConfig, 'disabled')) {
            return _.get(allConfig, 'disabled').includes(type);
        }
        return false;
    }
    /**
     * 設定の指定のキーの値を取得する
     * @param key
     * @returns
     */
    static get(key, defaultValue) {
        const allConfig = configLoader.load();
        return _.get(allConfig, key, defaultValue);
    }
    /**
     * 指定されたビルダーのオプションを取得する
     * @param type
     * @returns
     */
    static getOption(type, overrideOption) {
        const allConfig = configLoader.load();
        let builderConfig = {};
        if (allConfig) {
            builderConfig = allConfig;
            if (_.has(allConfig, type) && _.get(allConfig, type)) {
                builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(_.get(allConfig, type)));
            }
            ['disabled', 'server', 'html', 'css', 'js'].forEach((removeKey) => {
                _.unset(builderConfig, removeKey);
            });
        }
        if (overrideOption) {
            builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(overrideOption));
        }
        return builderConfig;
    }
    /**
     * サーバーのオプションを取得する
     * @returns
     */
    static getServerOption(overrideOption) {
        const allConfig = configLoader.load();
        let serverOption = _.has(allConfig, 'server') && !_.isNull(_.get(allConfig, 'server')) ? _.get(allConfig, 'server') : {};
        if (overrideOption) {
            serverOption = _.merge(_.cloneDeep(serverOption), _.cloneDeep(overrideOption));
        }
        return serverOption;
    }
    /**
     * HTMLビルダーのオプションを取得する
     * @returns
     */
    static getHtmlOption(overrideOption) {
        return configLoader.getOption('html', overrideOption);
    }
    /**
     * CSSビルダーのオプションを取得する
     * @returns
     */
    static getCssOption(overrideOption) {
        return configLoader.getOption('css', overrideOption);
    }
    /**
     * JSビルダーのオプションを取得する
     * @returns
     */
    static getJsOption(overrideOption) {
        return configLoader.getOption('js', overrideOption);
    }
    /**
     * コンパイラーを取得する
     * @param type
     */
    static getCompiler(type) {
        let compiler = _.get(configLoader.defaultCompiler, type);
        const builderOption = this.getOption(type);
        if (_.has(builderOption, 'compiler') && _.has(builderOption, 'compiler')) {
            compiler = _.get(builderOption, 'compiler');
        }
        return compiler;
    }
}
/**
 * デフォルトのコンパイラー
 */
configLoader.defaultCompiler = {
    js: 'typescript',
    css: 'sass',
    html: 'nunjucks',
};

dotenv__namespace.config();
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
    c: { type: 'string', alias: 'config', description: '設定ファイルの指定' }
})
    .parseSync();
if (argv.mode !== undefined) {
    String(argv.mode);
}
else if (argv.develop !== undefined) ;
else if (argv.production !== undefined) ;
/**
 * コマンドライン引数で指定された設定ファイルを読み込む
 */
const orverrideOption = {};
const builderOption = configLoader.getJsOption(orverrideOption);
const builder = new sassBuilder(builderOption);
if (argv.watch) {
    builder.watch();
}
else {
    builder.build();
}
