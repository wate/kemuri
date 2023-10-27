'use strict';

var fs = require('node:fs');
var path = require('node:path');
var glob = require('glob');
var chokidar = require('chokidar');
var rimraf = require('rimraf');
var editorconfig = require('editorconfig');
require('.console');
var yaml = require('js-yaml');
var js_beautify = require('js-beautify');
var nunjucks = require('nunjucks');
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
class nunjucksBuilder extends baseBuilder {
    /**
     * コンストラクタ
     * @param option
     */
    constructor(option) {
        super();
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['njk', 'twig'];
        /**
         * 出力時の拡張子
         */
        this.outpuExt = 'html';
        /**
         * 変数ファイルの名前
         */
        this.varFileName = 'vars.yml';
        /**
         * テンプレート変数格納用メンバ変数
         */
        this.templateVars = {};
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
    setVarFileName(varFileName) {
        this.varFileName = varFileName;
    }
    /**
     * テンプレート変数をロードする
     */
    loadTemplateVars() {
        const globPatterns = [this.varFileName, this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName];
        const varFiles = glob.glob.sync(globPatterns);
        varFiles.forEach((varFilePath) => {
            const key = path__namespace.dirname(varFilePath);
            // @ts-ignore
            this.templateVars[key] = yaml.load(fs__namespace.readFileSync(varFilePath));
        });
    }
    /**
     * テンプレートに対応する変数を取得する
     * @param srcFile
     * @returns
     */
    getTemplateVars(srcFile) {
        let templateVars = this.templateVars['.'] ?? {};
        let key = '';
        const srcFilePaths = path__namespace.dirname(srcFile).split(path__namespace.sep);
        srcFilePaths.forEach((dirName) => {
            key = path__namespace.join(key, dirName);
            if (this.templateVars[key]) {
                templateVars = Object.assign(templateVars, this.templateVars[key]);
            }
        });
        templateVars['_scope'] = path__namespace.dirname(path__namespace.relative(this.srcDir, srcFile));
        return templateVars;
    }
    /**
     * ルートディレクトリの変数ファイルかどうかを判定する
     *
     * @param filePath
     * @returns
     */
    isRootVarFile(varFilePath) {
        const isProjectRootVarFile = varFilePath === this.varFileName;
        const isSrcRootVarFile = path__namespace.join(this.srcDir, this.varFileName) === varFilePath;
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
    setOption(option) {
        super.setOption(option);
        if (option.varFileName !== undefined && option.varFileName) {
            this.setVarFileName(option.varFileName);
        }
    }
    /**
     * 監視対象ファイルのパターンを取得する
     * @returns
     */
    getWatchFilePattern() {
        const watchFileExts = Array.from(new Set([...this.fileExts, ...this.moduleExts]));
        const watchFilePattern = [
            this.varFileName,
            this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(watchFileExts),
            this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName,
        ];
        return watchFilePattern;
    }
    /**
     * ファイル追加時のコールバック処理
     * @param filePath
     */
    watchAddCallBack(filePath) {
        console.group('Add file: ' + filePath);
        try {
            const addFileName = path__namespace.basename(filePath);
            if (addFileName !== this.varFileName) {
                //エントリポイントを更新
                this.getEntryPoint();
                if (Array.from(this.entryPoint.values()).includes(filePath)) {
                    const outputPath = this.convertOutputPath(filePath);
                    this.buildFile(filePath, outputPath);
                    console.log('Compile: ' + filePath + ' => ' + outputPath);
                }
                else {
                    this.buildAll();
                }
            }
            else {
                const isRootVarFile = this.isRootVarFile(filePath);
                if (isRootVarFile) {
                    //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
                    this.buildAll();
                }
                else {
                    //指定階層以下の変数ファイルが更新された場合は、その階層以下のファイルのみビルド
                    this.entryPoint.forEach((srcFile) => {
                        if (srcFile.startsWith(path__namespace.dirname(filePath) + path__namespace.sep)) {
                            const outputPath = this.convertOutputPath(srcFile);
                            this.buildFile(srcFile, outputPath);
                            console.log('Compile: ' + srcFile + ' => ' + outputPath);
                        }
                    });
                }
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
            const changeFileName = path__namespace.basename(filePath);
            if (changeFileName !== this.varFileName) {
                if (Array.from(this.entryPoint.values()).includes(filePath)) {
                    const outputPath = this.convertOutputPath(filePath);
                    this.buildFile(filePath, outputPath);
                    console.log('Compile: ' + filePath + ' => ' + outputPath);
                }
                else {
                    this.buildAll();
                }
            }
            else {
                const isRootVarFile = this.isRootVarFile(filePath);
                if (isRootVarFile) {
                    //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
                    this.buildAll();
                }
                else {
                    //指定階層以下の変数ファイルが更新された場合は、その階層以下のファイルのみビルド
                    this.entryPoint.forEach((srcFile) => {
                        if (srcFile.startsWith(path__namespace.dirname(filePath) + path__namespace.sep)) {
                            const outputPath = this.convertOutputPath(srcFile);
                            this.buildFile(srcFile, outputPath);
                            console.log('Compile: ' + srcFile + ' => ' + outputPath);
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error(error);
            process.exit(1);
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
        nunjucks.configure(this.srcDir, this.compileOption);
        this.getBeautifyOption('dummy.' + this.outpuExt);
        this.loadTemplateVars();
        const templatePath = path__namespace.relative(this.srcDir, srcPath);
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
    async buildAll() {
        console.group('Build entory point files');
        const entries = this.getEntryPoint();
        if (entries.size > 0) {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
            this.loadTemplateVars();
            nunjucks.configure(this.srcDir, this.compileOption);
            entries.forEach((srcFile, entryPoint) => {
                const templatePath = path__namespace.relative(this.srcDir, srcFile);
                const outputPath = path__namespace.join(this.outputDir, entryPoint + '.' + this.outpuExt);
                const templateVars = this.getTemplateVars(srcFile);
                let html = nunjucks.render(templatePath, templateVars);
                //@ts-ignore
                html = js_beautify.html(html, beautifyOption);
                fs__namespace.mkdirSync(path__namespace.dirname(outputPath), { recursive: true });
                fs__namespace.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
                console.log('Compile: ' + srcFile + ' => ' + outputPath);
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
const builder = new nunjucksBuilder(builderOption);
if (argv.watch) {
    builder.watch();
}
else {
    builder.build();
}
