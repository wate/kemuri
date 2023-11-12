import typescript from '@rollup/plugin-typescript';

export default {
  input: {
    builder: 'lib/builder.ts',
    'html-builder': 'lib/html-builder.ts',
    'css-builder': 'lib/css-builder.ts',
    'js-builder': 'lib/js-builder.ts',
    screenshot: 'lib/screenshot.ts',
    'snippet-builder': 'lib/snippet-builder.ts',
  },
  plugins: [typescript()],
  output: {
      dir: 'bin',
      format: 'esm',
      chunkFileNames: 'common/[name].mjs',
      entryFileNames: '[name].js',
  }
};
