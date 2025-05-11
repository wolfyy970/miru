import { defineConfig } from 'tsup';
import { copy } from 'esbuild-plugin-copy';

export default defineConfig({
  entry: {
    'service-worker': 'client/src/service-worker.ts',
    'content-script': 'client/src/content-script.ts',
    'popup': 'client/src/popup.ts',
    'options': 'client/src/options.ts',
    'diff-worker': 'client/src/diff-worker.ts'
  },
  format: ['esm'],
  outDir: 'dist',
  shims: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: ['lit'],
  outExtension() {
    return {
      js: `.js`,
    };
  },
  esbuildPlugins: [
    copy({
      resolveFrom: 'cwd',
      assets: [
        {
          from: ['client/public/**/*'],
          to: ['./dist'],
        },
      ],
    }),
  ],
}); 