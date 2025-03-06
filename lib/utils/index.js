import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { $ } from 'execa';
import { findUp } from 'find-up';
import fs from 'fs-extra';
import { defaultsDeep } from 'lodash-es';

import defaultConfig from '../config/index.js';
import { configFiles } from './constants.js';
import { error, info, warn } from './log.js';

/**
 * @typedef {import("../../types").WorkFlowConfig} WorkFlowConfig
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
        `Invalid tag format: "${tagName}". Expected format: {version}-{env}-{order}.`
      );
      return ['', '', ''];
    }
    return [version, env, order];
  }
  return ['', '', ''];
}

/**
 * 搜寻配置文件获取配置
 * @returns {Promise<WorkFlowConfig>} 配置信息
 */
async function getConfig() {
  try {
    const configPath = await findUp(configFiles);
    if (!configPath) {
      warn('No config file found. Using default values.');
      return {};
    }

    const configUrl = pathToFileURL(configPath);
    const config = (await import(configUrl.href)).default;

    if (typeof config !== 'object') {
      throw new Error('Invalid config file format.');
    }

    return config;
  } catch (err) {
    error(`Failed to load config: ${err.message}`);
    return {};
  }
}

/**
 * 搜寻版本文件路径，没有的话创建版本文件
 * @returns {Promise<string>} 版本文件路径
 */
async function getVersionFilePath(versionFileName) {
  const versionFilePath = await findUp(versionFileName);
  if (!versionFilePath) {
    info(
      `Could not find ${versionFileName}. trying to create ${versionFileName} to your project...`
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
    error(`Failed to update version file: ${err.message}`);
    return false;
  }
}

/**
 * 执行命令
 * @param {string} cmd 脚本命令
 * @returns {Promise<string>} 命令输出
 */
async function exec(cmd) {
  const { stdout, stderr } = await $({ shell: true })`${cmd}`;
  if (stdout) {
    return stdout;
  }
  if (stderr) {
    info(stderr);
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
    return defaultsDeep(config, defaultConfig);
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
  exec,
  getFormatTagName,
  getMergedConfig,
  getVersionFilePath,
  parseTagName,
  updateVersionFile,
};
