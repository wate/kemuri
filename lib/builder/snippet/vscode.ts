import { baseBuilder, builderOption } from '../base';
import * as fs from 'fs';
import * as path from 'path';
import { frontmatter } from 'micromark-extension-frontmatter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter';
import { find } from 'unist-util-find';
import { findAfter } from 'unist-util-find-after';
import { visit } from 'unist-util-visit';
import { findAllAfter } from 'unist-util-find-all-after';
import findAllBetween from 'unist-util-find-all-between';
import _ from 'lodash';
import yaml from 'js-yaml';

export class vscodeSnippetBuilder extends baseBuilder {
  /**
   * ソースコードのディレクトリ
   */
  protected srcDir: string = 'docs/snippet';

  /**
   * 出力先ディレクトリ
   */
  protected outputDir: string = '.vscode';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = ['md'];

  /**
   * 出力時の拡張子
   */
  protected outputExt: string = 'code-snippets';

  /**
   * 言語コードに対応する言語名のマップ
   */
  private languageMaps: Map<string, string> = new Map([
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
   * コンストラクタ
   *
   * @param option
   */
  constructor(option?: builderOption) {
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
      return path.basename(srcPath, path.extname(srcPath));
    }
  }

  /**
   * スニペット拡張設定の開始位置判定用メソッド
   * @param node
   * @returns
   */
  protected extraSettingTestFunc(node: any): any {
    if (node.type === 'heading' && node.depth === 3) {
      const textNode = find(node, { type: 'text' });
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
  protected getSnippetEndPosition(startPosition: any): any {
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
  protected getSnippetExtraSetting(startPosition: any): any {
    let extraSetting: any = {};
    const extraSettingStartNode = findAfter(this.tree, startPosition, this.extraSettingTestFunc);
    if (extraSettingStartNode) {
      const extraSettingNode = findAfter(this.tree, extraSettingStartNode, { type: 'code' });
      if (extraSettingNode) {
        const tmpExtraSetting = yaml.load(extraSettingNode.value);
        if (tmpExtraSetting) {
          extraSetting = tmpExtraSetting;
        }
      }
    }
    return extraSetting;
  }

  /**
   * スニペットデータをロードする
   * @param name
   */
  protected loadSnippetData(): void {
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
      let meta: any = {};
      if (matter) {
        meta = yaml.load(matter.value);
      }
      if (meta?.draft) {
        console.info('Skip draft file:' + targetFile);
      } else {
        const namePrefix = meta?.prefix ? meta.prefix : '';
        const nameSuffix = meta?.suffix ? meta.suffix : '';
        visit(this.tree, { type: 'heading', depth: 2 }, (node, index) => {
          let snippetNameNode = find(node, { type: 'text' });
          if (snippetNameNode) {
            const snippetName = namePrefix + snippetNameNode.value + nameSuffix;
            console.info('Snippet: ' + snippetName);
            //スニペットの開始位置を取得する
            const startPosition = node;
            //スニペットの説明を取得する
            let snippetDescription: string | null = null;

            let snippets = null;
            const firstParagraphNode = findAfter(this.tree, startPosition, { type: 'paragraph' });
            if (firstParagraphNode) {
              const snippetDescriptionNode = find(firstParagraphNode, { type: 'text' });
              if (snippetDescriptionNode) {
                snippetDescription = snippetDescriptionNode.value;
              }
            }
            //スニペットのコードを取得する
            const endPosition = this.getSnippetEndPosition(startPosition);
            if (endPosition) {
              snippets = findAllBetween(this.tree, startPosition, endPosition, { type: 'code' });
            } else {
              snippets = findAllAfter(this.tree, startPosition, { type: 'code' });
            }
            const extraSetting = this.getSnippetExtraSetting(startPosition);
            if (snippets) {
              // メンバー変数に格納する
              snippets.forEach((snippet) => {
                // スニペットの言語を取得する
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
  public buildFile(srcPath: string, outputPath: string) {
    if (Object.keys(this.snipptes).length === 0) {
      this.loadSnippetData();
    }
  }

  /**
   * 全ファイルのビルド処理
   */
  public buildAll() {
    this.loadSnippetData();
    console.log(this.snipptes);
    const groupdSnippets: any = _.groupBy(this.snipptes, 'group');
    // console.log(groupdSnippets);
    Object.keys(groupdSnippets).forEach((groupName) => {
      //出力先ファイルパス
      const outputPath = path.join(this.outputDir, groupName + '.' + this.outputExt);
      const snippetData: any = {};
      groupdSnippets[groupName].forEach((snippet: any) => {
        Object.keys(snippet.code).forEach((lang) => {
          const snippetkey = snippet.name + '.' + lang;
          const snippetBody = snippet.code[lang];
          const snippetPrefix: string[] = snippet.prefix;
          if (snippet.extraSetting?.prefix) {
            snippetPrefix.push(snippet.extraSetting.prefix);
          }
          const snippetScope: string[] = [snippet.lang];
          snippetData[snippetkey] = {
            prefix: snippetPrefix,
            body: snippetBody,
            scope: snippetScope.join(','),
          };
          if (snippet.description) {
            snippetData[snippetkey]['description'] = snippet.description;
          }
        });
      });
      // const snippets = groupdSnippets[groupName].map((snippet: any) => {

      // groupdSnippets[groupName].map((snippet: any) => {
      //   return {
      //     scope: 'javascript,html',
      //     prefix: snippet.prefix,
      //     body: snippet.code,
      //   }
      // });
      // "scope": "javascript,html",
      // "prefix": "hello",
      // "body": "$BLOCK_COMMENT_START Hello World $BLOCK_COMMENT_END"
      console.log('Output: ' + outputPath);

      // fs.writeFileSync(outputPath, JSON.stringify(groupdSnippets[groupName], null, 2));
    });
  }
}
