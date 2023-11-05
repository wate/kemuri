import * as fs from 'node:fs';
import * as path from 'node:path';
import { b as baseBuilder } from './base.mjs';
import { glob } from 'glob';
import yaml from 'js-yaml';
import js_beautify from 'js-beautify';
import nunjucks from 'nunjucks';
import { a as console } from './config.mjs';

/**
 * ビルド処理の抽象クラス
 */
class nunjucksBuilder extends baseBuilder {
    /**
     * コンストラクタ
     * @param option
     */
    constructor(option) {
        super(option);
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['njk', 'twig'];
        /**
         * 出力時の拡張子
         */
        this.outputExt = 'html';
        this.compileOption = {
            noCache: true,
        };
        /**
         * 変数ファイルの名前
         */
        this.varFileName = 'vars.yml';
        /**
         * テンプレート変数格納用メンバ変数
         */
        this.templateVars = {};
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
    setVarFileName(varFileName) {
        this.varFileName = varFileName;
    }
    /**
     * テンプレート変数をロードする
     */
    loadTemplateVars() {
        const globPatterns = [this.varFileName, this.convertGlobPattern(this.srcDir) + '/**/' + this.varFileName];
        const varFiles = glob.sync(globPatterns);
        varFiles.forEach((varFilePath) => {
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
    getTemplateVars(srcFile) {
        let templateVars = this.templateVars['.'] ?? {};
        let key = '';
        const srcFilePaths = path.dirname(srcFile).split(path.sep);
        srcFilePaths.forEach((dirName) => {
            key = path.join(key, dirName);
            if (this.templateVars[key]) {
                templateVars = Object.assign(templateVars, this.templateVars[key]);
            }
        });
        templateVars['_scope'] = path.dirname(path.relative(this.srcDir, srcFile));
        return templateVars;
    }
    /**
     * ルートディレクトリの変数ファイルかどうかを判定する
     *
     * @param filePath
     * @returns
     */
    isRootVarFile(varFilePath) {
        const isProjectRootVarFile = varFilePath === this.varFileName;
        const isSrcRootVarFile = path.join(this.srcDir, this.varFileName) === varFilePath;
        return isProjectRootVarFile || isSrcRootVarFile;
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
    setOption(option) {
        super.setOption(option);
        if (option.varFileName !== undefined && option.varFileName) {
            this.setVarFileName(option.varFileName);
        }
    }
    /**
     * 監視対象ファイルのパターンを取得する
     * @returns
     */
    getWatchFilePattern() {
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
    watchAddCallBack(filePath) {
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
                }
                else {
                    this.buildAll();
                }
            }
            else {
                const isRootVarFile = this.isRootVarFile(filePath);
                if (isRootVarFile) {
                    //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
                    this.buildAll();
                }
                else {
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
        }
        catch (error) {
            console.error(error);
            process.exit(1);
        }
        console.groupEnd();
    }
    /**
     * ファイル更新時のコールバック処理
     * @param filePath
     */
    watchChangeCallBack(filePath) {
        console.group('Update file: ' + filePath);
        try {
            const changeFileName = path.basename(filePath);
            if (changeFileName !== this.varFileName) {
                if (Array.from(this.entryPoint.values()).includes(filePath)) {
                    const outputPath = this.convertOutputPath(filePath);
                    this.buildFile(filePath, outputPath);
                    console.log('Compile: ' + filePath + ' => ' + outputPath);
                }
                else {
                    this.buildAll();
                }
            }
            else {
                const isRootVarFile = this.isRootVarFile(filePath);
                if (isRootVarFile) {
                    //ルートディレクトリの変数ファイルが追加された場合は全ファイルをビルド
                    this.buildAll();
                }
                else {
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
        }
        catch (error) {
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
    async buildFile(srcPath, outputPath) {
        nunjucks.configure(this.srcDir, this.compileOption);
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
        this.loadTemplateVars();
        const templatePath = path.relative(this.srcDir, srcPath);
        const templateVars = this.getTemplateVars(srcPath);
        let html = nunjucks.render(templatePath, templateVars);
        //@ts-ignore
        html = js_beautify.html(html, beautifyOption);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        // console.group('Build entory point files');
        const entries = this.getEntryPoint();
        if (entries.size === 0) {
            return;
        }
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
        this.loadTemplateVars();
        nunjucks.configure(this.srcDir, this.compileOption);
        entries.forEach((srcFile, entryPoint) => {
            const templatePath = path.relative(this.srcDir, srcFile);
            const outputPath = path.join(this.outputDir, entryPoint + '.' + this.outputExt);
            const templateVars = this.getTemplateVars(srcFile);
            let html = nunjucks.render(templatePath, templateVars);
            //@ts-ignore
            html = js_beautify.html(html, beautifyOption);
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, html.replace(/^\r?\n/gm, '').trim() + '\n');
            console.log('Compile: ' + srcFile + ' => ' + outputPath);
        });
        // console.groupEnd();
    }
}

const htmlBuilder = new nunjucksBuilder();

export { htmlBuilder as h };
