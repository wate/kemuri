import fs__default from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import * as chokidar from 'chokidar';
import { rimraf, rimrafSync } from 'rimraf';
import editorconfig from 'editorconfig';
import { c as console } from './config.mjs';

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
        this.outputExt = 'txt';
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
     * 出力先のディレクトリを取得する
     * @returns
     */
    getOutputDir() {
        return this.outputDir;
    }
    /**
     * ソースコードのディレクトリを取得する
     * @returns
     */
    getSrcDir() {
        return this.srcDir;
    }
    /**
     * 出力ファイルの拡張子を取得する
     * @returns
     */
    getOutputExt() {
        return this.outputExt;
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
    getEntryPointPattern() {
        return this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(this.fileExts);
    }
    /**
     * ファイル名の接頭語による除外パターンを取得する
     * @returns
     */
    getIgnoreFilePrefixPattern() {
        if (this.ignoreFilePrefix) {
            return (this.convertGlobPattern(this.srcDir) +
                '/**/' +
                this.ignoreFilePrefix +
                '*.' +
                this.convertGlobPattern(this.fileExts));
        }
        return '';
    }
    /**
     * ファイル名の接尾語による除外パターンを取得する
     */
    getIgnoreFileSuffixPattern() {
        if (this.ignoreFileSuffix) {
            return (this.convertGlobPattern(this.srcDir) +
                '/**/*' +
                this.ignoreFileSuffix +
                '.' +
                this.convertGlobPattern(this.fileExts));
        }
        return '';
    }
    /**
     * ディレクトリ名の接頭語による除外パターンを取得する
     * @returns
     */
    getIgnoreDirPrefixPattern() {
        if (this.ignoreDirPrefix) {
            return (this.convertGlobPattern(this.srcDir) +
                '/' +
                this.ignoreDirPrefix +
                '*/*.' +
                this.convertGlobPattern(this.fileExts));
        }
        return '';
    }
    /**
     * ディレクトリ名の接尾語による除外パターンを取得する
     * @returns
     */
    getIgnoreDirSuffixPattern() {
        if (this.ignoreDirSuffix) {
            return (this.convertGlobPattern(this.srcDir) +
                '/**/*' +
                this.ignoreDirSuffix +
                '.' +
                this.convertGlobPattern(this.fileExts));
        }
        return '';
    }
    /**
     * ディレクトリ名による除外パターンを取得する
     * @returns
     */
    getIgnoreDirNamePattern() {
        if (this.ignoreDirNames.length > 0) {
            return (this.convertGlobPattern(this.srcDir) +
                '/{' +
                this.ignoreDirNames.join(',') +
                '}/**/*.' +
                this.convertGlobPattern(this.fileExts));
        }
        return '';
    }
    /**
     * エントリポイントの除外パターンを取得する
     * @returns
     */
    getIgnorePatterns() {
        const ignorePatterns = [
            this.getIgnoreFilePrefixPattern(),
            this.getIgnoreFileSuffixPattern(),
            this.getIgnoreDirPrefixPattern(),
            this.getIgnoreDirSuffixPattern(),
            this.getIgnoreDirNamePattern(),
        ];
        return ignorePatterns.filter((pattern) => {
            return pattern !== '';
        });
    }
    /**
     * エントリポイントからの除外ファイル判定処理
     * @param p
     * @returns
     */
    globIgnoredFunc(p) {
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
        const entryPointGlobPatetrn = this.getEntryPointPattern();
        const globOption = {
            ignore: {
                ignored: this.globIgnoredFunc.bind(this),
                childrenIgnored: this.globChildrenIgnoredFunc.bind(this),
            },
        };
        const entryPointFiles = glob.sync(entryPointGlobPatetrn, globOption);
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
            const targetFile = path.relative(this.srcDir, file);
            const key = path.join(path.dirname(targetFile), path.basename(targetFile, path.extname(targetFile)));
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
     * @param isDir
     * @returns
     */
    convertOutputPath(srcPath, isDir = false) {
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
    watchAddCallBack(filePath) {
        console.group('Add file: ' + filePath);
        try {
            //エントリポイントを更新する
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
     * ファイル削除時のコールバック処理
     * @param filePath
     */
    watchUnlinkCallBack(filePath) {
        console.group('Remove file: ' + filePath);
        if (Array.from(this.entryPoint.values()).includes(filePath)) {
            const outputPath = this.convertOutputPath(filePath);
            if (fs__default.existsSync(outputPath)) {
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
    watchAddDirCallBack(filePath) {
        console.group('Add directory: ' + filePath);
        this.convertOutputPath(filePath, true);
        console.groupEnd();
    }
    /**
     * ディレクトリ削除時のコールバック処理
     *
     * @param filePath
     */
    watchUnlinkDirCallBack(filePath) {
        console.group('Remove directory: ' + filePath);
        const outputPath = this.convertOutputPath(filePath, true);
        if (fs__default.existsSync(outputPath)) {
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
            rimrafSync(this.outputDir);
        }
        this.buildAll();
    }
}

export { baseBuilder as b };
