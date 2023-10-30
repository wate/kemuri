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

export default abstract class snippetBuilder extends baseBuilder {
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
   * スニペットデータをロードする
   * @param name
   */
  protected loadData(name?: string): void {
    const targetFiles = this.findEntryPointFiles();
    if (targetFiles.length === 0) {
      return;
    }
    targetFiles.forEach((targetFile) => {
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
            const startIndex = node;
            const endIndex = findAfter(this.tree, startIndex, { type: 'heading', depth: 2 });
            if (endIndex) {
              snippets = findAllBetween(this.tree, startIndex, endIndex, { type: 'code' });
            } else {
              snippets = findAllAfter(this.tree, startIndex, { type: 'code' });
            }
            if (snippets) {
              // スニペットの拡張設定を取得する
              const extraSettingNode = findAfter(this.tree, startIndex, { type: 'heading', depth: 3 });
              if (extraSettingNode) {
                const extraSetting = findAllBetween(this.tree, extraSettingNode, endIndex, {
                  type: 'code',
                });
                if (extraSetting) {
                  extraSetting.forEach((setting) => {
                    const settingLang = this.languageMaps.get(setting.lang) || setting.lang;
                    if (this.snipptes[snippetName] === undefined) {
                      this.snipptes[snippetName] = {
                        name: snippetName,
                        code: {},
                        prefix: [snippetName],
                        description: snippetDescription,
                        extra_setting: {},
                      };
                    }
                    if (this.snipptes[snippetName]['extra_setting'][settingLang] !== undefined) {
                      console.warn(`Duplicate extra setting name: ${snippetName} / ${settingLang}`);
                    }
                    this.snipptes[snippetName]['extra_setting'][settingLang] = setting.value;
                  });
                }
              }
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
                  console.warn('Duplicate snippet: ' + snippetName + ' / ' + snippetLang);
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

  public async buildFile(srcPath: string, outputPath: string) {
    //ここに処理を書く
  }

  public buildAll() {}
}
