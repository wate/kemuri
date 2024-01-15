import * as fs from 'node:fs';
import * as path from 'node:path';
import { baseBuilder, builderOption } from '../base';
import { rollup, ModuleFormat as moduleFormat } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import type { RollupTypescriptOptions, PartialCompilerOptions } from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import js_beautify from 'js-beautify';
import console from '../../console';

const beautify = js_beautify.js;

type outputFormat = moduleFormat;
/**
 * JSビルドの設定オプション
 */
export interface typescriptBuilderOption extends builderOption {
  // https://rollupjs.org/configuration-options/#output-globals
  globals?: object;
  // https://rollupjs.org/configuration-options/#output-format
  format?: outputFormat;
  // https://github.com/rollup/plugins/tree/master/packages/replace
  replace?: Record<string, string>;
  // https://rollupjs.org/configuration-options/#output-sourcemap
  sourcemap?: boolean;
  compileOption?: PartialCompilerOptions;
  minify?: boolean;
  // https://github.com/terser/terser#minify-options
  minifyOption?: object;
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
   * エントリポイントから除外するファイル名の接尾語
   */
  protected ignoreFileSuffix = '.d';

  /**
   * エントリポイントから除外するディレクトリ名
   * (このディレクトリ名以下に配置されているファイルはエントリポイントから除外される)
   */
  protected ignoreDirNames = ['node_modules'];

  /**
   * 出力時の拡張子
   */
  protected outputExt = 'js';

  /**
   * -------------------------
   * このクラス固有のメンバ変数/メソッド
   * -------------------------
   */

  /**
   * TypeScriptのデフォルトのコンパイルオプション
   */
  protected typeScriptCompoleOption: PartialCompilerOptions = {
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
    // isolatedModules: false,
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
    // When type checking, take into account 'null' and 'undefined'.
    strictNullChecks: false,
    /* ------------------------ */
    /* Completeness             */
    /* ------------------------ */
    // Skip type checking all .d.ts files.
    skipLibCheck: true,
  };

  /**
   * ビルド時に設定するグローバルオブジェクトの内容
   */
  private globals: any = {};

  /**
   * Roolup.jsに指定する出力形式
   */
  private outputFortmat: outputFormat = 'esm';

  /**
   * 置換オプション
   */
  protected replace: Record<string, string> = {
    'process.env.NODE_ENV': JSON.stringify('production'),
  };

  /**
   * SourceMapファイル出力の可否
   */
  private sourcemap?: boolean;

  /**
   * minifyの可否
   */
  private minify?: boolean;

  /**
   * Minyfy化のオプション
   * https://github.com/terser/terser#minify-options
   */
  protected minifyOption: object = {
    compress: {},
    mangle: {},
  };

  /**
   * グルーバルオブジェクトを設定する
   *
   * @param globals
   */
  public setGlobals(globals: any): void {
    this.globals = globals;
  }

  /**
   * 出力形式を設定する
   *
   * @param format
   */
  public setOutputFormat(format: outputFormat): void {
    this.outputFortmat = format;
  }

  /**
   * 置換オプションを設定する
   * @param replace
   */
  public setReplace(replace: Record<string, string>): void {
    this.replace = replace;
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
   * minify化のオプションを設定する
   *
   * @param minifyOption
   */
  public setMinfyOption(minifyOption: object): void {
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
  public setOption(option: typescriptBuilderOption) {
    super.setOption(option);
    if (option.globals !== undefined && option.globals !== null && Object.keys(option.globals).length > 0) {
      this.setGlobals(option.globals);
    }
    if (option.format !== undefined && option.format !== null) {
      this.setOutputFormat(option.format);
    }
    if (option.replace !== undefined && option.replace !== null) {
      this.setReplace(option.replace);
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
   * -------------------------
   * 抽象化メソッドの実装
   * -------------------------
   */
  /**
   * コンパイルオプションを取得する
   * @returns
   */
  protected getCompileOption(): PartialCompilerOptions {
    return Object.assign(this.typeScriptCompoleOption, this.compileOption);
  }

  /**
   * 単一ファイルのビルド処理
   * @param srcPath
   * @param outputPath
   */
  public async buildFile(srcPath: string, outputPath: string) {
    let bundle;
    try {
      const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
      const typescriptConfig: RollupTypescriptOptions = {
        include: this.srcDir,
        exclude: this.ignoreDirNames,
        compilerOptions: this.getCompileOption(),
      };
      const replaceOption: RollupReplaceOptions = {
        preventAssignment: true,
        values: this.replace,
      };
      const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig), replace(replaceOption)];
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
      let outputDir: string = path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });
      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          fs.writeFileSync(path.join(outputDir, chunkOrAsset.fileName), chunkOrAsset.source);
        } else {
          let outputCode: string = chunkOrAsset.code;
          if ((this.minify === undefined || !this.minify) && this.beautify) {
            outputCode = beautify(outputCode, beautifyOption);
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
    // console.group('Build entory point files');
    const entries = this.getEntryPoint();
    let bundle;
    let buildFailed = false;
    if (entries.size === 0) {
      return;
    }
    try {
      const beautifyOption = this.getBeautifyOption('dummy.' + this.outputExt);
      const typescriptConfig: RollupTypescriptOptions = {
        include: this.srcDir,
        exclude: this.ignoreDirNames,
        compilerOptions: this.getCompileOption(),
      };
      const replaceOption: RollupReplaceOptions = {
        preventAssignment: true,
        values: this.replace,
      };
      const rollupPlugins = [nodeResolve(), commonjs(), typescript(typescriptConfig), replace(replaceOption)];
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
      let outputPath: string;
      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          outputPath = path.join(this.outputDir, chunkOrAsset.fileName);
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, chunkOrAsset.source);
        } else {
          outputPath = path.join(this.outputDir, chunkOrAsset.preliminaryFileName);
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          let outputCode = chunkOrAsset.code;
          if ((this.minify === undefined || !this.minify) && this.beautify) {
            outputCode = beautify(outputCode, beautifyOption);
          }
          fs.writeFileSync(outputPath, outputCode.trim() + '\n');
          console.log('Compile: ' + path.join(this.srcDir, chunkOrAsset.fileName) + ' => ' + outputPath);
        }
      }
    } catch (error) {
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
