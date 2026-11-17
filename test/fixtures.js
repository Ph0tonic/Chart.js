import {createFixtures} from 'chartjs-test-utils';

// import.meta.glob resolves against this file, so the lookup has to live here
// rather than in chartjs-test-utils.
export const specsFromFixtures = createFixtures({
  configs: {
    ...import.meta.glob('./fixtures/**/*.js', {eager: true, import: 'default'}),
    ...import.meta.glob('./fixtures/**/*.json', {eager: true, import: 'default'})
  },
  images: import.meta.glob('./fixtures/**/*.png', {eager: true, import: 'default', query: '?url'}),
  prefix: './fixtures/'
});
