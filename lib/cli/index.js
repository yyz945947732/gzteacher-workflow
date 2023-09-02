import fs from 'fs-extra';

import runTasks from './run.js';

const pkg = fs.readJsonSync('./package.json');

const helpText = `@gzteacher/workflow! v${pkg.version}

  Usage: autoTag [options]

  -h --help              Print this help
  -v --version           Print release-it version number
  -s --silence           Skip sending notify
  -d --debug             Do not execute side effect git operations only debugging

For more details, please see https://github.com/yyz945947732/gzteacher-workflow`;

// eslint-disable-next-line no-console
const version = () => console.log(`v${pkg.version}`);

// eslint-disable-next-line no-console
const help = () => console.log(helpText);

async function cli(options) {
  if (options.version) {
    version();
  } else if (options.help) {
    help();
  } else {
    return runTasks(options);
  }
  return Promise.resolve();
}

export default cli;
