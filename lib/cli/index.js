import { readFileSync } from "fs";
import { runTasks } from './run.js';

const pkg = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8")
);

const helpText = `@gzteacher/workflow! v${pkg.version}

  Usage: autoTag [options]

  -h --help              Print this help
  -v --version           Print release-it version number
  -s --silence           Skip sending notify

For more details, please see https://github.com/yyz945947732/gzteacher-workflow`;

const version = () => console.log(`v${pkg.version}`);

const help = () => console.log(helpText);

export async function cli(options) {
  if (options.version) {
    version();
  } else if (options.help) {
    help();
  } else {
    return runTasks(options);
  }
  return Promise.resolve();
}
