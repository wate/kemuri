import { baseBuilder, builderOption } from '../base';
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
import console from '../../console';

/**
 * スニペットビルダーの設定オプション
 */
export interface vscodeSnippetBuilderOption extends builderOption {
  snippetHeaderLevel?: number;
  extraSettingHeaderLevel?: number;
  extraSettingHeaderTexts?: string | string[];
}

export class vscodeSnippetBuilder extends baseBuilder {
  /**
   * ソースコードのディレクトリ
   */
  protected srcDir = 'docs/cheatsheet';

  /**
   * 出力先ディレクトリ
   */
  protected outputDir = '.vscode';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts = ['md'];

  /**
   * 出力時の拡張子
   */
  protected outputExt = 'code-snippets';

  /**
   * 言語コードに対応する言語名のマップ
   */
  private languageMaps: Map<string, string> = new Map([
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
  protected snippetHeaderDeps: number = 2;

  /**
   * スニペット拡張設定のヘッダーの深さ
   */
  protected extraSettingHeaderDeps: number = 3;

  /**
   * スニペット拡張設定のヘッダーテキスト
   */
  protected extraSettingHeaderTexts: string[] = [
    'Snippet Setting',
    'Snippet Settings',
    'VSCode Extra Setting',
    'VSCode Extra Settings',
    'VSCode Snippet Setting',
    'VSCode Snippet Settings',
  ];

  /**
   * コンストラクタ
   *
   * @param option
   */
  constructor(option?: vscodeSnippetBuilderOption) {
    super(option);
  }

  /**
   * -------------------------
   * このクラスでのみ使用するメソッド
   * -------------------------
   */

  protected tree: any = {};

  /**
   * スニペットデータ
   */
  protected snipptes: any = {};

  /**
   * スニペットのグループ名を取得する
   *
   * @param filePath
   * @returns
   */
  protected getGroupName(filePath: string): string {
    const srcPath = path.relative(this.srcDir, filePath);
    if (srcPath.includes(path.sep)) {
      return srcPath.split(path.sep)[0];
    } else {
      return 'default';
    }
  }

  /**
   * スニペットのヘッダーの深さを設定する
   *
   * @param snippetHeaderDeps
   */
  public setSnippetHeaderDeps(headerDeps: number): void {
    this.snippetHeaderDeps = headerDeps;
  }

  /**
   * 拡張設定のヘッダーの深さを設定する
   *
   * @param headerDeps
   */
  public setExtraSettingHeaderDeps(headerDeps: number): void {
    this.extraSettingHeaderDeps = headerDeps;
  }
  /**
   * 拡張設定のヘッダーテキストを設定する
   *
   * @param extraSettingHeaderTexts
   */
  public setExtraSettingHeaderTexts(extraSettingHeaderTexts: string | string[]): void {
    if (typeof extraSettingHeaderTexts === 'string') {
      this.extraSettingHeaderTexts = [extraSettingHeaderTexts];
    } else {
      this.extraSettingHeaderTexts = extraSettingHeaderTexts;
    }
  }

  /**
   * スニペット拡張設定の開始位置判定用メソッド
   * @param node
   * @returns
   */
  protected extraSettingTestFunc(node: any): any {
    if (node.type === 'heading' && node.depth === this.extraSettingHeaderDeps) {
      const textNode = find(node, { type: 'text' });
      const extraSettingHeaderTexts = this.extraSettingHeaderTexts.map((text: string) => text.toLowerCase());
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
  protected getSnippetEndPosition(startPosition: any): any {
    const nextSnippetPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: this.snippetHeaderDeps });
    let endPosition: any = nextSnippetPosition;
    let extraSettingStartNode: any = null;
    if (nextSnippetPosition) {
      const extraSettingHeaders = findAllBetween(
        this.tree,
        startPosition,
        nextSnippetPosition,
        //@ts-ignore
        this.extraSettingTestFunc.bind(this),
      );
      if (extraSettingHeaders.length > 0) {
        extraSettingStartNode = extraSettingHeaders.pop();
      }
    } else {
      extraSettingStartNode = findAfter(this.tree, startPosition, this.extraSettingTestFunc.bind(this));
    }
    if (extraSettingStartNode) {
      endPosition = extraSettingStartNode;
    }
    return endPosition;
  }
  /**
   * スニペットの説明を取得する
   * @param startPosition
   * @returns
   */
  protected getSnippetDescription(startPosition: any): string | null {
    let description = null;
    const nextSnippetPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: this.snippetHeaderDeps });
    let descriptionNode = null;
    if (nextSnippetPosition) {
      const paragraphs = findAllBetween(this.tree, startPosition, nextSnippetPosition, { type: 'paragraph' });
      if (paragraphs.length > 0) {
        descriptionNode = paragraphs[0];
      }
    } else {
      descriptionNode = findAfter(this.tree, startPosition, { type: 'paragraph' });
    }
    if (descriptionNode) {
      // @ts-ignore
      const descriptionTextNode = find(descriptionNode, { type: 'text' });
      if (descriptionTextNode) {
        // @ts-ignore
        description = descriptionTextNode.value;
      }
    }
    return description;
  }
  /**
   * スニペットの拡張設定を取得する
   * @param startPosition
   * @returns
   */
  protected getSnippetExtraSetting(startPosition: any): any {
    let extraSetting: any = {};
    let extraSettingStartNode: any = null;
    const nextSnippetPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: this.snippetHeaderDeps });
    if (nextSnippetPosition) {
      const extraSettingHeaders = findAllBetween(
        this.tree,
        startPosition,
        nextSnippetPosition,
        //@ts-ignore
        this.extraSettingTestFunc.bind(this),
      );
      if (extraSettingHeaders.length > 0) {
        extraSettingStartNode = extraSettingHeaders.pop();
      }
    } else {
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
  protected loadSnippetData(group?: string): void {
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
      let meta: any = {};
      if (matter) {
        // @ts-ignore
        meta = yaml.load(matter.value);
      }
      if (meta?.draft) {
        console.warn('Skip draft file:' + targetFile);
      } else {
        const namePrefix = meta?.prefix ? meta.prefix : '';
        const nameSuffix = meta?.suffix ? meta.suffix : '';
        let snippetCount: number = 0;
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
            let snippetDescription: string | null = this.getSnippetDescription(startPosition);
            let snippets = null;

            //スニペットのコードを取得する
            const endPosition: any = this.getSnippetEndPosition(startPosition);
            if (endPosition) {
              snippets = findAllBetween(this.tree, startPosition, endPosition, { type: 'code' });
            } else {
              snippets = findAllAfter(this.tree, startPosition, { type: 'code' });
            }
            const extraSetting = this.getSnippetExtraSetting(startPosition);
            if (extraSetting.scope === undefined && meta.scope) {
              extraSetting.scope = typeof meta.scope === 'string' ? [meta.scope] : meta.scope;
            }
            if (snippets) {
              // メンバー変数に格納する
              snippets.forEach((snippet: any) => {
                let snippetLang: string = 'global';
                // スニペットの言語を取得する
                if (snippet.lang) {
                  snippet.lang = snippet.lang.toLowerCase();
                  snippetLang = this.languageMaps.get(snippet.lang) || snippet.lang;
                }
                if (this.snipptes[snippetName] === undefined) {
                  this.snipptes[snippetName] = {
                    name: snippetName,
                    group: groupName,
                    code: {},
                    prefix: [snippetName],
                    description: snippetDescription,
                  };
                }
                if (this.snipptes[snippetName]['code'][snippetLang] !== undefined) {
                  console.warn('Duplicate snippet code: ' + snippetName + ' / ' + snippetLang);
                  console.log(snippet);
                }
                // @ts-ignore
                this.snipptes[snippetName]['code'][snippetLang] = snippet.value;
                /**
                 * スニペットの拡張設定を設定する
                 */
                if (this.snipptes[snippetName].extraSetting === undefined) {
                  this.snipptes[snippetName].extraSetting = extraSetting;
                } else if (_.keys(extraSetting).length > 0) {
                  this.snipptes[snippetName].extraSetting[snippetLang] = extraSetting;
                }
              });
            } else {
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
  protected buildSnippet(): void {
    //出力先ディレクトリを作成する
    fs.mkdirSync(this.outputDir, { recursive: true });
    const groupdSnippets: any = _.groupBy(this.snipptes, 'group');
    Object.keys(groupdSnippets).forEach((groupName) => {
      //出力先ファイルパス
      const outputPath = path.join(this.outputDir, groupName + '.' + this.outputExt);
      const snippetData: any = {};
      groupdSnippets[groupName].forEach((snippet: any) => {
        let snippetPrefix: string[] = snippet.prefix;
        const extraSetting = snippet.extraSetting ?? {};
        /**
         * プレフィックスの設定
         */
        if (extraSetting.prefix) {
          if (extraSetting.orverwrite) {
            snippetPrefix = extraSetting.prefix;
          } else {
            snippetPrefix = [...snippetPrefix, ...extraSetting.prefix];
          }
          snippetPrefix = _.uniq(snippetPrefix);
        }
        Object.keys(snippet.code).forEach((lang) => {
          let langSnippetPrefix: string[] = snippetPrefix;
          let snippetName = snippet.name + '[' + lang + ']';
          let snippetScope: string[] = [lang];
          if (lang === 'global') {
            snippetName = snippet.name;
            snippetScope = [];
          }
          const snippetBody = snippet.code[lang];
          /**
           * 言語別のプレフィックス設定
           */
          if (extraSetting[lang] && extraSetting[lang].prefix) {
            let isPrefixOrverwrite = extraSetting.orverwrite !== undefined ? extraSetting.orverwrite : false;
            if (extraSetting[lang].orverwrite !== undefined) {
              isPrefixOrverwrite = extraSetting[lang].orverwrite;
            }
            if (isPrefixOrverwrite) {
              langSnippetPrefix = extraSetting[lang].prefix;
            } else {
              langSnippetPrefix = [...langSnippetPrefix, ...extraSetting[lang].prefix];
            }
            langSnippetPrefix = _.uniq(langSnippetPrefix);
          }
          /**
           * 言語別のスコープ設定
           */
          if (extraSetting.scope) {
            snippetScope = [...snippetScope, ...extraSetting.scope];
            snippetScope = _.uniq(snippetScope);
          } else if (extraSetting[lang] && extraSetting[lang].scope) {
            snippetScope = [...snippetScope, ...extraSetting[lang].scope];
            snippetScope = _.uniq(snippetScope);
          }
          /**
           * 言語別の説明設定
           */
          if (extraSetting.description !== undefined) {
            snippet.description = extraSetting.description;
          }
          if (extraSetting[lang] !== undefined && extraSetting[lang].description !== undefined) {
            snippet.description = extraSetting[lang].description;
          }
          snippetData[snippetName] = {
            prefix: langSnippetPrefix,
            body: snippetBody,
          };
          if (snippetScope.length > 0) {
            snippetData[snippetName]['scope'] = snippetScope.join(',');
          }
          if (snippet.description) {
            snippetData[snippetName]['description'] = snippet.description;
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
  protected convertOutputPath(srcPath: string): string {
    const groupName = this.getGroupName(srcPath);
    return path.join(this.outputDir, groupName + '.' + this.outputExt);
  }

  /**
   * ビルドオプションを設定する
   *
   * @param option
   * @returns
   */
  public setOption(option: vscodeSnippetBuilderOption) {
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
  public buildFile(srcPath: string, outputPath: string) {
    //ロード済みのスニペットデータをクリアする
    this.snipptes = {};
    const groupName = this.getGroupName(srcPath);
    this.loadSnippetData(groupName);
    this.buildSnippet();
  }

  /**
   * 全ファイルのビルド処理
   */
  public buildAll() {
    this.loadSnippetData();
    this.buildSnippet();
  }
}
