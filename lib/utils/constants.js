/**
 * @typedef {import("../../types").Context} Context
 */

const CONFIG_NAME = /** @type {const} */ ('workflow.config');

const CONFIG_EXTENSIONS = /** @type {const} */ ([
  '.ts',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
  '.cjs',
]);

/** @type {Array<string>} */
export const CONFIG_FILES = CONFIG_EXTENSIONS.map((ext) => CONFIG_NAME + ext);

/** @type {RegExp} */
export const TAGNAME_REGX = /^([\w.]+)-([\w.]+)-([\w.]+)$/;

/** @type {Context} */
export const DEFAULT_CONTEXT = {
  branchName: '',
  username: '',
  tagName: '',
  version: '',
  env: '',
  order: '',
  preVersion: '',
  preEnv: '',
  preOrder: '',
  preTagName: '',
};
