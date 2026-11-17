import {fileURLToPath} from 'node:url';
import {playwright} from '@vitest/browser-playwright';
import {createSaveFixtureImage} from 'chartjs-test-utils/node';
import {defineConfig} from 'vitest/config';

// UPDATE_FIXTURES=1 rewrites the reference images that changed, from a
// Chromium render. See chartjs-test-utils "Updating reference images".
const updating = process.env.UPDATE_FIXTURES === '1';

// Keep the canvas on the CPU so that renders match the reference images.
// These are the flags and prefs the Karma launchers used.
const providers = {
  chromium: playwright({
    launchOptions: {
      args: [
        '--disable-accelerated-2d-canvas',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    }
  }),
  firefox: playwright({
    launchOptions: {
      // https://github.com/chartjs/Chart.js/issues/11164
      firefoxUserPrefs: {
        'layers.acceleration.disabled': true,
        'gfx.canvas.accelerated': false
      }
    }
  }),
  webkit: playwright()
};

const browsers = updating ? ['chromium'] : (process.env.BROWSERS || 'chromium,firefox').split(',');

export default defineConfig({
  resolve: {
    alias: {
      // chartjs-adapter-moment imports chart.js: point it to the sources under test.
      'chart.js': fileURLToPath(new URL('./src/index.ts', import.meta.url))
    }
  },
  optimizeDeps: {
    // Pre-bundling would inline its own copy of the chart.js adapters it
    // imports, so the adapter would not reach the sources under test.
    exclude: ['chartjs-adapter-moment']
  },
  test: {
    // The specs use describe/it/expect as globals, like they did with Jasmine.
    globals: true,
    include: ['test/specs/**/*.tests.js'],
    setupFiles: ['test/setup.js'],
    // Jasmine ran specs in random order: keep catching order dependencies.
    // A failing order can be replayed with --sequence.seed=<seed>.
    sequence: {shuffle: {files: false, tests: true}},
    browser: {
      enabled: true,
      headless: true,
      // Vitest defaults to a 414x896 mobile viewport: the responsive specs
      // were written against a desktop browser window, as Karma used.
      viewport: {width: 1024, height: 768},
      instances: browsers.map((browser) => ({browser, provider: providers[browser]})),
      commands: updating ? {saveFixtureImage: createSaveFixtureImage()} : {}
    },
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      // Type declarations only: nothing to cover, and they cannot be transformed.
      exclude: ['src/types.ts', 'src/types/**'],
      reporter: ['html', 'lcovonly'],
      reportsDirectory: 'coverage'
    }
  }
});
