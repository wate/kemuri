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
import yaml from 'js-yaml';
import { __classPrivateFieldIn } from 'tslib';

export default class vscodeSnippetBuilder extends baseBuilder {
  /**
   * ソースコードのディレクトリ
   */
  protected srcDir: string = 'docs/snippet';

  /**
   * 出力先ディレクトリ
   */
  protected outputDir: string = '';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = ['md'];

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
    return path.relative(this.srcDir, filePath).split(path.sep)[0];
  }

  /**
   * スニペットコードの終了位置を取得する
   * @param startPosition
   * @returns
   */
  protected getSnippetEndPosition(startPosition: any): any {
    let endPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: 3, value: 'VSCode Extra Setting' });
    if (!endPosition) {
      endPosition = findAfter(this.tree, startPosition, { type: 'heading', depth: 2 });
    }
    return endPosition;
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
            //スニペットの説明を取得する
            let snippetDescription: string | null = null;
            const firstParagraphNode = findAfter(this.tree, startIndex, { type: 'paragraph' });
            if (firstParagraphNode) {
              const snippetDescriptionNode = find(node, { type: 'text' });
              if (snippetDescriptionNode) {
                snippetDescription = snippetDescriptionNode.value;
              }
            }
            //スニペットのコードを取得する
            let snippets = null;
            const startPosition = node;
            const endPosition = this.getSnippetEndPosition(startPosition);
            if (endPosition) {
              snippets = findAllBetween(this.tree, startPosition, endPosition, { type: 'code' });
            } else {
              snippets = findAllAfter(this.tree, startPosition, { type: 'code' });
            }
            if (snippets) {
              // メンバー変数に格納する
              snippets.forEach((snippet) => {
                // スニペットの言語を取得する
                const snippetLang = this.languageMaps.get(snippet.lang) || snippet.lang;
                if (this.snipptes[snippetName] === undefined) {
                  this.snipptes[snippetName] = {
                    name: snippetName,
                    code: {},
                    prefix: [snippetName],
                    description: snippetDescription,
                    extra_setting: {},
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
    this.loadSnippetData();
    console.log(this.snipptes);
  }

  /**
   * 全ファイルのビルド処理
   */
  public buildAll() {
    this.loadSnippetData();
    console.log(this.snipptes);

  }
}
