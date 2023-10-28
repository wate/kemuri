import typescript from '@rollup/plugin-typescript';

export default {
  input: {
    'html-builder': 'lib/html-builder.ts',
    'css-builder': 'lib/css-builder.ts',
    'js-builder': 'lib/js-builder.ts',
    'builder': 'lib/builder.ts',
    'server': 'lib/server.ts',
  },
  plugins: [typescript()],
  output: {
    dir: 'bin',
    format: 'cjs',
    chunkFileNames: "lib/[name].js"
  },
};
