import * as fs from 'node:fs';
import * as path from 'node:path';
import { baseBuilder, builderOption } from '../base';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import js_beautify from 'js-beautify';
import { MinifyOutput, minify } from 'terser';

/**
 * JSビルドの設定オプション
 */
export interface typescriptBuilderOption extends builderOption {
  globals?: object;
  sourcemap?: boolean;
  minify?: boolean;
}

/**
 * ビルド処理の抽象クラス
 */
export class typescriptBuilder extends baseBuilder {
  /**
   * 出力先ディレクトリ
   */
  protected outputDir = 'public/assets/js';

  /**
   * エントリポイントとなるファイルの拡張子
   */
  protected fileExts = ['js', 'ts'];

  /**
   * エントリポイントではないが変更の監視対象となるファイルの拡張子
   */
  protected moduleExts = ['mjs', 'cjs', 'mts', 'cts'];
  /**
   * エントリポイントから除外するディレクトリ名
   * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
   */
  protected ignoreDirNames = ['node_modules'];

  /**
   * 出力時の拡張子
   */
  protected outpuExt = 'js';

  /**
   * ビルド時に設定するグローバルオブジェクトの内容
   */
  private globals: any = {};

  /**
   * SourceMapファイル出力の可否
   */
  private sourcemap?: boolean;

  /**
   * minifyの可否
   */
  private minify?: boolean;

  /**
   * TypeScriptのデフォルトのコンパイルオプション
   */
  private typeScriptCompolerOption = {
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
   * コンストラクタ
   * @param option
   */
  constructor(option?: typescriptBuilderOption) {
    super();
    if (option) {
      this.setOption(option);
    }
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
  public setGlobals(globals: any): void {
    this.globals = globals;
  }
  /**
   * SourceMapファイル出力の可否
   *
   * @param sourcemap
   */
  public setSourceMap(sourcemap: boolean): void {
    this.sourcemap = sourcemap;
  }

  /**
   * 出力時のminify化の可否を設定する
   *
   * @param minify
   */
  public setMinfy(minify: boolean): void {
    this.minify = minify;
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
  public setOption(option: typescriptBuilderOption) {
    super.setOption(option);
    if (option.globals !== undefined && option.globals) {
      this.setGlobals(option.globals);
    }
    if (option.sourcemap !== undefined) {
      this.setSourceMap(option.sourcemap);
    }
    if (option.minify !== undefined) {
      this.setMinfy(option.minify);
    }
  }

  /**
   * コンパイルオプションを取得する
   * @returns
   */
  protected getCompileOption(): any {
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
  public async buildFile(srcPath: string, outputPath: string) {
    let bundle;
    try {
      const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
      const typescriptConfig = {
        include: this.srcDir,
        exclude: this.ignoreDirNames,
        compilerOptions: this.getCompileOption(),
      };
      bundle = await rollup({
        input: srcPath,
        plugins: [nodeResolve(), commonjs(), typescript(typescriptConfig)],
      });
      const { output } = await bundle.generate({
        globals: this.globals,
        sourcemap: this.sourcemap,
      });
      let outputDir: string = path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });
      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          fs.writeFileSync(path.join(outputDir, chunkOrAsset.fileName), chunkOrAsset.source);
        } else {
          let outputCode: string = chunkOrAsset.code;
          if (this.minify !== undefined && this.minify) {
            const minifyResult: MinifyOutput = await minify(outputCode, { sourceMap: this.sourcemap });
            // @ts-ignore
            outputCode = minifyResult.code;
          } else {
            outputCode = js_beautify.js(outputCode, beautifyOption);
          }
          fs.writeFileSync(path.join(outputDir, chunkOrAsset.preliminaryFileName), outputCode.trim() + '\n');
        }
      }
    } catch (error) {
      console.error(error);
    }
    if (bundle) {
      await bundle.close();
    }
  }

  /**
   * 全ファイルのビルド処理
   */
  public async buildAll() {
    const entries = this.getEntryPoint();
    let bundle;
    let buildFailed = false;
    if (entries.size > 0) {
      try {
        const beautifyOption = this.getBeautifyOption('dummy.' + this.outpuExt);
        const typescriptConfig = {
          include: this.srcDir,
          exclude: this.ignoreDirNames,
          compilerOptions: Object.assign(this.typeScriptCompolerOption, this.compileOption),
        };
        const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig)];
        bundle = await rollup({
          input: Object.fromEntries(entries),
          plugins: rollupPlugins,
        });
        const { output } = await bundle.generate({
          globals: this.globals,
          sourcemap: this.sourcemap,
        });
        let outputPath: string;
        const baseDir = this.getEntryPointBaseDir();
        for (const chunkOrAsset of output) {
          if (chunkOrAsset.type === 'asset') {
            outputPath = path.join(this.outputDir, chunkOrAsset.fileName);
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, chunkOrAsset.source);
          } else {
            outputPath = path.join(this.outputDir, chunkOrAsset.preliminaryFileName);
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            let outputCode = chunkOrAsset.code;
            if (this.minify !== undefined && this.minify) {
              const minifyResult: MinifyOutput = await minify(outputCode, { sourceMap: this.sourcemap });
              // @ts-ignore
              outputCode = minifyResult.code;
            } else {
              outputCode = js_beautify.js(outputCode, beautifyOption);
            }
            fs.writeFileSync(outputPath, outputCode.trim() + '\n');
            console.log('Compile: ' + (baseDir ? path.join(baseDir, chunkOrAsset.fileName) : chunkOrAsset.fileName)  + ' => ' + outputPath);
          }
        }
      } catch (error) {
        buildFailed = true;
        console.error(error);
      }
      if (bundle) {
        await bundle.close();
      }
    }
    process.exit(buildFailed ? 1 : 0);
  }
}
