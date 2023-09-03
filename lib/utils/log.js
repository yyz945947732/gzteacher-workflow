/* eslint-disable no-console */
import chalk from 'chalk';

function error(...args) {
  console.error(chalk.red('ERROR'), ...args);
}

function warn(...args) {
  console.log(chalk.yellow('WARNING'), ...args);
}

function info(...args) {
  console.log(chalk.grey(...args));
}

function success(...args) {
  console.log(chalk.green(...args));
}

function debug(...args) {
  console.log(chalk.bgGray('DEBUG'), ...args);
}

export { debug, error, info, success, warn };
