import {readFileSync} from 'fs';
import {defineConfig} from 'rolldown';

const {version, homepage} = JSON.parse(readFileSync('./package.json'));

const banner = `/*!
 * Chart.js v${version}
 * ${homepage}
 * (c) ${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} Chart.js Contributors
 * Released under the MIT License
 */`;

const input = {
  resolve: {
    // The sources import TypeScript modules with a .js extension.
    extensionAlias: {'.js': ['.ts', '.js']}
  },
  transform: {
    target: 'es2022'
  }
};

// Unminified builds keep license and annotation (/* @__PURE__ */) comments only.
const comments = {legal: true, annotation: true, jsdoc: false};

const umd = (file) => ({
  ...input,
  input: 'src/index.umd.ts',
  output: {
    name: 'Chart',
    file,
    format: 'umd',
    minify: true,
    // Added after minification, which would otherwise strip it.
    postBanner: banner,
    // Keep the license of the bundled dependencies (@kurkle/color), like terser did.
    comments: {legal: true, annotation: false, jsdoc: false},
    sourcemap: true
  }
});

const modules = (format, extension) => ({
  ...input,
  input: {
    'dist/chart': 'src/index.ts',
    'dist/helpers': 'src/helpers/index.ts'
  },
  external: _ => (/node_modules/).test(_),
  output: {
    dir: './',
    chunkFileNames: `dist/chunks/[name].${extension}`,
    entryFileNames: `[name].${extension}`,
    banner,
    format,
    comments,
    sourcemap: true
  }
});

export default defineConfig([
  // UMD build
  // dist/chart.umd.min.js
  umd('dist/chart.umd.min.js'),

  // UMD build
  // dist/chart.umd.js (old filename)
  umd('dist/chart.umd.js'),

  // ES6 builds
  // dist/chart.js
  // helpers/*.js
  modules('esm', 'js'),

  // CommonJS builds
  // dist/chart.js
  // helpers/*.js
  modules('cjs', 'cjs')
]);
