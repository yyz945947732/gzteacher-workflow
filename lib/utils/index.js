import * as fs from "node:fs";
import { EOL } from "node:os";
import { findUp } from "find-up";
import { pathToFileURL } from "node:url";
import { configFiles, doc } from "./constants.js";
import chalk from "chalk";
import { defaults } from "lodash-es";
import { $ } from "execa";
import { defaultConfig } from "../config/index.js";

/**
 * @typedef {import("../../index.d.ts").WorkFlowConfig} WorkFlowConfig
 */

/**
 * 解析标签名 `{prefix}-{env}-{version}`
 * @param {string} tagName 标签名
 * @returns {{ prefix: string, env: string, version: string }} 解析信息
 */
function parseTagName(tagName) {
  if (tagName) {
    const [prefix, env, version] = tagName.split("-");
    return {
      prefix,
      env,
      version,
    };
  }
  return {
    prefix: "",
    env: "",
    version: "",
  };
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
  } else {
    throw e(
      `Could not find workflow.config.js.${EOL}Please add a workflow.config.js for your project.`
    );
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
    return false;
  }
}

/**
 * 执行命令
 * @param {string} cmd 脚本命令
 * @returns {Promise<string>} 命令输出
 */
async function exec(cmd) {
  try {
    const { stdout, stderr } = await $`${cmd}`;
    if (stdout) {
      return stdout;
    } else if (stderr) {
      console.error(chalk.red("ERROR"), stderr);
    }
    return "";
  } catch (e) {
    console.error(chalk.red("ERROR"), e);
    return "";
  }
}

/**
 *
 * @param {string} message 错误信息
 * @param {boolean} fail=true 是否执行失败
 * @returns {Error}
 */
function e(message, fail = true) {
  const error = new Error(`${message}${EOL}Documentation: ${doc}${EOL}`);
  // @ts-ignore
  error.code = fail ? 1 : 0;
  return error;
}

/**
 * 获取合并默认配置后的配置
 * @returns {Promise<WorkFlowConfig | undefined>}
 */
async function getMergedConfig() {
  try {
    const config = await getConfig();
    if (typeof config === "object") {
      const mergedConfig = defaults(config, defaultConfig);
      return mergedConfig;
    }
  } catch (e) {
    console.error(chalk.red("ERROR"), e);
  }
}

export { parseTagName, getConfig, hasAccess, exec, e, getMergedConfig };
