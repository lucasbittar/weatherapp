/// <reference types="vitest/config" />
// ^ This triple-slash directive teaches TypeScript about the `test` key below.
//   Vitest reuses this same file, so the app and the tests share one config:
//   same plugins (React), same `@` alias, same `import.meta.env` handling.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/scripts'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },

  // ---------------------------------------------------------------------------
  // Vitest configuration — see docs/TESTING.md for the full walkthrough.
  // ---------------------------------------------------------------------------
  test: {
    // jsdom = a fake browser (window, document, navigator) running in Node.
    // Files that don't need a DOM (e.g. api/*.test.js) opt out with a
    // `// @vitest-environment node` comment at the top of the file.
    environment: 'jsdom',

    // Runs before every test file: adds DOM matchers like `toBeInTheDocument()`
    // and unmounts rendered components between tests.
    setupFiles: ['./app/scripts/test/setup.ts'],

    // Where to look for tests.
    include: ['app/scripts/**/*.test.{ts,tsx}', 'api/**/*.test.{js,ts}'],

    // Undo every `vi.stubEnv()` / `vi.stubGlobal()` after each test so
    // tests can't leak fake API keys or fake `fetch` into each other.
    unstubEnvs: true,
    unstubGlobals: true,
    restoreMocks: true,

    // In CI, also emit a JUnit XML report that GitHub Actions can show.
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: './reports/junit.xml' },

    coverage: {
      provider: 'v8', // uses V8's built-in coverage, no code instrumentation
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['app/scripts/**/*.{ts,tsx}', 'api/**/*.js'],
      exclude: ['**/*.test.*', 'app/scripts/test/**', '**/*.d.ts'],
    },
  },
});
