import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import * as chokidar from 'chokidar';
import { rimraf, rimrafSync } from 'rimraf';
import editorconfig from 'editorconfig';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import js_beautify from 'js-beautify';
import { minify } from 'terser';
import * as sass from 'sass';
import yaml from 'js-yaml';
import nunjucks from 'nunjucks';
import { cosmiconfigSync } from 'cosmiconfig';
import _ from 'lodash';
import yargs from 'yargs';

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
        this.fileExts = ['txt'];
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
     * エントリポイントのGlobパターンを取得する
     * @returns
     */
    getEntryPointGlobPatetrn() {
        return this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(this.fileExts);
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
        const entryPointFiles = glob.sync(entryPointGlobPatetrn, globOption);
        return entryPointFiles;
    }
    /**
     * エントリポイントのベースディレクトリを取得する
     */
    getEntryPointBaseDir() {
        let baseDir = typeof this.srcDir === 'string' ? this.srcDir : null;
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
    convertEntryPoint(entryPointFiles) {
        const entries = new Map();
        const baseDir = this.getEntryPointBaseDir();
        entryPointFiles.forEach((file) => {
            const targetFile = baseDir ? path.relative(baseDir, file) : file;
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
        return this.convertEntryPoint(entryPointFiles);
    }
    /**
     * ソースコードのパスを出力先のパスに変換する
     *
     * @param srcPath
     * @returns
     */
    convertOutputPath(srcPath) {
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
    getWatchFilePattern() {
        const watchFileExts = Array.from(new Set([...this.fileExts, ...this.moduleExts]));
        const watchFilePattern = this.convertGlobPattern(this.srcDir) + '/**/*.' + this.convertGlobPattern(watchFileExts);
        return watchFilePattern;
    }
    /**
     * ファイルの監視とビルド
     */
    watch() {
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
                }
                else {
                    this.buildAll();
                    console.log('Compile All');
                }
            }
            catch (error) {
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
                }
                else {
                    this.buildAll();
                    console.log('Compile All');
                }
            }
            catch (error) {
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
            rimrafSync(this.outputDir, {
                preserveRoot: true,
            });
        }
        this.buildAll();
    }
}

/**
 * ビルド処理の抽象クラス
 */
class typescriptBuilder extends baseBuilder {
    /**
     * コンストラクタ
     * @param option
     */
    constructor(option) {
        super();
        /**
         * 出力先ディレクトリ
         */
        this.outputDir = 'public/assets/js';
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['js', 'ts'];
        /**
         * エントリポイントではないが変更の監視対象となるファイルの拡張子
         */
        this.moduleExts = ['mjs', 'cjs', 'mts', 'cts'];
        /**
         * エントリポイントから除外するディレクトリ名
         * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
         */
        this.ignoreDirNames = ['node_modules'];
        /**
         * 出力時の拡張子
         */
        this.outpuExt = 'js';
        /**
         * ビルド時に設定するグローバルオブジェクトの内容
         */
        this.globals = {};
        /**
         * TypeScriptのデフォルトのコンパイルオプション
         */
        this.typeScriptCompolerOption = {
            /* ------------------------ */
            /* Language and Environment */
            /* ------------------------ */
            // Set the JavaScript language version for emitted JavaScript and include compatible library declarations.
            target: 'ES2020',
            // Specify a set of bundled library declaration files that describe the target runtime environment.
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            /* ------------------------ */
            /* Modules                  */
            /* ------------------------ */
            // Specify what module code is generated.
            module: 'ESNext',
            // Specify how TypeScript looks up a file from a given module specifier.
            moduleResolution: 'bundler',
            // Use the package.json 'exports' field when resolving package imports.
            resolvePackageJsonExports: true,
            // Use the package.json 'imports' field when resolving imports.
            resolvePackageJsonImports: true,
            // Enable importing .json files.
            resolveJsonModule: true,
            /* ------------------------ */
            /* JavaScript Support       */
            /* ------------------------ */
            allowJs: true,
            checkJs: true,
            /* ------------------------ */
            /* Interop Constraints      */
            /* ------------------------ */
            // Ensure that each file can be safely transpiled without relying on other imports.
            isolatedModules: true,
            // Allow 'import x from y' when a module doesn't have a default export.
            allowSyntheticDefaultImports: true,
            // Emit additional JavaScript to ease support for importing CommonJS modules.
            // This enables 'allowSyntheticDefaultImports' for type compatibility.
            esModuleInterop: true,
            // Ensure that casing is correct in imports.
            forceConsistentCasingInFileNames: true,
            /* ------------------------ */
            /* Type Checking            */
            /* ------------------------ */
            // Enable all strict type-checking options.
            strict: true,
            /* ------------------------ */
            /* Completeness             */
            /* ------------------------ */
            // Skip type checking all .d.ts files.
            skipLibCheck: true,
        };
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
     * グルーバルオブジェクトを設定する
     *
     * @param globals
     */
    setGlobals(globals) {
        this.globals = globals;
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
     * 出力時のminify化の可否を設定する
     *
     * @param minify
     */
    setMinfy(minify) {
        this.minify = minify;
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
        if (option.globals !== undefined && option.globals) {
            this.setGlobals(option.globals);
        }
        if (option.sourcemap !== undefined) {
            this.setSourceMap(option.sourcemap);
        }
        if (option.minify !== undefined) {
            this.setMinfy(option.minify);
        }
    }
    /**
     * コンパイルオプションを取得する
     * @returns
     */
    getCompileOption() {
        return Object.assign(this.typeScriptCompolerOption, this.compileOption);
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
        let bundle;
        try {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
            const typescriptConfig = {
                include: this.srcDir,
                exclude: this.ignoreDirNames,
                compilerOptions: this.getCompileOption(),
            };
            bundle = await rollup({
                input: srcPath,
                plugins: [nodeResolve(), typescript(typescriptConfig)],
            });
            const { output } = await bundle.generate({
                globals: this.globals,
                sourcemap: this.sourcemap,
            });
            let outputDir = path.dirname(outputPath);
            fs.mkdirSync(outputDir, { recursive: true });
            for (const chunkOrAsset of output) {
                if (chunkOrAsset.type === 'asset') {
                    fs.writeFileSync(path.join(outputDir, chunkOrAsset.fileName), chunkOrAsset.source);
                }
                else {
                    let outputCode = chunkOrAsset.code;
                    if (this.minify !== undefined && this.minify) {
                        const minifyResult = await minify(outputCode, { sourceMap: this.sourcemap });
                        outputCode = minifyResult.code;
                    }
                    else {
                        outputCode = js_beautify.js(outputCode, beautifyOption);
                    }
                    fs.writeFileSync(path.join(outputDir, chunkOrAsset.preliminaryFileName), outputCode.trim() + '\n');
                }
            }
        }
        catch (error) {
            console.error(error);
        }
        if (bundle) {
            await bundle.close();
        }
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        const entries = this.getEntryPoint();
        let bundle;
        let buildFailed = false;
        if (entries.size > 0) {
            try {
                const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
                const typescriptConfig = {
                    include: this.srcDir,
                    exclude: this.ignoreDirNames,
                    compilerOptions: Object.assign(this.typeScriptCompolerOption, this.compileOption),
                };
                const rollupPlugins = [nodeResolve(), typescript(typescriptConfig)];
                bundle = await rollup({
                    input: Object.fromEntries(entries),
                    plugins: rollupPlugins,
                });
                const { output } = await bundle.generate({
                    globals: this.globals,
                    sourcemap: this.sourcemap,
                });
                let outputPath;
                for (const chunkOrAsset of output) {
                    if (chunkOrAsset.type === 'asset') {
                        outputPath = path.join(this.outputDir, chunkOrAsset.fileName);
                        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                        fs.writeFileSync(outputPath, chunkOrAsset.source);
                    }
                    else {
                        outputPath = path.join(this.outputDir, chunkOrAsset.preliminaryFileName);
                        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                        let outputCode = chunkOrAsset.code;
                        if (this.minify !== undefined && this.minify) {
                            const minifyResult = await minify(outputCode, { sourceMap: this.sourcemap });
                            outputCode = minifyResult.code;
                        }
                        else {
                            outputCode = js_beautify.js(outputCode, beautifyOption);
                        }
                        fs.writeFileSync(outputPath, outputCode.trim() + '\n');
                    }
                }
            }
            catch (error) {
                buildFailed = true;
                console.error(error);
            }
            if (bundle) {
                await bundle.close();
            }
        }
        process.exit(buildFailed ? 1 : 0);
    }
}

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
        this.ignoreDirNames = ['node_modules'];
        /**
         * 出力時の拡張子
         */
        this.outpuExt = 'css';
        /**
         * コンパイラーのオプション
         */
        this.compilerOption = {};
        /**
         * インデックスファイルの名前
         */
        this.indexFileName = '_index.scss';
        /**
         * インデックスファイルの自動生成の可否
         */
        this.generateIndexFile = false;
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
     * インデックスファイル名の名前を設定する
     *
     * @param indexFileName
     */
    setIndexFileName(indexFileName) {
        this.indexFileName = indexFileName;
    }
    /**
     * インデックスファイル名の名前を設定する
     *
     * @param generateIndexFile
     */
    setGenerateIndexFile(generateIndexFile) {
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
    setOption(option) {
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
    getCompileOption() {
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
    async buildFile(srcPath, outputPath) {
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
    async buildAll() {
        const entries = this.getEntryPoint();
        if (entries.size > 0) {
            this.getEntryPointBaseDir();
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
                if (result.sourceMap) {
                    fs.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
                }
            });
        }
    }
}

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
        return this;
    }
    /**
     * テンプレート変数をロードする
     */
    loadTemplateVars() {
        const globPatterns = [this.varFileName, this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName];
        const varFiles = glob.sync(globPatterns);
        varFiles.forEach((varFilePath) => {
            const key = path.dirname(varFilePath);
            this.templateVars[key] = yaml.load(fs.readFileSync(varFilePath));
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
    isRootVarFile(varFilePath) {
        const baseDir = this.getEntryPointBaseDir();
        path.basename(varFilePath);
        const isProjectRootVarFile = varFilePath === this.varFileName;
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
    setOption(option) {
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
     * ファイルの監視及びビルド処理
     */
    watch() {
        this.buildAll();
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
                    }
                    else {
                        this.buildAll();
                        console.log('Compile All');
                    }
                }
                else {
                    const isRootVarFile = this.isRootVarFile(filePath);
                    if (isRootVarFile) {
                        //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
                        this.buildAll();
                        console.log('Compile All');
                    }
                    else {
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
            }
            catch (error) {
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
                    }
                    else {
                        this.buildAll();
                        console.log('Compile All');
                    }
                }
                else {
                    const isRootVarFile = this.isRootVarFile(filePath);
                    if (isRootVarFile) {
                        //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
                        this.buildAll();
                        console.log('Compile All');
                    }
                    else {
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
            }
            catch (error) {
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
    async buildFile(srcPath, outputPath) {
        nunjucks.configure(this.srcDir, this.compileOption);
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
        this.loadTemplateVars();
        let templatePath = srcPath;
        let html;
        const baseDir = this.getEntryPointBaseDir();
        if (baseDir) {
            templatePath = path.relative(baseDir, templatePath);
        }
        const templateVars = this.getTemplateVars(srcPath);
        html = nunjucks.render(templatePath, templateVars);
        html = js_beautify.html(html, beautifyOption);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        const entries = this.getEntryPoint();
        if (entries.size > 0) {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
            this.loadTemplateVars();
            nunjucks.configure(this.srcDir, this.compileOption);
            const baseDir = this.getEntryPointBaseDir();
            let templatePath;
            let outputPath;
            let html;
            let templateVars = {};
            entries.forEach(async (srcFile, entryPoint) => {
                templatePath = srcFile;
                outputPath = path.join(this.outputDir, entryPoint + '.' + this.outpuExt);
                if (baseDir) {
                    templatePath = path.relative(baseDir, templatePath);
                }
                templateVars = this.getTemplateVars(srcFile);
                html = nunjucks.render(templatePath, templateVars);
                html = js_beautify.html(html, beautifyOption);
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
            });
        }
    }
}

class configLoader {
    /**
     * 設定ファイルをロードする
     * @returns
     */
    static load() {
        if (configLoader.result === undefined) {
            const explorerSync = cosmiconfigSync('builder');
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
        if (allConfig && _.has(allConfig, 'disabled')) {
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
            ['disabled', 'js', 'css', 'html'].forEach((removeKey) => {
                _.unset(builderConfig, removeKey);
            });
        }
        if (overrideOption) {
            builderConfig = _.merge(_.cloneDeep(builderConfig), _.cloneDeep(overrideOption));
        }
        return builderConfig;
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
    c: { type: 'string', alias: 'config', description: '設定ファイルの指定' },
    sourcemap: { type: 'boolean', description: 'sourcemapファイルを出力する' },
    minify: { type: 'boolean', description: 'minify化するか否か' },
})
    .parseSync();
let mode = 'develop';
if (argv.mode !== undefined) {
    mode = String(argv.mode);
}
else if (argv.develop !== undefined) {
    mode = 'develop';
}
else if (argv.production !== undefined) {
    mode = 'production';
}
/**
 * ソースマップの出力オプション
 */
const jsOrverrideOption = {};
const cssOrverrideOption = {
    style: mode === 'develop' ? 'expanded' : 'compressed',
};
if (argv.sourcemap !== undefined) {
    jsOrverrideOption.sourcemap = true;
    cssOrverrideOption.sourcemap = true;
}
/**
 * minifyの出力オプション
 */
if (argv.minify !== undefined) {
    jsOrverrideOption.minify = true;
    cssOrverrideOption.style = 'compressed';
}
const builders = new Map();
if (!configLoader.isDisable('js')) {
    const builderOption = configLoader.getJsOption(jsOrverrideOption);
    builders.set('js', new typescriptBuilder(builderOption));
}
if (!configLoader.isDisable('css')) {
    const builderOption = configLoader.getCssOption(cssOrverrideOption);
    builders.set('css', new sassBuilder(builderOption));
}
if (!configLoader.isDisable('html')) {
    const builderOption = configLoader.getHtmlOption();
    builders.set('html', new nunjucksBuilder(builderOption));
}
if (argv.watch) {
    builders.forEach((builder) => {
        builder.watch();
    });
}
else {
    builders.forEach((builder) => {
        builder.build();
    });
}
