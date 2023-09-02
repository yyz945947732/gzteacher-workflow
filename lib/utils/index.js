import { EOL } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { $ } from 'execa';
import { findUp } from 'find-up';
import fs from 'fs-extra';
import { defaults } from 'lodash-es';

import defaultConfig from '../config/index.js';
import { configFiles, doc } from './constants.js';
import { error, warn } from './log.js';

/**
 * @typedef {import("../../index.d.ts").WorkFlowConfig} WorkFlowConfig
 */

/**
 * 解析标签名 `{version}-{env}-{order}`
 * @param {string} tagName 标签名
 * @returns {[string, string, string]} `[prefix, env, version]`
 */
function parseTagName(tagName) {
  if (tagName) {
    const [version, env, order] = tagName.split('-');
    if (!version || !env || !order) {
      warn(
        `tagName ${tagName} is not format {version}-{env}-{order}. you may using a custom tag. so version、env、order in context will provide empty string`
      );
      return ['', '', ''];
    }
    return [version, env, order];
  }
  return ['', '', ''];
}

/**
 *
 * @param {string} message 错误信息
 * @param {boolean} fail=true 是否执行失败
 * @returns {Error}
 */
function e(message, fail = true) {
  const err = new Error(`${message}${EOL}Documentation: ${doc}${EOL}`);
  // @ts-ignore
  err.code = fail ? 1 : 0;
  return err;
}

/**
 * 搜寻配置文件获取配置
 * @returns {Promise<WorkFlowConfig | undefined>} 配置信息
 */
async function getConfig() {
  const configPath = await findUp(configFiles);
  if (configPath) {
    const configUrl = await pathToFileURL(configPath);
    return (await import(configUrl.href)).default;
  }
  throw e(
    `Could not find workflow.config.js.${EOL}Please add a workflow.config.js to your project.`
  );
}

/**
 * 搜寻版本文件路径，没有的话创建版本文件
 * @returns {Promise<string>} 版本文件路径
 */
async function getVersionFilePath(versionFileName) {
  const versionFilePath = await findUp(versionFileName);
  if (!versionFilePath) {
    warn(
      `Could not find ${versionFileName}. trying to create ${versionFileName} to your project`
    );
    const filePath = join(process.cwd(), versionFileName);
    return filePath;
  }
  return versionFilePath;
}

/**
 * 更新版本文件
 * @returns {Promise<boolean>} 是否更新成功
 */
async function updateVersionFile(versionFilePath, tagName) {
  try {
    await fs.outputFile(versionFilePath, tagName);
    return true;
  } catch (err) {
    error(err);
    return false;
  }
}

/**
 * 文件是否有权限
 * @param {string} path 文件路径是否有访问权限
 * @returns {boolean} 是否有权限
 */
function hasAccess(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (err) {
    error(err);
    return false;
  }
}

/**
 * 执行命令
 * @param {string} cmd 脚本命令
 * @returns {Promise<string>} 命令输出
 */
async function exec(cmd) {
  const { stdout, stderr } = await $`${cmd}`;
  if (stdout) {
    return stdout;
  }
  if (stderr) {
    error(stderr);
  }
  return '';
}

/**
 * 获取合并默认配置后的配置
 * @returns {Promise<WorkFlowConfig | undefined>}
 */
async function getMergedConfig() {
  try {
    const config = await getConfig();
    if (typeof config === 'object') {
      const mergedConfig = defaults(config, defaultConfig);
      return mergedConfig;
    }
    throw e(
      `workflow.config.js format is not legal.${EOL}Please check your workflow.config.js.`
    );
  } catch (err) {
    error(err);
    return undefined;
  }
}

/**
 * 获取符合 {version}-{env}-{order} 格式的 tag 名
 * @param {string} version
 * @param {string} env
 * @param {string} order
 * @returns {string}
 */
function getFormatTagName(version, env, order) {
  return `${version}-${env}-${order}`;
}

export {
  e,
  exec,
  getConfig,
  getFormatTagName,
  getMergedConfig,
  getVersionFilePath,
  hasAccess,
  parseTagName,
  updateVersionFile,
};
