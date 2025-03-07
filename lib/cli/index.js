import fs from 'fs-extra';

import runTasks from './run.js';

const pkg = fs.readJsonSync(new URL('../../package.json', import.meta.url));

const helpText = `@gzteacher/workflow! v${pkg.version}

  Usage: autoTag [options]

  -h --help              Show help
  -v --version           Show version
  -s --silence           Skip sending notify step
  -d --debug             Enable debug mode

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
