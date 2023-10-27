import typescript from '@rollup/plugin-typescript';

export default {
  input: {
    'html-builder': 'lib/builder/html.ts',
    'css-builder': 'lib/builder/css.ts',
    'js-builder': 'lib/builder/js.ts',
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
