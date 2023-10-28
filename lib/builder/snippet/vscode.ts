import { baseBuilder, builderOption } from '../base';

export class vscodeSnippetBuilder extends baseBuilder {
  /**
   * 出力先ディレクトリ
   */
  protected outputDir = '.vscode';

  /**
   * 出力時の拡張子
   */
  protected outpuExt = 'code-snippets';

  constructor(option?: builderOption) {
    super(option);
  }

  public async buildFile() {
    //
  }
  public async buildAll() {
    //
  }
}
