import typescript from '@rollup/plugin-typescript';

export default {
  input: {
    kemuri: 'lib/builder.ts',
    'kemuri-server': 'lib/server.ts',
    'kemuri-screenshot': 'lib/screenshot.ts',
    'kemuri-snippet': 'lib/snippet-builder.ts',
  },
  plugins: [typescript()],
  output: {
    dir: 'bin',
    format: 'esm',
    chunkFileNames: 'lib/[name].mjs',
    entryFileNames: '[name].js',
  },
};
