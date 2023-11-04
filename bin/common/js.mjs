import * as fs from 'node:fs';
import * as path from 'node:path';
import { b as baseBuilder } from './base.mjs';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import js_beautify from 'js-beautify';

/**
 * ビルド処理の抽象クラス
 */
class typescriptBuilder extends baseBuilder {
    /**
     * コンストラクタ
     * @param option
     */
    constructor(option) {
        super(option);
        /**
         * 出力先ディレクトリ
         */
        this.outputDir = 'public/assets/js';
        /**
         * エントリポイントとなるファイルの拡張子
         */
        this.fileExts = ['js', 'ts'];
        /**
         * エントリポイントではないが変更の監視対象となるファイルの拡張子
         */
        this.moduleExts = ['mjs', 'cjs', 'mts', 'cts'];
        /**
         * エントリポイントから除外するディレクトリ名
         * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
         */
        this.ignoreDirNames = ['node_modules'];
        /**
         * 出力時の拡張子
         */
        this.outputExt = 'js';
        /**
         * ビルド時に設定するグローバルオブジェクトの内容
         */
        this.globals = {};
        /**
         * Roolup.jsに指定する出力形式
         */
        this.outputFortmat = 'es';
        /**
         * TypeScriptのデフォルトのコンパイルオプション
         */
        this.typeScriptCompolerOption = {
            /* ------------------------ */
            /* Language and Environment */
            /* ------------------------ */
            // Set the JavaScript language version for emitted JavaScript and include compatible library declarations.
            target: 'ES2020',
            // Specify a set of bundled library declaration files that describe the target runtime environment.
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            /* ------------------------ */
            /* Modules                  */
            /* ------------------------ */
            // Specify what module code is generated.
            module: 'ESNext',
            // Specify how TypeScript looks up a file from a given module specifier.
            moduleResolution: 'bundler',
            // Use the package.json 'exports' field when resolving package imports.
            resolvePackageJsonExports: true,
            // Use the package.json 'imports' field when resolving imports.
            resolvePackageJsonImports: true,
            // Enable importing .json files.
            resolveJsonModule: true,
            /* ------------------------ */
            /* JavaScript Support       */
            /* ------------------------ */
            allowJs: true,
            checkJs: true,
            /* ------------------------ */
            /* Interop Constraints      */
            /* ------------------------ */
            // Ensure that each file can be safely transpiled without relying on other imports.
            isolatedModules: true,
            // Allow 'import x from y' when a module doesn't have a default export.
            allowSyntheticDefaultImports: true,
            // Emit additional JavaScript to ease support for importing CommonJS modules.
            // This enables 'allowSyntheticDefaultImports' for type compatibility.
            esModuleInterop: true,
            // Ensure that casing is correct in imports.
            forceConsistentCasingInFileNames: true,
            /* ------------------------ */
            /* Type Checking            */
            /* ------------------------ */
            // Enable all strict type-checking options.
            strict: true,
            /* ------------------------ */
            /* Completeness             */
            /* ------------------------ */
            // Skip type checking all .d.ts files.
            skipLibCheck: true,
        };
        /**
         * Minyfy化のオプション
         * https://github.com/terser/terser#minify-options
         */
        this.minifyOption = {
            compress: {},
            mangle: {}
        };
    }
    /**
     * -------------------------
     * このクラス固有のメソッド
     * -------------------------
     */
    /**
     * グルーバルオブジェクトを設定する
     *
     * @param globals
     */
    setGlobals(globals) {
        this.globals = globals;
    }
    /**
     * 出力形式を設定する
     *
     * @param format
     */
    setOutputFormat(format) {
        this.outputFortmat = format;
    }
    /**
     * SourceMapファイル出力の可否
     *
     * @param sourcemap
     */
    setSourceMap(sourcemap) {
        this.sourcemap = sourcemap;
    }
    /**
     * 出力時のminify化の可否を設定する
     *
     * @param minify
     */
    setMinfy(minify) {
        this.minify = minify;
    }
    /**
     * minify化のオプションを設定する
     *
     * @param minifyOption
     */
    setMinfyOption(minifyOption) {
        this.minifyOption = minifyOption;
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
        if (option.globals !== undefined && option.globals !== null && Object.keys(option.globals).length > 0) {
            this.setGlobals(option.globals);
        }
        if (option.format !== undefined && option.format !== null) {
            this.setOutputFormat(option.format);
        }
        if (option.sourcemap !== undefined && option.sourcemap !== null) {
            this.setSourceMap(option.sourcemap);
        }
        if (option.minify !== undefined && option.minify !== null) {
            this.setMinfy(option.minify);
        }
        if (option.minifyOption !== undefined && option.minifyOption !== null) {
            this.setMinfyOption(option.minifyOption);
        }
    }
    /**
     * コンパイルオプションを取得する
     * @returns
     */
    getCompileOption() {
        return Object.assign(this.typeScriptCompolerOption, this.compileOption);
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
        let bundle;
        try {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
            const typescriptConfig = {
                include: this.srcDir,
                exclude: this.ignoreDirNames,
                compilerOptions: this.getCompileOption(),
            };
            const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig)];
            if (this.minify !== undefined && this.minify) {
                rollupPlugins.push(terser(this.minifyOption));
            }
            bundle = await rollup({
                external: Object.keys(this.globals),
                input: srcPath,
                plugins: rollupPlugins,
            });
            const { output } = await bundle.generate({
                globals: this.globals,
                format: this.outputFortmat,
                sourcemap: this.sourcemap,
            });
            let outputDir = path.dirname(outputPath);
            fs.mkdirSync(outputDir, { recursive: true });
            for (const chunkOrAsset of output) {
                if (chunkOrAsset.type === 'asset') {
                    fs.writeFileSync(path.join(outputDir, chunkOrAsset.fileName), chunkOrAsset.source);
                }
                else {
                    let outputCode = chunkOrAsset.code;
                    if (this.minify === undefined || !this.minify) {
                        outputCode = js_beautify.js(outputCode, beautifyOption);
                    }
                    fs.writeFileSync(path.join(outputDir, chunkOrAsset.preliminaryFileName), outputCode.trim() + '\n');
                }
            }
        }
        catch (error) {
            console.error(error);
        }
        if (bundle) {
            await bundle.close();
        }
    }
    /**
     * 全ファイルのビルド処理
     */
    async buildAll() {
        // console.group('Build entory point files');
        const entries = this.getEntryPoint();
        let bundle;
        let buildFailed = false;
        if (entries.size === 0) {
            return;
        }
        try {
            const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
            const typescriptConfig = {
                include: this.srcDir,
                exclude: this.ignoreDirNames,
                compilerOptions: Object.assign(this.typeScriptCompolerOption, this.compileOption),
            };
            const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig)];
            if (this.minify !== undefined && this.minify) {
                rollupPlugins.push(terser(this.minifyOption));
            }
            bundle = await rollup({
                external: Object.keys(this.globals),
                input: Object.fromEntries(entries),
                plugins: rollupPlugins,
            });
            const { output } = await bundle.generate({
                globals: this.globals,
                format: this.outputFortmat,
                sourcemap: this.sourcemap,
            });
            let outputPath;
            for (const chunkOrAsset of output) {
                if (chunkOrAsset.type === 'asset') {
                    outputPath = path.join(this.outputDir, chunkOrAsset.fileName);
                    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                    fs.writeFileSync(outputPath, chunkOrAsset.source);
                }
                else {
                    outputPath = path.join(this.outputDir, chunkOrAsset.preliminaryFileName);
                    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                    let outputCode = chunkOrAsset.code;
                    if (this.minify === undefined || !this.minify) {
                        outputCode = js_beautify.js(outputCode, beautifyOption);
                    }
                    fs.writeFileSync(outputPath, outputCode.trim() + '\n');
                    console.log('Compile: ' + path.join(this.srcDir, chunkOrAsset.fileName) + ' => ' + outputPath);
                }
            }
        }
        catch (error) {
            buildFailed = true;
            console.error(error);
        }
        if (bundle) {
            await bundle.close();
        }
        if (buildFailed) {
            throw new Error('Build Failed');
        }
        // console.groupEnd();
    }
}

const jsBuilder = new typescriptBuilder();

export { jsBuilder as j };
