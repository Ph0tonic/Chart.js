// The specs and fixtures were written for Karma, which loaded Chart.js and
// moment as globals. Imported first by test/setup.js: ES modules evaluate their
// imports before their own body, so the fixtures need these to already exist.
import moment from 'moment-timezone';
import '../src/index.umd.ts'; // registers everything and sets window.Chart
import 'chartjs-adapter-moment';

window.moment = moment;

// Set a fixed time zone (and, in particular, disable Daylight Saving Time) for
// more stable test results.
moment.tz.setDefault('Etc/UTC');
