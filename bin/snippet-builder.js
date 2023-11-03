#!/usr/bin/env node
import { b as baseBuilder } from './common/base.mjs';
import * as fs from 'fs';
import * as path from 'path';
import { frontmatter } from 'micromark-extension-frontmatter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { find } from 'unist-util-find';
import { findAfter } from 'unist-util-find-after';
import { visit } from 'unist-util-visit';
import { findAllAfter } from 'unist-util-find-all-after';
import findAllBetween from 'unist-util-find-all-between';
import _ from 'lodash';
import yaml from 'js-yaml';
import * as dotenv from 'dotenv';
import './common/console.mjs';
import 'node:fs';
import 'node:path';
import 'glob';
import 'chokidar';
import 'rimraf';
import 'editorconfig';
import 'chalk';
import 'node:console';

class vscodeSnippetBuilder extends baseBuilder {
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
        const srcPath = path.relative(this.srcDir, filePath);
        if (srcPath.includes(path.sep)) {
            return srcPath.split(path.sep)[0];
        }
        else {
            return path.basename(srcPath, path.extname(srcPath));
        }
    }
    /**
     * スニペット拡張設定の開始位置判定用メソッド
     * @param node
     * @returns
     */
    extraSettingTestFunc(node) {
        if (node.type === 'heading' && node.depth === 3) {
            const textNode = find(node, { type: 'text' });
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
        let endPosition = findAfter(this.tree, startPosition, this.extraSettingTestFunc);
        if (!endPosition) {
            endPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: 2 });
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
        const extraSettingStartNode = findAfter(this.tree, startPosition, this.extraSettingTestFunc);
        if (extraSettingStartNode) {
            const extraSettingNode = findAfter(this.tree, extraSettingStartNode, { type: 'code' });
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
            this.tree = fromMarkdown(fs.readFileSync(targetFile, 'utf-8'), {
                extensions: [frontmatter('yaml')],
                mdastExtensions: [frontmatterFromMarkdown('yaml')],
            });
            console.group('Parse file:' + targetFile);
            const matter = find(this.tree, { type: 'yaml' });
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
                visit(this.tree, { type: 'heading', depth: 2 }, (node, index) => {
                    let snippetNameNode = find(node, { type: 'text' });
                    if (snippetNameNode) {
                        // @ts-ignore
                        const snippetName = namePrefix + snippetNameNode.value + nameSuffix;
                        console.info('Snippet: ' + snippetName);
                        //スニペットの開始位置を取得する
                        const startPosition = node;
                        //スニペットの説明を取得する
                        let snippetDescription = null;
                        let snippets = null;
                        const firstParagraphNode = findAfter(this.tree, startPosition, { type: 'paragraph' });
                        if (firstParagraphNode) {
                            const snippetDescriptionNode = find(firstParagraphNode, { type: 'text' });
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
                            snippets = findAllAfter(this.tree, startPosition, { type: 'code' });
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
            const outputPath = path.join(this.outputDir, groupName + '.' + this.outputExt);
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
            fs.writeFileSync(outputPath, JSON.stringify(snippetData, null, 2));
        });
    }
}

const snippetBuilder = new vscodeSnippetBuilder();

dotenv.config();
snippetBuilder.build();
