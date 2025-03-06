/* eslint-disable no-console */
import chalk from 'chalk';

function error(...args) {
  console.error(chalk.red.bold('ERROR'), ...args);
}

function warn(...args) {
  console.log(chalk.yellow('WARNING'), ...args);
}

function info(...args) {
  console.log(chalk.blue('INFO'), ...args);
}

function success(...args) {
  console.log(chalk.green('SUCCESS'), ...args);
}

function debug(...args) {
  console.log(chalk.gray('DEBUG'), ...args);
}

export { debug, error, info, success, warn };
