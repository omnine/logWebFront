// Import rollup plugins
import  { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import template from "rollup-plugin-html-literals";
import summary from 'rollup-plugin-summary';

export default {
  plugins: [
    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    html({
      input: 'index.html',
    }),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    template(),
    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // Optional: copy any static assets to build directory
    copy({
      targets: [
        { src: 'index.html',
          dest: 'dist/public',
          transform: (contents, filename) => contents.toString().replace('./out-tsc/src/main.js', '/home/main.js') },
        { src: 'images/**/*', dest: 'dist/images' }
      ]
    }),    
    // Print bundle summary
    summary(),
  ],
  output: {
    dir: 'dist',
  },
  preserveEntrySignatures: 'strict',
};