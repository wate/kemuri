#!/usr/bin/env node
import { b as baseBuilder } from './lib/base.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { find } from 'unist-util-find';
import { findAfter } from 'unist-util-find-after';
import { visit } from 'unist-util-visit';
import { findAllAfter } from 'unist-util-find-all-after';
import findAllBetween from 'unist-util-find-all-between';
import _ from 'lodash';
import yaml from 'js-yaml';
import { a as console, c as configLoader } from './lib/config.mjs';
import yargs from 'yargs';
import * as dotenv from 'dotenv';
import 'glob';
import 'chokidar';
import 'rimraf';
import 'editorconfig';
import 'node:url';
import 'cosmiconfig';
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
        this.srcDir = 'docs/cheatsheet';
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
            ['rs', 'rust'],
            ['sh', 'shellscript'],
            ['ts', 'typescript'],
            ['tsx', 'typescriptreact'],
            ['yml', 'yaml'],
        ]);
        /**
         * スニペットのヘッダーの深さ
         */
        this.snippetHeaderDeps = 2;
        /**
         * スニペット拡張設定のヘッダーの深さ
         */
        this.extraSettingHeaderDeps = 3;
        /**
         * スニペット拡張設定のヘッダーテキスト
         */
        this.extraSettingHeaderTexts = [
            'Snippet Setting',
            'Snippet Settings',
            'VSCode Extra Setting',
            'VSCode Extra Settings',
            'VSCode Snippet Setting',
            'VSCode Snippet Settings',
        ];
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
            return 'default';
        }
    }
    /**
     * スニペットのヘッダーの深さを設定する
     *
     * @param snippetHeaderDeps
     */
    setSnippetHeaderDeps(headerDeps) {
        this.snippetHeaderDeps = headerDeps;
    }
    /**
     * 拡張設定のヘッダーの深さを設定する
     *
     * @param headerDeps
     */
    setExtraSettingHeaderDeps(headerDeps) {
        this.extraSettingHeaderDeps = headerDeps;
    }
    /**
     * 拡張設定のヘッダーテキストを設定する
     *
     * @param extraSettingHeaderTexts
     */
    setExtraSettingHeaderTexts(extraSettingHeaderTexts) {
        if (typeof extraSettingHeaderTexts === 'string') {
            this.extraSettingHeaderTexts = [extraSettingHeaderTexts];
        }
        else {
            this.extraSettingHeaderTexts = extraSettingHeaderTexts;
        }
    }
    /**
     * スニペット拡張設定の開始位置判定用メソッド
     * @param node
     * @returns
     */
    extraSettingTestFunc(node) {
        if (node.type === 'heading' && node.depth === this.extraSettingHeaderDeps) {
            const textNode = find(node, { type: 'text' });
            const extraSettingHeaderTexts = this.extraSettingHeaderTexts.map((text) => text.toLowerCase());
            // @ts-ignore
            if (extraSettingHeaderTexts.includes(textNode.value.toLowerCase())) {
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
        const nextSnippetPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: this.snippetHeaderDeps });
        let endPosition = nextSnippetPosition;
        let extraSettingStartNode = null;
        if (nextSnippetPosition) {
            const extraSettingHeaders = findAllBetween(this.tree, startPosition, nextSnippetPosition, 
            //@ts-ignore
            this.extraSettingTestFunc.bind(this));
            if (extraSettingHeaders.length > 0) {
                extraSettingStartNode = extraSettingHeaders.pop();
            }
        }
        else {
            extraSettingStartNode = findAfter(this.tree, startPosition, this.extraSettingTestFunc.bind(this));
        }
        if (extraSettingStartNode) {
            endPosition = extraSettingStartNode;
        }
        return endPosition;
    }
    /**
     * スニペットの拡張設定を取得する
     * @param startPosition
     * @returns
     */
    getSnippetExtraSetting(startPosition) {
        let extraSetting = {};
        let extraSettingStartNode = null;
        const nextSnippetPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: this.snippetHeaderDeps });
        if (nextSnippetPosition) {
            const extraSettingHeaders = findAllBetween(this.tree, startPosition, nextSnippetPosition, 
            //@ts-ignore
            this.extraSettingTestFunc.bind(this));
            if (extraSettingHeaders.length > 0) {
                extraSettingStartNode = extraSettingHeaders.pop();
            }
        }
        else {
            extraSettingStartNode = findAfter(this.tree, startPosition, this.extraSettingTestFunc.bind(this));
        }
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
     * @param group
     * @returns
     */
    loadSnippetData(group) {
        const targetFiles = this.findEntryPointFiles();
        if (targetFiles.length === 0) {
            return;
        }
        targetFiles.forEach((targetFile) => {
            //スニペットのグループ名を取得する
            const groupName = this.getGroupName(targetFile);
            if (group && group !== groupName) {
                //グループ名に一致しない場合はスキップする
                return;
            }
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
                let snippetCount = 0;
                visit(this.tree, { type: 'heading', depth: this.snippetHeaderDeps }, (node, index) => {
                    let snippetNameNode = find(node, { type: 'text' });
                    if (snippetNameNode) {
                        snippetCount++;
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
                        else {
                            console.warn('Not found snippet code: ' + snippetName);
                        }
                    }
                });
                if (snippetCount === 0) {
                    console.warn('Not found snippets.');
                }
            }
            console.groupEnd();
        });
    }
    /**
     * スニペットファイルを出力する
     */
    buildSnippet() {
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
    /**
     * -------------------------
     * 抽象化メソッドの実装
     * -------------------------
     */
    /**
     * 元ファイルのパスから出力先のパスを取得する
     * @param srcPath
     * @returns
     */
    convertOutputPath(srcPath) {
        const groupName = this.getGroupName(srcPath);
        return path.join(this.outputDir, groupName + '.' + this.outputExt);
    }
    /**
     * ビルドオプションを設定する
     *
     * @param option
     * @returns
     */
    setOption(option) {
        super.setOption(option);
        if (option.snippetHeaderLevel !== undefined && option.snippetHeaderLevel !== null) {
            this.setSnippetHeaderDeps(option.snippetHeaderLevel);
        }
        if (option.extraSettingHeaderLevel !== undefined && option.extraSettingHeaderLevel !== null) {
            this.setExtraSettingHeaderDeps(option.extraSettingHeaderLevel);
        }
        if (option.extraSettingHeaderTexts !== undefined && option.extraSettingHeaderTexts !== null) {
            this.setExtraSettingHeaderTexts(option.extraSettingHeaderTexts);
        }
    }
    /**
     * 単一ファイルのビルド処理
     * @param srcPath
     * @param outputPath
     */
    buildFile(srcPath, outputPath) {
        //ロード済みのスニペットデータをクリアする
        this.snipptes = {};
        const groupName = this.getGroupName(srcPath);
        this.loadSnippetData(groupName);
        this.buildSnippet();
    }
    /**
     * 全ファイルのビルド処理
     */
    buildAll() {
        this.loadSnippetData();
        this.buildSnippet();
    }
}

const snippetBuilder = new vscodeSnippetBuilder();

dotenv.config();
const argv = yargs(process.argv.slice(2))
    .options({
    w: { type: 'boolean', default: false, alias: 'watch', description: 'watchモードの指定' },
})
    .parseSync();
const builderOption = configLoader.getSnippetOption();
snippetBuilder.setOption(builderOption);
if (argv.watch) {
    snippetBuilder.watch();
}
else {
    snippetBuilder.build();
}
