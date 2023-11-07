import * as fs from 'node:fs';
import * as path from 'node:path';
import { URL } from 'node:url';
import { baseBuilder, builderOption } from '../base';
import { glob } from 'glob';
import yaml from 'js-yaml';
import nunjucks from 'nunjucks';
import { html_beautify as beautify } from 'js-beautify';
import console from '../../console';

/**
 * HTMLビルドの設定オプション
 */
export interface nunjucksBuilderOption extends builderOption {
  varFileName?: string;
  generateSiteMap?: boolean;
  siteUrl?: string;
  sitemapTemplate?: string;
  generatePageList?: boolean;
}

/**
 * ビルド処理の抽象クラス
 */
export class nunjucksBuilder extends baseBuilder {
  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts: string[] = ['njk', 'twig'];

  /**
   * 出力時の拡張子
   */
  protected outputExt: string = 'html';

  protected compileOption: nunjucks.ConfigureOptions = {
    noCache: true,
  };
  /**
   * 変数ファイルの名前
   */
  protected varFileName: string = 'vars.yml';

  /**
   * サイトURL
   */
  protected siteUrl: string = 'http://127.0.0.1:3000/';

  /**
   * サイトマップファイルの生成の可否
   */
  protected generateSiteMap: boolean = true;

  /**
   * サイトマップファイルのテンプレート文字列
   */
  protected sitemapTemplate: string = `<?xml version="1.0" encoding="UTF-8"?>
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
  protected generatePageList: boolean = true;

  /**
   * テンプレート変数格納用メンバ変数
   */
  protected templateVars: any = {};

  /**
   * コンストラクタ
   * @param option
   */
  public constructor(option?: nunjucksBuilderOption) {
    super(option);
  }
  /**
   * -------------------------
   * このクラス固有のメソッド
   * -------------------------
   */

  /**
   * 変数ファイル名を設定する
   *
   * @param varFileName
   */
  public setVarFileName(varFileName: string) {
    this.varFileName = varFileName;
  }
  /**
   * サイトマップファイルの生成の可否を設定する
   * @param generateSiteMap
   */
  public setGenerateSiteMap(generateSiteMap: boolean) {
    this.generateSiteMap = generateSiteMap;
  }
  /**
   * サイトのURLを設定する
   * @param siteUrl
   */
  public setSiteUrl(siteUrl: string) {
    this.siteUrl = siteUrl;
  }
  /**
   * ページリストファイルの生成の可否を設定する
   * @param generatePageList
   */
  public setGeneratePageList(generatePageList: boolean) {
    this.generatePageList = generatePageList;
  }

  /**
   * テンプレート変数をロードする
   */
  protected loadTemplateVars() {
    const globPatterns = [this.varFileName, this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName];
    const varFiles = glob.sync(globPatterns);
    varFiles.forEach((varFilePath: string) => {
      const key = path.dirname(varFilePath);
      // @ts-ignore
      this.templateVars[key] = yaml.load(fs.readFileSync(varFilePath));
    });
  }
  /**
   * テンプレートに対応する変数を取得する
   * @param srcFile
   * @returns
   */
  protected getTemplateVars(srcFile: string): object {
    let templateVars = this.templateVars['.'] ?? {
      siteUrl: this.siteUrl,
    };
    let key: string = '';
    const srcFilePaths = path.dirname(srcFile).split(path.sep);
    srcFilePaths.forEach((dirName) => {
      key = path.join(key, dirName);
      if (this.templateVars[key]) {
        templateVars = Object.assign(templateVars, this.templateVars[key]);
      }
    });
    let pageScope = path.dirname(path.relative(this.srcDir, srcFile));
    if (pageScope === '.') {
      pageScope = '';
    }
    templateVars['_scope'] = pageScope;
    return templateVars;
  }

  /**
   * ルートディレクトリの変数ファイルかどうかを判定する
   *
   * @param filePath
   * @returns
   */
  protected isRootVarFile(varFilePath: string): boolean {
    const isProjectRootVarFile: boolean = varFilePath === this.varFileName;
    const isSrcRootVarFile: boolean = path.join(this.srcDir, this.varFileName) === varFilePath;
    return isProjectRootVarFile || isSrcRootVarFile;
  }

  /**
   * サイトマップファイル/ページリストファイルを生成する
   * @returns
   */
  protected generateIndexFile() {
    const entries = this.getEntryPoint();
    if (entries.size === 0 || (!this.generateSiteMap && !this.generatePageList)) {
      return;
    }
    const pageList: any[] = [];
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
  protected generateSitemapFile(pageList: any[]) {
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
  protected generatePageListFile(pageList: any[]) {
    const pageListFilePath = 'pages.json';
    fs.mkdirSync(path.dirname(pageListFilePath), { recursive: true });
    fs.writeFileSync(pageListFilePath, JSON.stringify(pageList, null, 2), 'utf-8');
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
  public setOption(option: nunjucksBuilderOption) {
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
  protected getWatchFilePattern(): string | string[] {
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
  protected watchAddCallBack(filePath: string) {
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
        } else {
          this.buildAll();
        }
      } else {
        const isRootVarFile = this.isRootVarFile(filePath);
        if (isRootVarFile) {
          //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
          this.buildAll();
        } else {
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
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    console.groupEnd();
  }
  /**
   * ファイル更新時のコールバック処理
   * @param filePath
   */
  protected watchChangeCallBack(filePath: string) {
    console.group('Update file: ' + filePath);
    try {
      const changeFileName = path.basename(filePath);
      if (changeFileName !== this.varFileName) {
        if (Array.from(this.entryPoint.values()).includes(filePath)) {
          const outputPath = this.convertOutputPath(filePath);
          this.buildFile(filePath, outputPath);
          console.log('Compile: ' + filePath + ' => ' + outputPath);
        } else {
          this.buildAll();
        }
      } else {
        const isRootVarFile = this.isRootVarFile(filePath);
        if (isRootVarFile) {
          //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
          this.buildAll();
        } else {
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
    } catch (error) {
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
  public async buildFile(srcPath: string, outputPath: string) {
    nunjucks.configure(this.srcDir, this.compileOption);
    const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
    this.loadTemplateVars();
    const templatePath: string = path.relative(this.srcDir, srcPath);
    const templateVars = this.getTemplateVars(srcPath);
    let html = nunjucks.render(templatePath, templateVars);
    html = beautify(html, beautifyOption);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
  }

  /**
   * 全ファイルのビルド処理
   */
  public async buildAll() {
    // console.group('Build entory point files');
    const entries = this.getEntryPoint();
    if (entries.size === 0) {
      return;
    }
    const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
    this.loadTemplateVars();
    nunjucks.configure(this.srcDir, this.compileOption);
    entries.forEach((srcFile, entryPoint) => {
      const templatePath: string = path.relative(this.srcDir, srcFile);
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
