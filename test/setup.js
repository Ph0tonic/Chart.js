import './globals.js';
import {specsFromFixtures} from './fixtures.js';
import {acquireChart, afterEvent, createMockContext, releaseChart, setup, toEqualImageData, triggerMouseEvent, waitForResize} from 'chartjs-test-utils';

const Chart = window.Chart;

// force ratio=1 for tests on high-res/retina devices
// fixes https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

// setup() pins Chart.defaults.devicePixelRatio, which the specs never relied on
// (they pin window.devicePixelRatio above): keep the real default.
const devicePixelRatio = Chart.defaults.devicePixelRatio;
setup({Chart});
Chart.defaults.devicePixelRatio = devicePixelRatio;

// TODO: remove once chartjs-test-utils accepts OffscreenCanvasRenderingContext2D
// in toEqualImageData (1.0.0 only resolves CanvasRenderingContext2D, 0.x did not
// check). Copies the offscreen pixels to a regular canvas before comparing.
expect.extend({
  toEqualImageData(actual, expected, opts) {
    const ctx = actual && actual.ctx;
    if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && ctx instanceof OffscreenCanvasRenderingContext2D) {
      const {width, height} = ctx.canvas;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').putImageData(ctx.getImageData(0, 0, width, height), 0, 0);
      return toEqualImageData(canvas, expected, opts);
    }
    return toEqualImageData(actual, expected, opts);
  }
});

// The specs use the test utils as globals, like they did with Karma.
window.acquireChart = acquireChart;
window.afterEvent = afterEvent;
window.releaseChart = releaseChart;
window.waitForResize = waitForResize;
window.createMockContext = createMockContext;
window.triggerMouseEvent = triggerMouseEvent;
window.specsFromFixtures = specsFromFixtures;

beforeAll(() => {
  // Disable colors plugin for tests.
  Chart.defaults.plugins.colors.enabled = false;
});
