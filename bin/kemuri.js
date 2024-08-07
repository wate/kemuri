#!/usr/bin/env node
import chalk from 'chalk';
import cpx from 'cpx2';
import fs$1 from 'fs-extra';
import yargs from 'yargs';
import * as path from 'node:path';
import * as glob from 'glob';
import { glob as glob$1 } from 'glob';
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import js_beautify from 'js-beautify';
import { c as console, a as configLoader } from './lib/config.mjs';
import _ from 'lodash';
import { b as baseBuilder } from './lib/base.mjs';
import micromatch from 'micromatch';
import * as fs from 'node:fs';
import { URL } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import nunjucks from 'nunjucks';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { rollup } from 'rollup';
import { g as getBrowserSyncOption, r as run } from './lib/browser-sync.mjs';
import 'node:child_process';
import 'cosmiconfig';
import 'duplexer3';
import 'shell-quote';
import 'dotenv';
import 'node:console';
import 'chokidar';
import 'editorconfig';
import 'browser-sync';

const beautify$2 = js_beautify.css;
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
         * -------------------------
         * このクラス固有のメンバ変数/メソッド
         * -------------------------
         */
        /**
         * 出力スタイルの設定
         */
        this.style = 'expanded';
        /**
         * SourceMapファイル出力の可否
         */
        this.sourcemap = null;
        /**
         * SassのloadPathsオプション
         */
        this.loadPaths = [];
        /**
         * インデックスファイルの自動生成の可否
         */
        this.generateIndex = false;
        /**
         * インデックスファイルの名前
         */
        this.indexFileName = '_index.scss';
        /**
         * インデックスファイルにインポートする際の方法
         */
        this.indexImportType = 'forward';
        /**
         * インデックスファイルの自動生成を行う際の除外設定
         */
        this.generateIndexIgnore = {};
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
     * インデックスファイル自動生成時に除外するファイル/ディレクトリ名の設定
     *
     * @param generateIndexIgnore
     */
    setGenerateIndexIgnore(generateIndexIgnore) {
        this.generateIndexIgnore = generateIndexIgnore;
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
        const fileExtPattern = this.convertGlobPattern(this.fileExts);
        const ignorePatterns = [];
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
            fs$1.remove(indexFilePath);
            console.log('Remove index file: ' + indexFilePath);
        }
        else {
            const partialFilesChildren = [];
            const partialFilesFiles = [];
            const partialFiles = {
                children: partialFilesChildren,
                files: partialFilesFiles,
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
                if (indexFileContentBefore !== indexFileContent) {
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
            let generateIndexIgnore = {};
            if (option.generateIndexIgnore !== undefined) {
                generateIndexIgnore = option.generateIndexIgnore;
            }
            else {
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
    getCompileOption() {
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
    watchAddCallBack(filePath) {
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
    watchChangeCallBack(filePath) {
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
    watchUnlinkCallBack(filePath) {
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
    async buildFile(srcPath, outputPath) {
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
                    css = beautify$2(css, beautifyOption);
                }
                fs$1.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs$1.writeFileSync(outputPath, css.trim() + '\n');
            });
            if (result.sourceMap) {
                fs$1.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
            }
        }
        catch (error) {
            fs$1.mkdirSync(path.dirname(outputPath), { recursive: true });
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
            fs$1.writeFileSync(outputPath, cssContent + '\n');
            throw error;
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
            const fileExtPattern = this.convertGlobPattern(this.fileExts);
            const partialFilePattern = path.join(this.srcDir, '**/_*.' + fileExtPattern);
            let partialFiles = glob.sync(partialFilePattern);
            let ignorePatterns = [];
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
                    .sort((a, b) => b.length - a.length)
                    .filter((generateIndexDir) => {
                    // 除外パターンにマッチしないものを返す
                    return !micromatch.isMatch(generateIndexDir, ignorePatterns);
                })
                    // ディレクトリ名のみに変換
                    .map((partialFile) => {
                    return path.dirname(partialFile);
                })
                    // 重複を除外
                    .reduce((unique, item) => {
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
                    .forEach((generateIndexDir) => {
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
            const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outputExt);
            const result = sass.compile(srcFile, compileOption);
            postcss([autoprefixer])
                .process(result.css, { from: srcFile })
                .then((result) => {
                result.warnings().forEach((warn) => {
                    console.warn(warn.toString());
                });
                let css = result.css.toString();
                if (compileOption.style !== 'compressed' && this.beautify) {
                    css = beautify$2(css, beautifyOption);
                }
                fs$1.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs$1.writeFileSync(outputPath, css.trim() + '\n');
                console.log('Compile: ' + srcFile + ' => ' + outputPath);
            });
            if (result.sourceMap) {
                fs$1.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
            }
        });
    }
}

const cssBuilder = new sassBuilder();

const beautify$1 = js_beautify.html;
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
         * 整形のオプション
         */
        this.beautify = true;
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
        const globPatterns = [
            this.varFileName,
            this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName,
        ];
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
        templateVars = this.expandTemplateVars(templateVars);
        //テンプレートファイル用変数を設定
        let _path = path.relative(this.srcDir, srcFile);
        _path = _path.slice(0, (path.extname(srcFile).length * -1));
        const _file = {
            path: _path,
            dirname: path.dirname(_path) !== '.' ? path.dirname(_path) : '',
            basename: path.basename(_path),
            extname: path.extname(srcFile).slice(1),
        };
        templateVars._file = _file;
        return templateVars;
    }
    /**
     * テンプレート変数内のテンプレート文字列を展開する
     * @todo テンプレート変数内のテンプレート文字列を展開する
     * @param templateVars
     * @returns
     */
    expandTemplateVars(expandTemplateVars) {
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
        if (entries.size === 0 ||
            (!this.generateSiteMap && !this.generatePageList)) {
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
        const sitemapFileContent = nunjucks.renderString(this.sitemapTemplate, {
            pages: pageList,
        });
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
            this.convertGlobPattern(this.srcDir) +
                '/**/*.' +
                this.convertGlobPattern(watchFileExts),
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
        const addFileName = path.basename(filePath);
        let compileFiles = [];
        if (addFileName !== this.varFileName) {
            this.getEntryPoint();
            const entryPointFiles = Array.from(this.entryPoint.values());
            if (entryPointFiles.includes(filePath)) {
                compileFiles.push(filePath);
            }
            else {
                compileFiles = entryPointFiles;
            }
        }
        else {
            const isRootVarFile = this.isRootVarFile(filePath);
            if (isRootVarFile) {
                compileFiles = Array.from(this.entryPoint.values());
            }
            else {
                //指定階層以下の変数ファイルが更新された場合は、その階層以下のファイルのみビルド
                this.entryPoint.forEach((srcFile) => {
                    if (srcFile.startsWith(path.dirname(filePath) + path.sep)) {
                        compileFiles.push(srcFile);
                    }
                });
            }
        }
        compileFiles.forEach((srcFile) => {
            const outputPath = this.convertOutputPath(srcFile);
            this.buildFile(srcFile, outputPath);
        });
        console.groupEnd();
    }
    /**
     * ファイル更新時のコールバック処理
     * @param filePath
     */
    watchChangeCallBack(filePath) {
        console.group('Update file: ' + filePath);
        const changeFileName = path.basename(filePath);
        let compileFiles = [];
        if (changeFileName !== this.varFileName) {
            const entryPointFiles = Array.from(this.entryPoint.values());
            if (entryPointFiles.includes(filePath)) {
                compileFiles.push(filePath);
            }
            else {
                compileFiles = entryPointFiles;
            }
        }
        else {
            const isRootVarFile = this.isRootVarFile(filePath);
            if (isRootVarFile) {
                compileFiles = Array.from(this.entryPoint.values());
            }
            else {
                //指定階層以下の変数ファイルが更新された場合は、その階層以下のファイルのみビルド
                this.entryPoint.forEach((srcFile) => {
                    if (srcFile.startsWith(path.dirname(filePath) + path.sep)) {
                        compileFiles.push(srcFile);
                    }
                });
            }
        }
        compileFiles.forEach((srcFile) => {
            const outputPath = this.convertOutputPath(srcFile);
            this.buildFile(srcFile, outputPath);
        });
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
        nunjucks.render(templatePath, templateVars, (error, result) => {
            console.log('  Compile: ' + srcPath + ' => ' + outputPath);
            let html = '';
            if (error) {
                console.error(error);
                html = '<html>';
                html += '<head>';
                html += '<title>' + error.name + '</title>';
                html += '</head>';
                html += '<body>';
                html += '<h1>' + error.name + '</h1>';
                html += '<p>';
                html += '<pre>' + error.message + '</pre>';
                html += '</p>';
                html += '</body>';
                html += '</html>';
            }
            else {
                html = result;
                if (this.beautify) {
                    html = beautify$1(html, beautifyOption);
                }
            }
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
        });
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
            if (this.beautify) {
                html = beautify$1(html, beautifyOption);
            }
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

const beautify = js_beautify.js;
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
         * エントリポイントから除外するファイル名の接尾語
         */
        this.ignoreFileSuffix = '.d';
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
         * 上書きするTypeScriptのコンパイルオプション
         */
        this.typeScriptCompoleOption = {
            /* ------------------------ */
            /* Language and Environment */
            /* ------------------------ */
            /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
            target: 'ES2020',
            /* Specify a set of bundled library declaration files that describe the target runtime environment. */
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            /* Specify what module code is generated. */
            module: 'ESNext',
            /* Specify how TypeScript looks up a file from a given module specifier. */
            moduleResolution: 'bundler',
            /* Use the package.json 'exports' field when resolving package imports. */
            resolvePackageJsonExports: true,
            /* Use the package.json 'imports' field when resolving imports. */
            resolvePackageJsonImports: true,
            /* Enable importing .json files. */
            resolveJsonModule: true,
            /* ------------------ */
            /* JavaScript Support */
            /* ------------------ */
            /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
            allowJs: true,
            /* Enable error reporting in type-checked JavaScript files. */
            checkJs: true,
            /* ------------------- */
            /* Interop Constraints */
            /* ------------------- */
            /* Ensure that each file can be safely transpiled without relying on other imports. */
            // "isolatedModules": true,
            /* Allow 'import x from y' when a module doesn't have a default export. */
            allowSyntheticDefaultImports: true,
            /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
            esModuleInterop: true,
            /* Ensure that casing is correct in imports. */
            forceConsistentCasingInFileNames: true,
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
         * 置換オプション
         */
        this.replace = {
            'process.env.NODE_ENV': JSON.stringify('production'),
        };
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
     * 置換オプションを設定する
     * @param replace
     */
    setReplace(replace) {
        this.replace = replace;
    }
    /**
     * SourceMap出力の可否
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
        if (option.globals !== undefined &&
            option.globals !== null &&
            Object.keys(option.globals).length > 0) {
            this.setGlobals(option.globals);
        }
        if (option.format !== undefined && option.format !== null) {
            this.setOutputFormat(option.format);
        }
        if (option.replace !== undefined && option.replace !== null) {
            this.setReplace(option.replace);
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
            const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
            const typescriptConfig = {
                include: this.srcDir,
                exclude: this.ignoreDirNames,
                tsconfig: fs.existsSync(tsconfigPath) ? tsconfigPath : undefined,
                compilerOptions: this.getCompileOption(),
            };
            const replaceOption = {
                preventAssignment: true,
                values: this.replace,
            };
            const rollupPlugins = [
                nodeResolve(),
                commonjs(),
                typescript(typescriptConfig),
                replace(replaceOption),
            ];
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
            const outputDir = path.dirname(outputPath);
            fs.mkdirSync(outputDir, { recursive: true });
            for (const chunkOrAsset of output) {
                if (chunkOrAsset.type === 'asset') {
                    fs.writeFileSync(path.join(outputDir, chunkOrAsset.fileName), chunkOrAsset.source);
                }
                else {
                    let outputCode = chunkOrAsset.code;
                    if ((this.minify === undefined || !this.minify) && this.beautify) {
                        outputCode = beautify(outputCode, beautifyOption);
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
            const replaceOption = {
                preventAssignment: true,
                values: this.replace,
            };
            const rollupPlugins = [
                nodeResolve(),
                commonjs(),
                typescript(typescriptConfig),
                replace(replaceOption),
            ];
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
                    if ((this.minify === undefined || !this.minify) && this.beautify) {
                        outputCode = beautify(outputCode, beautifyOption);
                    }
                    fs.writeFileSync(outputPath, outputCode.trim() + '\n');
                    console.log('Compile: ' +
                        path.join(this.srcDir, chunkOrAsset.fileName) +
                        ' => ' +
                        outputPath);
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

const argv = yargs(process.argv.slice(2))
    .options({
    w: {
        type: 'boolean',
        default: false,
        alias: 'watch',
        description: 'watchモード',
    },
    m: {
        type: 'string',
        choices: ['develop', 'production'],
        alias: 'mode',
        description: 'ビルド処理のモード指定',
    },
    p: {
        type: 'boolean',
        alias: ['prod', 'production'],
        description: '本番モード指定のショートハンド',
    },
    d: {
        type: 'boolean',
        alias: ['dev', 'develop'],
        description: '開発モード指定のショートハンド',
    },
    html: { type: 'boolean', description: 'HTMLのビルド機能を利用する' },
    css: { type: 'boolean', description: 'CSSのビルド機能をを利用する' },
    js: { type: 'boolean', description: 'JSのビルド機能を利用する' },
    copy: { type: 'boolean', description: 'コピー機能を利用する' },
    server: { type: 'boolean', description: 'browserSyncサーバーを起動する' },
    c: {
        type: 'string',
        alias: 'config',
        description: '設定ファイルを指定する',
    },
    init: { type: 'boolean', description: 'プロジェクトの初期設定を行う' },
    force: {
        type: 'boolean',
        default: false,
        alias: 'f',
        description: '設定ファイルを強制的に上書きする',
    },
    configOnly: {
        type: 'boolean',
        default: false,
        description: '設定ファイルのみを出力する',
    },
    clean: {
        type: 'boolean',
        default: false,
        description: 'ビルド前に出力ディレクトリを空にする',
    },
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
    if (fs$1.existsSync('tsconfig.json')) {
        if (argv.force) {
            configLoader.copyDefaultTSConfig(argv.force);
            console.log(chalk.green('Configuration file(tsconfig.json) has been overwritten.'));
        }
        else {
            console.warn('Configuration file(tsconfig.json) already exists.');
        }
    }
    if (argv.configOnly) {
        process.exit(0);
    }
    const createDirectories = [];
    const htmlBuilderOption = configLoader.getHtmlOption();
    createDirectories.push(
    // @ts-ignore
    htmlBuilderOption.srcDir !== undefined ? htmlBuilderOption.srcDir : 'src');
    createDirectories.push(
    //@ts-ignore
    htmlBuilderOption.outputDir !== undefined
        ? //@ts-ignore
            htmlBuilderOption.outputDir
        : 'public');
    const jsBuilderOption = configLoader.getJsOption();
    createDirectories.push(
    //@ts-ignore
    jsBuilderOption.srcDir !== undefined ? jsBuilderOption.srcDir : 'src');
    createDirectories.push(
    //@ts-ignore
    jsBuilderOption.outputDir !== undefined
        ? //@ts-ignore
            jsBuilderOption.outputDir
        : 'public/assets/js');
    const cssBuilderOption = configLoader.getCssOption();
    createDirectories.push(
    //@ts-ignore
    cssBuilderOption.srcDir !== undefined ? cssBuilderOption.srcDir : 'src');
    createDirectories.push(
    //@ts-ignore
    cssBuilderOption.outputDir !== undefined
        ? //@ts-ignore
            cssBuilderOption.outputDir
        : 'public/assets/css');
    const snippetBuilderOption = configLoader.getSnippetOption();
    //@ts-ignore
    createDirectories.push(
    //@ts-ignore
    snippetBuilderOption.srcDir !== undefined
        ? //@ts-ignore
            snippetBuilderOption.srcDir
        : 'docs/cheatsheet');
    createDirectories.push(
    //@ts-ignore
    snippetBuilderOption.outputDir !== undefined
        ? //@ts-ignore
            snippetBuilderOption.outputDir
        : '.vscode');
    const screenshotOption = configLoader.getScreenshotOption();
    //@ts-ignore
    createDirectories.push(
    //@ts-ignore
    screenshotOption.outputDir !== undefined
        ? //@ts-ignore
            screenshotOption.outputDir
        : 'screenshots');
    createDirectories
        .reduce((unique, item) => {
        if (!unique.includes(item)) {
            unique.push(item);
        }
        return unique;
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
// console.log(argv);
if (argv.mode !== undefined) {
    // @ts-ignore
    mode = String(argv.mode);
}
else if (argv.develop !== undefined) {
    mode = 'develop';
}
else if (argv.production !== undefined) {
    mode = 'production';
}
// console.log(mode);
if (argv.config !== undefined) {
    //@ts-ignore
    configLoader.configFile = argv.config;
}
const orverrideEnable = [];
const builders = [];
const outputDirectories = [];
if (configLoader.isEnable('js') || argv.js) {
    orverrideEnable.push('js');
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
    orverrideEnable.push('css');
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
    orverrideEnable.push('html');
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
    const browserSyncOption = getBrowserSyncOption({}, orverrideEnable);
    console.group(chalk.blue('browserSync Server Option'));
    console.log(browserSyncOption);
    console.groupEnd();
    run(browserSyncOption, orverrideEnable);
}
