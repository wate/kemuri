#!/usr/bin/env node
import fs$1 from 'fs-extra';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { b as baseBuilder } from './lib/base.mjs';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import js_beautify from 'js-beautify';
import { c as console, a as configLoader } from './lib/config.mjs';
import * as glob from 'glob';
import { glob as glob$1 } from 'glob';
import * as sass from 'sass';
import { URL } from 'node:url';
import yaml from 'js-yaml';
import nunjucks from 'nunjucks';
import matter from 'gray-matter';
import _ from 'lodash';
import cpx from 'cpx';
import { g as getBrowserSyncOption, r as run } from './lib/browser-sync.mjs';
import yargs from 'yargs';
import chalk from 'chalk';
import 'chokidar';
import 'editorconfig';
import 'node:child_process';
import 'resolve';
import 'shell-quote';
import 'duplexer3';
import 'cosmiconfig';
import 'node:console';
import 'dotenv';
import 'browser-sync';

const beautify$2 = js_beautify.js;
/**
 * ビルド処理の抽象クラス
 */
class typescriptBuilder extends baseBuilder {
    constructor() {
        super(...arguments);
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
        this.outputExt = 'js';
        /**
         * -------------------------
         * このクラス固有のメンバ変数/メソッド
         * -------------------------
         */
        /**
         * TypeScriptのデフォルトのコンパイルオプション
         */
        this.typeScriptCompoleOption = {
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
        /**
         * ビルド時に設定するグローバルオブジェクトの内容
         */
        this.globals = {};
        /**
         * Roolup.jsに指定する出力形式
         */
        this.outputFortmat = 'esm';
        /**
         * Minyfy化のオプション
         * https://github.com/terser/terser#minify-options
         */
        this.minifyOption = {
            compress: {},
            mangle: {},
        };
    }
    /**
     * グルーバルオブジェクトを設定する
     *
     * @param globals
     */
    setGlobals(globals) {
        this.globals = globals;
    }
    /**
     * 出力形式を設定する
     *
     * @param format
     */
    setOutputFormat(format) {
        this.outputFortmat = format;
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
     * minify化のオプションを設定する
     *
     * @param minifyOption
     */
    setMinfyOption(minifyOption) {
        this.minifyOption = minifyOption;
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
        if (option.globals !== undefined && option.globals !== null && Object.keys(option.globals).length > 0) {
            this.setGlobals(option.globals);
        }
        if (option.format !== undefined && option.format !== null) {
            this.setOutputFormat(option.format);
        }
        if (option.sourcemap !== undefined && option.sourcemap !== null) {
            this.setSourceMap(option.sourcemap);
        }
        if (option.minify !== undefined && option.minify !== null) {
            this.setMinfy(option.minify);
        }
        if (option.minifyOption !== undefined && option.minifyOption !== null) {
            this.setMinfyOption(option.minifyOption);
        }
    }
    /**
     * -------------------------
     * 抽象化メソッドの実装
     * -------------------------
     */
    /**
     * コンパイルオプションを取得する
     * @returns
     */
    getCompileOption() {
        return Object.assign(this.typeScriptCompoleOption, this.compileOption);
    }
    /**
     * 単一ファイルのビルド処理
     * @param srcPath
     * @param outputPath
     */
    async buildFile(srcPath, outputPath) {
        let bundle;
        try {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
            const typescriptConfig = {
                include: this.srcDir,
                exclude: this.ignoreDirNames,
                compilerOptions: this.getCompileOption(),
            };
            const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig)];
            if (this.minify !== undefined && this.minify) {
                rollupPlugins.push(terser(this.minifyOption));
            }
            bundle = await rollup({
                external: Object.keys(this.globals),
                input: srcPath,
                plugins: rollupPlugins,
            });
            const { output } = await bundle.generate({
                globals: this.globals,
                format: this.outputFortmat,
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
                    if (this.minify === undefined || !this.minify) {
                        outputCode = beautify$2(outputCode, beautifyOption);
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
        // console.group('Build entory point files');
        const entries = this.getEntryPoint();
        let bundle;
        let buildFailed = false;
        if (entries.size === 0) {
            return;
        }
        try {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
            const typescriptConfig = {
                include: this.srcDir,
                exclude: this.ignoreDirNames,
                compilerOptions: this.getCompileOption(),
            };
            const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig)];
            if (this.minify !== undefined && this.minify) {
                rollupPlugins.push(terser(this.minifyOption));
            }
            bundle = await rollup({
                external: Object.keys(this.globals),
                input: Object.fromEntries(entries),
                plugins: rollupPlugins,
            });
            const { output } = await bundle.generate({
                globals: this.globals,
                format: this.outputFortmat,
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
                    if (this.minify === undefined || !this.minify) {
                        outputCode = beautify$2(outputCode, beautifyOption);
                    }
                    fs.writeFileSync(outputPath, outputCode.trim() + '\n');
                    console.log('Compile: ' + path.join(this.srcDir, chunkOrAsset.fileName) + ' => ' + outputPath);
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
        if (buildFailed) {
            throw new Error('Build Failed');
        }
        // console.groupEnd();
    }
}

const jsBuilder = new typescriptBuilder();

const beautify$1 = js_beautify.css;
/**
 * ビルド処理の抽象クラス
 */
class sassBuilder extends baseBuilder {
    constructor() {
        super(...arguments);
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
         * 出力時の拡張子
         */
        this.outputExt = 'css';
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
    }
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
            fs$1.remove(indexFilePath);
            console.log('Remove index file: ' + indexFilePath);
        }
        else {
            const partialFiles = {
                children: [],
                files: [],
            };
            partialMatchFiles.forEach((partialFile) => {
                if (partialFile.includes(path.sep)) {
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
            if (fs$1.existsSync(indexFilePath)) {
                const indexFileContentBefore = fs$1.readFileSync(indexFilePath, 'utf-8');
                if (indexFileContentBefore != indexFileContent) {
                    fs$1.writeFileSync(indexFilePath, indexFileContent);
                    console.log('Update index file: ' + indexFilePath);
                }
            }
            else {
                fs$1.writeFileSync(indexFilePath, indexFileContent);
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
        if (this.generateIndex && option.indexFileName !== undefined) {
            this.setIndexFileName(option.indexFileName);
        }
        if (this.generateIndex && option.indexImportType !== undefined) {
            this.setIndexImportType(option.indexImportType);
        }
        let sassLoadPaths = [this.srcDir, 'node_modules'];
        if (option.loadPaths !== undefined) {
            sassLoadPaths = option.loadPaths;
        }
        this.setLoadPaths(sassLoadPaths);
        /**
         * インデックスファイルの自動生成を行う場合は、
         * インデックスファイルをエントリポイントから除外する
         */
        if (this.generateIndex && !this.ignoreFileNames.includes(this.indexFileName)) {
            this.ignoreFileNames.push(this.indexFileName);
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
            fs$1.remove(outputPath);
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
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
        const result = sass.compile(srcPath, compileOption);
        if (compileOption.style !== 'compressed') {
            result.css = beautify$1(result.css, beautifyOption);
        }
        fs$1.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs$1.writeFileSync(outputPath, result.css.trim() + '\n');
        if (result.sourceMap) {
            fs$1.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
        }
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        // console.group('Build entory point files');
        const entries = this.getEntryPoint();
        if (this.generateIndex) {
            //インデックスファイルの生成/更新
            const partialFilePattern = path.join(this.srcDir, '**/_*.' + this.convertGlobPattern(this.fileExts));
            const partialFiles = glob.sync(partialFilePattern);
            if (partialFiles.length > 0) {
                partialFiles
                    .map((partialFile) => {
                    return path.dirname(partialFile);
                })
                    .reduce((unique, item) => {
                    return unique.includes(item) ? unique : [...unique, item];
                }, [])
                    .forEach((generateIndexDir) => {
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
            const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outputExt);
            const result = sass.compile(srcFile, compileOption);
            if (compileOption.style !== 'compressed') {
                result.css = beautify$1(result.css, beautifyOption);
            }
            fs$1.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs$1.writeFileSync(outputPath, result.css.trim() + '\n');
            console.log('Compile: ' + srcFile + ' => ' + outputPath);
            if (result.sourceMap) {
                fs$1.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
            }
        });
        // console.groupEnd();
    }
}

const cssBuilder = new sassBuilder();

const beautify = js_beautify.html;
/**
 * ファイルシステムローダーの拡張クラス
 */
class ExpandLoader extends nunjucks.FileSystemLoader {
    getSource(name) {
        const result = super.getSource(name);
        if (matter.test(result.src)) {
            const matterResult = matter(result.src);
            result.src = matterResult.content;
        }
        return result;
    }
}
/**
 * ビルド処理の抽象クラス
 */
class nunjucksBuilder extends baseBuilder {
    constructor() {
        super(...arguments);
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['njk', 'twig'];
        /**
         * 出力時の拡張子
         */
        this.outputExt = 'html';
        /**
         * コンパイルオプション
         */
        this.compileOption = {
            autoescape: false,
        };
        /**
         * -------------------------
         * このクラス固有のメンバ変数/メソッド
         * -------------------------
         */
        /**
         * 変数ファイルの名前
         */
        this.varFileName = 'vars.yml';
        /**
         * サイトURL
         */
        this.siteUrl = 'http://localhost:3000/';
        /**
         * サイトマップファイルの生成の可否
         */
        this.generateSiteMap = true;
        /**
         * サイトマップファイルのテンプレート文字列
         */
        this.sitemapTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% for page in pages %}
  <url>
    <loc>{{ page.url }}</loc>
    <lastmod>{{ page_lastmod | default(page.lastmod) }}</lastmod>
    {% if page_changefreq is defined %}
    <changefreq>{{ page_changefreq }}</changefreq>
    {% endif %}
    {% if page_priority is defined %}
    <priority>{{ page_priority }}</priority>
    {% endif %}
  </url>
  {% endfor %}
</urlset>`;
        /**
         * ページリストの生成の可否
         */
        this.generatePageList = true;
        /**
         * テンプレート変数格納用メンバ変数
         */
        this.templateVars = {};
    }
    /**
     * 変数ファイル名を設定する
     *
     * @param varFileName
     */
    setVarFileName(varFileName) {
        this.varFileName = varFileName;
    }
    /**
     * サイトマップファイルの生成の可否を設定する
     * @param generateSiteMap
     */
    setGenerateSiteMap(generateSiteMap) {
        this.generateSiteMap = generateSiteMap;
    }
    /**
     * サイトのURLを設定する
     * @param siteUrl
     */
    setSiteUrl(siteUrl) {
        this.siteUrl = siteUrl;
    }
    /**
     * ページリストファイルの生成の可否を設定する
     * @param generatePageList
     */
    setGeneratePageList(generatePageList) {
        this.generatePageList = generatePageList;
    }
    /**
     * テンプレート変数をロードする
     */
    loadTemplateVars() {
        const globPatterns = [this.varFileName, this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName];
        const varFiles = glob$1.sync(globPatterns);
        varFiles.forEach((varFilePath) => {
            const key = path.dirname(varFilePath);
            // @ts-ignore
            this.templateVars[key] = yaml.load(fs.readFileSync(varFilePath));
        });
        /**
         * エントリポイントファイル内の変数を取得する
         */
        const entryPointFiles = this.findEntryPointFiles();
        entryPointFiles.forEach((srcFile) => {
            const matterResult = matter.read(srcFile);
            this.templateVars[srcFile] = matterResult.data ? matterResult.data : {};
        });
    }
    /**
     * テンプレートに対応する変数を取得する
     * @param srcFile
     * @returns
     */
    getTemplateVars(srcFile) {
        let templateVars = this.templateVars['.'] ?? {
            siteUrl: this.siteUrl,
        };
        let key = '';
        const srcFilePaths = path.dirname(srcFile).split(path.sep);
        srcFilePaths.forEach((dirName) => {
            key = path.join(key, dirName);
            if (this.templateVars[key]) {
                templateVars = _.merge(templateVars, this.templateVars[key]);
            }
        });
        if (this.templateVars[srcFile] !== undefined) {
            templateVars = _.merge(templateVars, this.templateVars[srcFile]);
        }
        //テンプレート変数を展開
        templateVars = this.expandTemplateVars(templateVars);
        //ページスコープ用の変数を設定
        let pageScope = path.dirname(path.relative(this.srcDir, srcFile));
        if (pageScope === '.') {
            pageScope = '';
        }
        templateVars['_scope'] = pageScope;
        return templateVars;
    }
    /**
     * テンプレート変数内のテンプレート文字列を展開する
     * @todo テンプレート変数内のテンプレート文字列を展開する
     * @param templateVars
     * @returns
     */
    expandTemplateVars(expandTemplateVars, templateVars = {}) {
        const expandedTemplateVars = expandTemplateVars;
        return expandedTemplateVars;
    }
    /**
     * ルートディレクトリの変数ファイルかどうかを判定する
     *
     * @param filePath
     * @returns
     */
    isRootVarFile(varFilePath) {
        const isProjectRootVarFile = varFilePath === this.varFileName;
        const isSrcRootVarFile = path.join(this.srcDir, this.varFileName) === varFilePath;
        return isProjectRootVarFile || isSrcRootVarFile;
    }
    /**
     * サイトマップファイル/ページリストファイルを生成する
     * @returns
     */
    generateIndexFile() {
        const entries = this.getEntryPoint();
        if (entries.size === 0 || (!this.generateSiteMap && !this.generatePageList)) {
            return;
        }
        const pageList = [];
        entries.forEach((srcFile, entryPoint) => {
            const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outputExt);
            const pageUrl = new URL('/' + path.relative(this.outputDir, outputPath), this.siteUrl).toString();
            const pagelastmod = fs.statSync(srcFile).mtime.toISOString();
            const pageInfo = {
                srcFile: srcFile,
                url: pageUrl,
                lastmod: pagelastmod,
                variables: this.getTemplateVars(srcFile),
            };
            pageList.push(pageInfo);
        });
        if (this.generateSiteMap) {
            this.generateSitemapFile(pageList);
        }
        if (this.generatePageList) {
            this.generatePageListFile(pageList);
        }
    }
    /**
     * サイトマップファイルを生成する
     * @param pageList
     */
    generateSitemapFile(pageList) {
        const sitemapFileContent = nunjucks.renderString(this.sitemapTemplate, { pages: pageList });
        const siteMapPath = path.join(this.outputDir, 'sitemap.xml');
        fs.mkdirSync(path.dirname(siteMapPath), { recursive: true });
        fs.writeFileSync(siteMapPath, sitemapFileContent.replace(/^\s*\r?\n/gm, '').trim() + '\n', 'utf-8');
        console.log('Generate sitemap file: ' + siteMapPath);
    }
    /**
     * ページリストファイルを生成する
     * @param pageList
     */
    generatePageListFile(pageList) {
        const pageListFilePath = 'pages.json';
        fs.mkdirSync(path.dirname(pageListFilePath), { recursive: true });
        fs.writeFileSync(pageListFilePath, JSON.stringify({ pages: pageList }, null, 2), 'utf-8');
        console.log('Generate page list file: ' + pageListFilePath);
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
        if (option.generateSiteMap !== undefined) {
            this.setGenerateSiteMap(option.generateSiteMap);
        }
        if (option.siteUrl !== undefined) {
            this.setSiteUrl(option.siteUrl);
        }
        if (option.generatePageList !== undefined) {
            this.setGeneratePageList(option.generatePageList);
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
            const addFileName = path.basename(filePath);
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
        console.groupEnd();
    }
    /**
     * ファイル更新時のコールバック処理
     * @param filePath
     */
    watchChangeCallBack(filePath) {
        console.group('Update file: ' + filePath);
        try {
            const changeFileName = path.basename(filePath);
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
        nunjucks.Loader.extend(new ExpandLoader());
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
        this.loadTemplateVars();
        const templatePath = path.relative(this.srcDir, srcPath);
        const templateVars = this.getTemplateVars(srcPath);
        let html = nunjucks.render(templatePath, templateVars);
        html = beautify(html, beautifyOption);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        // console.group('Build entory point files');
        const entries = this.getEntryPoint();
        if (entries.size === 0) {
            return;
        }
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
        this.loadTemplateVars();
        nunjucks.configure(this.srcDir, this.compileOption);
        nunjucks.Loader.extend(new ExpandLoader());
        entries.forEach((srcFile, entryPoint) => {
            const templatePath = path.relative(this.srcDir, srcFile);
            const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outputExt);
            const templateVars = this.getTemplateVars(srcFile);
            let html = nunjucks.render(templatePath, templateVars);
            html = beautify(html, beautifyOption);
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
            console.log('Compile: ' + srcFile + ' => ' + outputPath);
        });
        // console.groupEnd();
        //サイトマップファイル/ページリストファイルの生成
        if (this.generateSiteMap || this.generatePageList) {
            this.generateIndexFile();
        }
    }
}

const htmlBuilder = new nunjucksBuilder();

const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモード' },
    m: {
        type: 'string',
        choices: ['develop', 'production'],
        default: 'develop',
        alias: 'mode',
        description: 'ビルド処理のモード指定',
    },
    p: { type: 'boolean', alias: ['prod', 'production'], description: '本番モード指定のショートハンド' },
    d: { type: 'boolean', alias: ['dev', 'develop'], description: '開発モード指定のショートハンド' },
    html: { type: 'boolean', description: 'HTMLのビルド機能を利用する' },
    css: { type: 'boolean', description: 'CSSのビルド機能をを利用する' },
    js: { type: 'boolean', description: 'JSのビルド機能を利用する' },
    copy: { type: 'boolean', description: 'コピー機能を利用する' },
    server: { type: 'boolean', description: 'browserSyncサーバーを起動する' },
    c: { type: 'string', alias: 'config', description: '設定ファイルを指定する' },
    init: { type: 'boolean', description: 'プロジェクトの初期設定を行う' },
    force: { type: 'boolean', default: false, alias: 'f', description: '設定ファイルを強制的に上書きする' },
    configOnly: { type: 'boolean', default: false, description: '設定ファイルのみを出力する' },
    clean: { type: 'boolean', default: false, description: 'ビルド前に出力ディレクトリを空にする' },
})
    .parseSync();
if (argv.init) {
    if (fs$1.existsSync('.builderrc.yml')) {
        if (argv.force) {
            configLoader.copyDefaultConfig(argv.force);
            console.log(chalk.green('Configuration file(.builderrc.yml) has been overwritten.'));
        }
        else {
            console.warn('Configuration file(.builderrc.yml) already exists.');
        }
    }
    else {
        configLoader.copyDefaultConfig(argv.force);
        console.log(chalk.green('Configuration file(.builderrc.yml) has been generated.'));
    }
    if (argv.configOnly) {
        process.exit(0);
    }
    const createDirectories = [];
    const htmlBuilderOption = configLoader.getHtmlOption();
    //@ts-ignore
    createDirectories.push(htmlBuilderOption.srcDir !== undefined ? htmlBuilderOption.srcDir : 'src');
    //@ts-ignore
    createDirectories.push(htmlBuilderOption.outputDir !== undefined ? htmlBuilderOption.outputDir : 'public');
    const jsBuilderOption = configLoader.getJsOption();
    //@ts-ignore
    createDirectories.push(jsBuilderOption.srcDir !== undefined ? jsBuilderOption.srcDir : 'src');
    //@ts-ignore
    createDirectories.push(jsBuilderOption.outputDir !== undefined ? jsBuilderOption.outputDir : 'public/assets/js');
    const cssBuilderOption = configLoader.getCssOption();
    //@ts-ignore
    createDirectories.push(cssBuilderOption.srcDir !== undefined ? cssBuilderOption.srcDir : 'src');
    //@ts-ignore
    createDirectories.push(cssBuilderOption.outputDir !== undefined ? cssBuilderOption.outputDir : 'public/assets/css');
    const snippetBuilderOption = configLoader.getSnippetOption();
    //@ts-ignore
    createDirectories.push(snippetBuilderOption.srcDir !== undefined ? snippetBuilderOption.srcDir : 'docs/cheatsheet');
    //@ts-ignore
    createDirectories.push(snippetBuilderOption.outputDir !== undefined ? snippetBuilderOption.outputDir : '.vscode');
    const screenshotOption = configLoader.getScreenshotOption();
    //@ts-ignore
    createDirectories.push(screenshotOption.outputDir !== undefined ? screenshotOption.outputDir : 'screenshots');
    createDirectories
        .reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
    }, [])
        .sort()
        .forEach((dir) => {
        if (!fs$1.existsSync(dir)) {
            console.log(chalk.green('Create directory: ' + dir));
            fs$1.mkdirSync(dir, { recursive: true });
        }
    });
    process.exit(0);
}
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
if (argv.config !== undefined) {
    //@ts-ignore
    configLoader.configFile = argv.config;
}
const builders = [];
const outputDirectories = [];
if (configLoader.isEnable('js') || argv.js) {
    const jsOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        jsOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        jsOrverrideOption.minify = true;
    }
    const jsBuilderOption = configLoader.getJsOption(jsOrverrideOption);
    console.group(chalk.blue('JavaScript Builder Option'));
    console.log(jsBuilderOption);
    console.groupEnd();
    jsBuilder.setOption(jsBuilderOption);
    outputDirectories.push(jsBuilder.getOutputDir());
    builders.push(jsBuilder);
}
if (configLoader.isEnable('css') || argv.css) {
    const cssOrverrideOption = {};
    if (argv.sourcemap !== undefined) {
        cssOrverrideOption.sourcemap = true;
    }
    if (argv.minify !== undefined || mode === 'production') {
        cssOrverrideOption.style = 'compressed';
    }
    const cssBuilderOption = configLoader.getCssOption(cssOrverrideOption);
    console.group(chalk.blue('CSS Builder Option'));
    console.log(cssBuilderOption);
    console.groupEnd();
    cssBuilder.setOption(cssBuilderOption);
    outputDirectories.push(cssBuilder.getOutputDir());
    builders.push(cssBuilder);
}
if (configLoader.isEnable('html') || argv.html) {
    const htmlBuilderOption = configLoader.getHtmlOption();
    console.group(chalk.blue('HTML Builder Option'));
    console.log(htmlBuilderOption);
    console.groupEnd();
    htmlBuilder.setOption(htmlBuilderOption);
    outputDirectories.push(htmlBuilder.getOutputDir());
    builders.push(htmlBuilder);
}
let copyFiles = [];
if (configLoader.isEnable('copy') || argv.copy) {
    copyFiles = configLoader.getCopyOption();
    copyFiles.forEach((copyOption) => {
        outputDirectories.push(copyOption.dest);
    });
    console.group(chalk.blue('Copy Option'));
    console.log(copyFiles);
    console.groupEnd();
}
if (argv.clean) {
    //出力先ディレクトリを空にする
    console.log(chalk.yellow('Clean up output directories'));
    outputDirectories
        .sort()
        .reverse()
        .forEach((dir) => {
        console.log(chalk.yellow('Remove directory: ' + dir));
        fs$1.emptyDirSync(dir);
    });
}
builders.forEach((builder) => {
    builder.buildAll();
});
copyFiles.forEach((copyOption) => {
    cpx.copy(copyOption.src, copyOption.dest, copyOption);
});
if (argv.watch) {
    builders.forEach((builder) => {
        builder.watch();
    });
    if (copyFiles.length > 0) {
        console.group(chalk.blue('Watch files'));
        console.log(copyFiles.map((copyOption) => copyOption.src));
        console.groupEnd();
        copyFiles.forEach((copyOption) => {
            cpx.watch(copyOption.src, copyOption.dest, Object.assign(copyOption, { initialCopy: false }));
        });
    }
}
if (argv.server) {
    const browserSyncOption = getBrowserSyncOption();
    console.group(chalk.blue('browserSync Server Option'));
    console.log(browserSyncOption);
    console.groupEnd();
    run();
}
