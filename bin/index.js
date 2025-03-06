#!/usr/bin/env node

import fs from 'fs-extra';
import updater from 'update-notifier';
import parseArgs from 'yargs-parser';

import cli from '../lib/cli/index.js';
import { error } from '../lib/utils/log.js';

const pkg = fs.readJsonSync(new URL('../package.json', import.meta.url));

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

const options = parseCliArguments(process.argv.slice(2));

updater({ pkg }).notify();

cli(options)
  .then(() => process.exit(0))
  .catch((err) => {
    error(err);
    process.exit(err?.code && Number.isInteger(err.code) ? err.code : 1);
  });
