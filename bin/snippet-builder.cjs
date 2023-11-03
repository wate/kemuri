#!/usr/bin/env node
'use strict';

var base = require('./common/base.cjs');
var fs = require('fs');
var path = require('path');
var micromarkExtensionFrontmatter = require('micromark-extension-frontmatter');
var mdastUtilFromMarkdown = require('mdast-util-from-markdown');
var mdastUtilFrontmatter = require('mdast-util-frontmatter');
var unistUtilFind = require('unist-util-find');
var unistUtilFindAfter = require('unist-util-find-after');
var unistUtilVisit = require('unist-util-visit');
var unistUtilFindAllAfter = require('unist-util-find-all-after');
var findAllBetween = require('unist-util-find-all-between');
var _ = require('lodash');
var yaml = require('js-yaml');
var dotenv = require('dotenv');
require('./common/console.cjs');
require('node:fs');
require('node:path');
require('glob');
require('chokidar');
require('rimraf');
require('editorconfig');
require('chalk');
require('node:console');

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
var dotenv__namespace = /*#__PURE__*/_interopNamespaceDefault(dotenv);

class vscodeSnippetBuilder extends base.baseBuilder {
    /**
     * コンストラクタ
     *
     * @param option
     */
    constructor(option) {
        super(option);
        /**
         * ソースコードのディレクトリ
         */
        this.srcDir = 'docs/snippet';
        /**
         * 出力先ディレクトリ
         */
        this.outputDir = '.vscode';
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['md'];
        /**
         * 出力時の拡張子
         */
        this.outputExt = 'code-snippets';
        /**
         * 言語コードに対応する言語名のマップ
         */
        this.languageMaps = new Map([
            ['js', 'javascript'],
            ['jsx', 'javascriptreact'],
            ['md', 'markdown'],
            ['py', 'python'],
            ['rb', 'ruby'],
            ['ru', 'rust'],
            ['sh', 'shellscript'],
            ['ts', 'typescript'],
            ['tsx', 'typescriptreact'],
            ['yml', 'yaml'],
        ]);
        /**
         * -------------------------
         * このクラスでのみ使用するメソッド
         * -------------------------
         */
        this.tree = {};
        /**
         * スニペットデータ
         */
        this.snipptes = {};
    }
    /**
     * スニペットのグループ名を取得する
     *
     * @param filePath
     * @returns
     */
    getGroupName(filePath) {
        const srcPath = path__namespace.relative(this.srcDir, filePath);
        if (srcPath.includes(path__namespace.sep)) {
            return srcPath.split(path__namespace.sep)[0];
        }
        else {
            return path__namespace.basename(srcPath, path__namespace.extname(srcPath));
        }
    }
    /**
     * スニペット拡張設定の開始位置判定用メソッド
     * @param node
     * @returns
     */
    extraSettingTestFunc(node) {
        if (node.type === 'heading' && node.depth === 3) {
            const textNode = unistUtilFind.find(node, { type: 'text' });
            // @ts-ignore
            if (textNode.value === 'VSCode Extra Setting') {
                return node;
            }
        }
    }
    /**
     * スニペットコードの終了位置を取得する
     * @param startPosition
     * @returns
     */
    getSnippetEndPosition(startPosition) {
        let endPosition = unistUtilFindAfter.findAfter(this.tree, startPosition, this.extraSettingTestFunc);
        if (!endPosition) {
            endPosition = unistUtilFindAfter.findAfter(this.tree, startPosition, { type: 'heading', depth: 2 });
        }
        return endPosition;
    }
    /**
     *
     * @param startPosition
     * @returns
     */
    getSnippetExtraSetting(startPosition) {
        let extraSetting = {};
        const extraSettingStartNode = unistUtilFindAfter.findAfter(this.tree, startPosition, this.extraSettingTestFunc);
        if (extraSettingStartNode) {
            const extraSettingNode = unistUtilFindAfter.findAfter(this.tree, extraSettingStartNode, { type: 'code' });
            if (extraSettingNode) {
                // @ts-ignore
                const tmpExtraSetting = yaml.load(extraSettingNode.value);
                if (tmpExtraSetting) {
                    extraSetting = tmpExtraSetting;
                    if (extraSetting.prefix !== undefined && extraSetting.prefix) {
                        extraSetting.prefix = typeof extraSetting.prefix === 'string' ? [extraSetting.prefix] : extraSetting.prefix;
                    }
                    if (extraSetting.scope === undefined && extraSetting.scope) {
                        extraSetting.scope = typeof extraSetting.scope === 'string' ? [extraSetting.scope] : extraSetting.scope;
                    }
                }
            }
        }
        return extraSetting;
    }
    /**
     * スニペットデータをロードする
     * @param name
     */
    loadSnippetData() {
        const targetFiles = this.findEntryPointFiles();
        if (targetFiles.length === 0) {
            return;
        }
        targetFiles.forEach((targetFile) => {
            //スニペットのグループ名を取得する
            const groupName = this.getGroupName(targetFile);
            this.tree = mdastUtilFromMarkdown.fromMarkdown(fs__namespace.readFileSync(targetFile, 'utf-8'), {
                extensions: [micromarkExtensionFrontmatter.frontmatter('yaml')],
                mdastExtensions: [mdastUtilFrontmatter.frontmatterFromMarkdown('yaml')],
            });
            console.group('Parse file:' + targetFile);
            const matter = unistUtilFind.find(this.tree, { type: 'yaml' });
            let meta = {};
            if (matter) {
                // @ts-ignore
                meta = yaml.load(matter.value);
            }
            if (meta?.draft) {
                console.warn('Skip draft file:' + targetFile);
            }
            else {
                const namePrefix = meta?.prefix ? meta.prefix : '';
                const nameSuffix = meta?.suffix ? meta.suffix : '';
                unistUtilVisit.visit(this.tree, { type: 'heading', depth: 2 }, (node, index) => {
                    let snippetNameNode = unistUtilFind.find(node, { type: 'text' });
                    if (snippetNameNode) {
                        // @ts-ignore
                        const snippetName = namePrefix + snippetNameNode.value + nameSuffix;
                        console.info('Snippet: ' + snippetName);
                        //スニペットの開始位置を取得する
                        const startPosition = node;
                        //スニペットの説明を取得する
                        let snippetDescription = null;
                        let snippets = null;
                        const firstParagraphNode = unistUtilFindAfter.findAfter(this.tree, startPosition, { type: 'paragraph' });
                        if (firstParagraphNode) {
                            const snippetDescriptionNode = unistUtilFind.find(firstParagraphNode, { type: 'text' });
                            if (snippetDescriptionNode) {
                                // @ts-ignore
                                snippetDescription = snippetDescriptionNode.value;
                            }
                        }
                        //スニペットのコードを取得する
                        const endPosition = this.getSnippetEndPosition(startPosition);
                        if (endPosition) {
                            snippets = findAllBetween(this.tree, startPosition, endPosition, { type: 'code' });
                        }
                        else {
                            snippets = unistUtilFindAllAfter.findAllAfter(this.tree, startPosition, { type: 'code' });
                        }
                        const extraSetting = this.getSnippetExtraSetting(startPosition);
                        if (extraSetting.scope === undefined && meta.scope) {
                            extraSetting.scope = typeof meta.scope === 'string' ? [meta.scope] : meta.scope;
                        }
                        if (snippets) {
                            // メンバー変数に格納する
                            snippets.forEach((snippet) => {
                                // スニペットの言語を取得する
                                // @ts-ignore
                                const snippetLang = this.languageMaps.get(snippet.lang) || snippet.lang;
                                if (this.snipptes[snippetName] === undefined) {
                                    this.snipptes[snippetName] = {
                                        name: snippetName,
                                        group: groupName,
                                        code: {},
                                        prefix: [snippetName],
                                        description: snippetDescription,
                                        extraSetting: extraSetting,
                                    };
                                }
                                if (this.snipptes[snippetName]['code'][snippetLang] !== undefined) {
                                    console.warn('Duplicate snippet code: ' + snippetName + ' / ' + snippetLang);
                                    console.log(snippet);
                                }
                                // @ts-ignore
                                this.snipptes[snippetName]['code'][snippetLang] = snippet.value;
                            });
                        }
                    }
                });
            }
            console.groupEnd();
        });
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
    buildFile(srcPath, outputPath) {
        if (Object.keys(this.snipptes).length === 0) {
            this.loadSnippetData();
        }
    }
    /**
     * 全ファイルのビルド処理
     */
    buildAll() {
        this.loadSnippetData();
        const groupdSnippets = _.groupBy(this.snipptes, 'group');
        Object.keys(groupdSnippets).forEach((groupName) => {
            //出力先ファイルパス
            const outputPath = path__namespace.join(this.outputDir, groupName + '.' + this.outputExt);
            const snippetData = {};
            groupdSnippets[groupName].forEach((snippet) => {
                let snippetPrefix = snippet.prefix;
                if (snippet.extraSetting.prefix) {
                    if (snippet.extraSetting.orverwrite) {
                        snippetPrefix = snippet.extraSetting.prefix;
                    }
                    else {
                        snippetPrefix = [...snippetPrefix, ...snippet.extraSetting.prefix];
                    }
                    snippetPrefix = _.uniq(snippetPrefix);
                }
                Object.keys(snippet.code).forEach((lang) => {
                    const snippetkey = snippet.name + '.' + lang;
                    const snippetBody = snippet.code[lang];
                    let snippetScope = [lang];
                    if (snippet.extraSetting.scope) {
                        if (snippet.extraSetting.orverwrite) {
                            snippetScope = snippet.extraSetting.scope;
                        }
                        else {
                            snippetScope = [...snippetScope, ...snippet.extraSetting.scope];
                        }
                        snippetScope = _.uniq(snippetScope);
                    }
                    snippetData[snippetkey] = {
                        prefix: snippetPrefix,
                        body: snippetBody,
                        scope: snippetScope.join(','),
                    };
                    snippetData[snippetkey].scope = snippetScope.join(',');
                    if (snippet.description) {
                        snippetData[snippetkey]['description'] = snippet.description;
                    }
                });
            });
            fs__namespace.writeFileSync(outputPath, JSON.stringify(snippetData, null, 2));
        });
    }
}

const snippetBuilder = new vscodeSnippetBuilder();

dotenv__namespace.config();
snippetBuilder.build();
