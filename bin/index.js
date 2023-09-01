#!/usr/bin/env node
import { cli } from "../lib/cli/index.js";
import { readFileSync } from "fs";
import updater from "update-notifier";
import parseArgs from "yargs-parser";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const aliases = {
  h: "help",
  v: "version",
  s: "silence",
};

const parseCliArguments = (args) => {
  const options = parseArgs(args, {
    boolean: ["silence"],
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
