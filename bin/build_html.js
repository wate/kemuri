#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const YAML = require('yaml');
const beautify = require('js-beautify');
const editorconfig = require('editorconfig');
const chokidar = require('chokidar');
const { execSync } = require('child_process')
require('dotenv').config();

//Nunjucksファイルのディレクトリ
let srcDir = 'src';
//HTML出力先ディレクトリ
let destDir = 'dist';
/**
 * ターゲットディレクトリの設定およびチェック
 */
if (process.env.SOURCE_NUNJUCKS_DIR) {
  const realPath = path.resolve(process.cwd(), process.env.SOURCE_NUNJUCKS_DIR);
  if (!realPath.startsWith(process.cwd())) {
    //作業ディレクトリ以下のディレクトリではなかった場合はエラー扱いで終了
    throw new Exception('Nunjucksファイルのディレクトリ指定が不正です');
  }
  srcDir = realPath;
}
if (process.env.OUTPUT_HTML_DIR) {
  const realPath = path.resolve(process.cwd(), process.env.OUTPUT_HTML_DIR);
  if (!realPath.startsWith(process.cwd())) {
    //作業ディレクトリ以下のディレクトリではなかった場合はエラー扱いで終了
    throw new Exception('HTML出力先ディレクトリ指定が不正です');
  }
  destDir = realPath;
}
//抽出対象ファイルの拡張子
let fileExtensions = ['njk', 'twig', 'html'];
if (process.env.NUNJUCKS_FILE_PATTERN) {
  fileExtensions = process.env.NUNJUCKS_FILE_PATTERN.toLowerCase().split(',');
}
//変数ファイル名
const nunjucksVarFile = process.env.NUNJUCKS_VAR_FILE || 'vars.yml';
//コンパイル済みページ一覧ファイル
const nunjucksCompiledPageListFile = process.env.NUNJUCKS_COMPILED_PAGE_LIST_FILE || 'pages.json';

class buildHTML {
  /**
   * ソースディレクトリ
   */
  srcDir = 'src';

  /**
   * 出力先ディレクトリ
   */
  destDir = 'dist';

  /**
   * 対象ファイルの拡張子
   */
  allowExts = ['njk', 'twig', 'html'];

  /**
   * 変数ファイル名
   */
  varFile = 'vars.yml';

  /**
   * Nunjucksオプション
   */
  nunjucksOptions = {};

  /**
   * コンパイル対象から除外ファイル/ディレクトリの接頭語
   */
  excludePattern = new RegExp('^_');

  /**
   * Nunjucks用グローバル変数
   */
  globalVariables = {};

  /**
   * Nunjucks用ローカル変数
   */
  localVariables = {};

  /**
   * コンパイル対象ファイルの一覧
   */
  compileTargetFiles = [];

  /**
   * js-beautifyオプション
   */
  beautifyOptions = {};

  /**
   * コンパイル済みページ情報
   */
  compiledFiles = [];

  /**
   * コンパイル済みページ一覧ファイル
   */
  pageListFile = 'pages.json';

  /**
   * 正規表現文字をクオートする
   *
   * @param {String} regexpStr 正規表現文字列
   * @return {String}
   */
  regexpQuote(regexpStr) {
    const metaChars = ['$', '^', '*', '\\', '/', '.', '[', ']', '|', '?', '+', '{', '}', '(', ')'];
    const escapedChars = metaChars.map((char) => '\\' + char).join('');
    return regexpStr.replace(new RegExp('[' + escapedChars + ']', 'g'), '\\$&');
  }

  /**
   * コンストラクタ
   *
   * @param {String} srcDir
   * @param {String} destDir
   * @param {Object} buildOptions
   */
  constructor(srcDir, destDir, buildOptions = {}) {
    this.srcDir = srcDir;
    this.destDir = destDir;
    if (buildOptions.excludePrefix) {
      //正規表現のメタ文字のエスケープ
      const metaChars = ['$', '^', '*', '\\', '/', '.', '[', ']', '|', '?', '+', '{', '}', '(', ')'];
      const escapedChars = metaChars.map((char) => '\\' + char).join('');
      const prefixPattern = buildOptions.excludePrefix.replace(new RegExp('[' + escapedChars + ']', 'g'), '\\$&');
      this.excludePattern = new RegExp('^' + prefixPattern);
    }
    //変数ファイル名
    if (buildOptions.varFile) {
      this.varFile = buildOptions.varFile;
    }
    //コンパイル済みページ一覧ファイル名
    if (buildOptions.pageListFile) {
      this.pageListFile = buildOptions.pageListFile;
    }
    //js-beautifyオプションを設定
    if (buildOptions.beautify) {
      this.beautifyOptions = buildOptions.beautify;
    }
    //Nunjucksオプションを設定
    if (buildOptions.nunjucks) {
      this.nunjucksOptions = buildOptions.nunjucks;
    }
    //js-beautifyオプションを設定
    if (buildOptions.beautify) {
      this.beautifyOptions = buildOptions.beautify;
    }
    //グルーバル変数の読み込み
    const templateVarFile = path.join(path.dirname(this.srcDir), this.varFile);
    if (fs.existsSync(templateVarFile)) {
      this.globalVariables = this.loadVariableFile(templateVarFile);
    }
  }
  /**
   * 変数ファイルの読み込み
   *
   * @param {String} varFilePath
   * @returns
   */
  loadVariableFile(varFilePath) {
    return YAML.parse(fs.readFileSync(varFilePath, 'utf8'));
  }
  /**
   * コンパイル対象ファイルを探す
   *
   * @param {String} targetDir
   */
  findCompileFiles(targetDir) {
    const allItems = fs.readdirSync(targetDir);
    allItems.forEach(item => {
      const fullPath = path.join(targetDir, item);
      if (!item.match(this.excludePattern)) {
        if (fs.statSync(fullPath).isDirectory()) {
          this.findCompileFiles(fullPath);
        } else if (fs.statSync(fullPath).isFile()) {
          const fileExt = path.extname(item).toLowerCase().slice(1);
          if (this.allowExts.includes(fileExt)) {
            this.loadLocalVariables(fullPath);
            this.compileTargetFiles.push(fullPath);
          }
        }
      }
    });
  }
  /**
   * ローカル変数を読み込む
   *
   * @param {String} templateFilePath
   */
  loadLocalVariables(templateFilePath) {
    const localVarKey = path.dirname(templateFilePath);
    const localVarFilePath = localVarKey + path.sep + this.varFile;
    if (!this.localVariables[localVarKey]) {
      let localTemplateVars = {};
      if (fs.existsSync(localVarFilePath)) {
        localTemplateVars = this.loadVariableFile(localVarFilePath);
      }
      this.localVariables[localVarKey] = localTemplateVars;
    }
  }
  /**
   * テンプレートファイルのコンパイル
   */
  compileNujucksFiles() {
    nunjucks.configure(this.srcDir, this.nunjucksOptions);
    const trimPathLength = (this.srcDir + path.sep).length;
    const urlPrefix = this.globalVariables.base_url ? this.globalVariables.base_url : '/';
    let html = '';
    this.compileTargetFiles.forEach((templateFilePath) => {
      const templateVars = this.getTemplateVars(templateFilePath);
      const templateName = templateFilePath.slice(trimPathLength);
      let outFileName = path.basename(templateFilePath, path.extname(templateFilePath));
      if (!outFileName.match(/\.html$/)) {
        outFileName += '.html';
      }
      const outFileDir = path.join(this.destDir, path.dirname(templateFilePath.slice(trimPathLength)));
      const outFilePath = path.join(outFileDir, outFileName);

      if (isDebug) {
        console.log('-------------------');
        console.log(templateFilePath + ' => ' + outFilePath);
        console.log(templateVars);
      }
      this.compiledFiles.push({
        src: templateFilePath,
        url: urlPrefix + path.relative(this.destDir, outFilePath),
        lastmod: fs.statSync(templateFilePath).mtime,
        variables: templateVars,
      });
      try {
        html = nunjucks.render(templateName, templateVars);
      } catch (error) {
        html = `<html>
<head>
  <title>Compile Error</title>
</head>
<body>
<pre>
${error.message}
</pre>
</body>
</html>`;
      }
      if (!fs.existsSync(outFileDir)) {
        fs.mkdirSync(outFileDir, { recursive: true }, (err) => { if (err) throw err; });
      }
      fs.writeFileSync(outFilePath, beautify.html_beautify(html, this.beautifyOptions), (err) => { if (err) throw err; });
    });
    //ページ一覧ファイルの出力
    fs.writeFileSync(this.pageListFile, JSON.stringify(this.compiledFiles, null, 2));
  }
  /**
   * テンプレートに設定する変数を取得する
   *
   * @param {String} templateFilePath
   * @returns {Object}
   */
  getTemplateVars(templateFilePath) {
    let templateVars = this.globalVariables;
    const locatVarKey = path.dirname(templateFilePath);
    let currentLocalVarKey = '';
    locatVarKey.split(path.sep).forEach((keyPart, i) => {
      currentLocalVarKey += i > 0 ? path.sep + keyPart : keyPart;
      templateVars = Object.assign(templateVars, this.localVariables[currentLocalVarKey]);
    });
    return templateVars;
  }
  /**
   * サイトマップファイルの生成
   */
  generateSiteMapFile() {
    const urlList = this.compiledFiles.map((page) => {
      const url = {
        loc: page.url
      };
      if (page.variables.sitemap_lastmod) {
        switch (page.variables.sitemap_lastmod) {
          case 'git':
            const lastCommitDatetime = execSync('git log -1 --format="%at" ' + page.src).toString();
            if (lastCommitDatetime) {
              //Dateがミリ秒なのでUnixtimeに1000を乗算
              url.lastmod = this.formatedSitemapLastmod(new Date(lastCommitDatetime * 1000));
            }
            break;
          case 'file':
            url.lastmod = this.formatedSitemapLastmod(page.lastmod);
            break;
          default:
            url.lastmod = page.variables.sitemap_lastmod;
            break;
        }
      }
      if (page.variables.sitemap_changefreq) {
        url.changefreq = page.variables.sitemap_changefreq;
      }
      if (page.variables.sitemap_priority) {
        url.priority = page.variables.sitemap_priority;
      }
      return url;
    });
    const sitemapTemplateString = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% for url in urlList -%}
  <url>
    <loc>{{ url.loc }}</loc>
    {% if url.lastmod is defined -%}
    <lastmod>{{ url.lastmod }}</lastmod>
    {% endif %}
    {% if url.changefreq is defined -%}
    <changefreq>{{ url.changefreq }}</changefreq>
    {% endif %}
    {% if url.priority is defined -%}
    <priority>{{ url.priority }}</priority>
    {% endif %}
  </url>
  {% endfor %}
</urlset>`;
    const sitemapContent = nunjucks.renderString(sitemapTemplateString, { urlList: urlList });
    fs.writeFileSync(this.destDir + path.sep + 'sitemap.xml', beautify.html_beautify(sitemapContent).replace(/^\n/mg, ''));
  }
  formatedSitemapLastmod(pageLastmod) {
    return `
    ${pageLastmod.getFullYear()}-
    ${(pageLastmod.getMonth() + 1).toString().padStart(2, '0')}-
    ${pageLastmod.getDate().toString().padStart(2, '0')}`
      .replace(/\s/g, '');
  }
  /**
   * ビルド処理
   */
  build(isProduction = false) {
    console.log('Build HTML');
    this.findCompileFiles(this.srcDir);
    this.compileNujucksFiles();
    if (isProduction) {
      this.generateSiteMapFile();
    }
  }
}

//コマンドライン引数
const args = process.argv.slice(2);
//ファイル変更の監視モード
const isWatch = args.includes('-w') || args.includes('--watch');
const isDebug = args.includes('--debug');
const isProduction = args.includes('--production');
/**
 * Nunjucksオプション
 */
const nunjucksOption = {
  autoescape: true,
  // tags: {
  //   blockStart: '<%',
  //   blockEnd: '%>',
  //   variableStart: '<$',
  //   variableEnd: '$>',
  //   commentStart: '<#',
  //   commentEnd: '#>'
  // }
};
/**
 * js-beautifyオプション
 * ※editorconfigの設定をjs-beautifyの設定に反映
 */
const beautifyOption = {};
const eConfig = editorconfig.parseSync('dummy.html')
if (eConfig.indent_style === 'tab') {
  beautifyOption.indent_with_tabs = true;
} else if (eConfig.indent_style === 'space') {
  beautifyOption.indent_with_tabs = false;
}
if (eConfig.indent_size) {
  beautifyOption.indent_size = eConfig.indent_size;
}
if (eConfig.max_line_length) {
  if (eConfig.max_line_length === 'off') {
    beautifyOption.wrap_line_length = 0;
  } else {
    beautifyOption.wrap_line_length = parseInt(eConfig.max_line_length, 10);
  }
}
if (eConfig.insert_final_newline === true) {
  beautifyOption.end_with_newline = true;
} else if (eConfig.insert_final_newline === false) {
  beautifyOption.end_with_newline = false;
}
if (eConfig.end_of_line) {
  if (eConfig.end_of_line === 'cr') {
    beautifyOption.eol = '\r';
  } else if (eConfig.end_of_line === 'lf') {
    beautifyOption.eol = '\n';
  } else if (eConfig.end_of_line === 'crlf') {
    beautifyOption.eol = '\r\n';
  }
}
/**
 * ---------------------
 * メイン処理部
 * ---------------------
 */
const builder = new buildHTML(srcDir, destDir, {
  nunjucks: nunjucksOption,
  beautify: beautifyOption,
  varFile: nunjucksVarFile,
  pageListFile: nunjucksCompiledPageListFile,
});
if (isWatch === true) {
  const watchGlobPatterns = [
    nunjucksVarFile,
    srcDir + '/**/' + nunjucksVarFile,
    srcDir + '/**/*.{' + fileExtensions.join(',') + '}',
  ];
  const watcher = chokidar.watch(watchGlobPatterns, {
    ignoreInitial: true,
  });
  watcher
    .on('add', (filePath) => {
      if (isDebug) console.log('add:' + filePath);
      builder.build(isProduction);
    })
    .on('change', (filePath) => {
      if (isDebug) console.log('change:' + filePath);
      builder.build(isProduction);
    })
    .on('unlink', (filePath) => {
      if (isDebug) console.log('unlink:' + filePath);
      builder.build(isProduction);
    })
    .on('addDir', (dirPath) => {
      if (isDebug) console.log('addDir:' + dirPath);
      builder.build(isProduction);
    })
    .on('unlinkDir', (dirPath) => {
      if (isDebug) console.log('unlinkDir:' + dirPath);
      builder.build(isProduction);
    })
    .on('error', (error) => {
      console.error(error);
    });
} else {
  builder.build(isProduction);
}
