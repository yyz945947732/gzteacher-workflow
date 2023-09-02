#!/usr/bin/env node
import fs from 'fs-extra';
import updater from 'update-notifier';
import parseArgs from 'yargs-parser';

import cli from '../lib/cli/index.js';

const pkg = fs.readJsonSync('../package.json');

const aliases = {
  h: 'help',
  v: 'version',
  s: 'silence',
  d: 'debug',
};

const parseCliArguments = (args) => {
  const options = parseArgs(args, {
    boolean: ['silence', 'debug'],
    alias: aliases,
  });
  return options;
};

const options = parseCliArguments([].slice.call(process.argv, 2));

updater({ pkg }).notify();

cli(options).then(
  () => process.exit(0),
  ({ code }) => process.exit(Number.isInteger(code) ? code : 1)
);
