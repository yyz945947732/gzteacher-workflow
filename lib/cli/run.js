import axios from 'axios';
import { defaults } from 'lodash-es';

import {
  executeGitAdd,
  executeGitCommit,
  executeGitCreateTag,
  executeGitPullAll,
  executeGitPushBranch,
  executeGitPushTag,
  getBranchName,
  getLastedTagName,
  getUserName,
} from '../git/index.js';
import { DEFAULT_CONTEXT } from '../utils/constants.js';
import {
  getFormatTagName,
  getMergedConfig,
  getVersionFilePath,
  parseTagName,
  updateVersionFile,
} from '../utils/index.js';
import { debug as debugLog, error, success, warn } from '../utils/log.js';

/**
 * @typedef {import("../../index.d.ts").WorkFlowConfig} WorkFlowConfig
 * @typedef {import("../../index.d.ts").Context} Context
 * @typedef {import("../../index.d.ts").Tag} Tag
 * @typedef {import("../../index.d.ts").Notify} Notify
 * @typedef {import("../../index.d.ts").Options} Options
 */

let isDebugOpen = false;

/**
 * 执行任务
 * @param {Options} options
 */
async function runTasks(options) {
  try {
    const mergedConfig = await getMergedConfig();
    const { silence } = options;
    const { tag, notify } = mergedConfig;
    if (!tag) {
      warn('missing tag config. job finished with nothing to do.');
      return;
    }
    if (options.debug) {
      isDebugOpen = true;
    }
    const {
      getVersion,
      getEnv,
      getOrder,
      getTagName,
      getVersionFileName,
      getFirstTagName,
      allowBranchs,
    } = tag;
    const branchName = await getBranchName();
    if (allowBranchs && !allowBranchs.includes(branchName)) {
      warn(
        `branch ${branchName} is not allowed. job finished with nothing to do.`
      );
      return;
    }
    const username = await getUserName();
    const preTagName = await getLastedTagName();
    let { tagName, version, env, order, preVersion, preEnv, preOrder } = DEFAULT_CONTEXT;
    // 第一次打 tag
    if (!preTagName) {
      if (!getFirstTagName) {
        warn(
          'missing getFirstTagName config. job finished with nothing to do.'
        );
        return;
      }
      const ctx = defaults({ branchName, username }, DEFAULT_CONTEXT);
      [version, env, order, tagName] = createfirstTag(tag, ctx);
    } else {
      // 之前打过 tag
      [preVersion, preEnv, preOrder] = parseTagName(preTagName);
      const ctx = defaults(
        {
          branchName,
          username,
          preVersion,
          preEnv,
          preOrder,
          preTagName,
        },
        DEFAULT_CONTEXT
      );
      if (getTagName) {
        tagName = getTagName(ctx);
        debug(`getTagName => ${tagName}`);
      } else {
        version = getVersion(ctx);
        debug(`getVersion => ${version}`);
        env = getEnv(ctx);
        debug(`getEnv => ${env}`);
        order = getOrder(ctx);
        debug(`getOrder => ${order}`);
        tagName = getFormatTagName(version, env, order);
        debug(`getTagName => ${tagName}`);
      }
    }
    /** @type Context */
    const context = {
      branchName,
      username,
      version,
      env,
      order,
      tagName,
      preVersion,
      preEnv,
      preOrder,
      preTagName,
    };
    debug(`ctx => ${JSON.stringify(context, null, 2)}`);
    if (getVersionFileName !== false) {
      const versionFileName = getVersionFileName(context);
      debug(`getVersionFileName => ${versionFileName}`);
      if (!isDebugOpen) {
        const versionFilePath = await getVersionFilePath(versionFileName);
        const isUpdateSuccessed = await updateVersionFile(
          versionFilePath,
          tagName
        );
        if (!isUpdateSuccessed) {
          error(
            `update version file ${versionFileName} from path ${versionFilePath} failed.`
          );
        } else {
          await pushVersionFile(tag, context);
        }
      }
    }
    await pushTag(tag, context);
    if (notify && !silence) {
      await notifyToWorkWechat(notify, context);
    }
    if (!isDebugOpen) {
      success(`tag 上传成功: ${tagName}`);
    }
  } catch (err) {
    error(err);
    throw err;
  }
}

/**
 * 创建首个 tag
 * @param {Tag} tagConfig
 * @param {Context} ctx
 * @returns {[string, string, string, string]} [version, env, order, tagName]
 */
function createfirstTag(tagConfig, ctx) {
  const { getFirstTagName } = tagConfig;
  const tagName = getFirstTagName(ctx);
  debug(`getFirstTagName => ${tagName}`);
  const [version, env, order] = parseTagName(tagName);
  return [version, env, order, tagName];
}

/**
 * 打印日志
 * @param {string} msg
 */
function debug(msg) {
  if (isDebugOpen) {
    debugLog(msg);
  }
}

/**
 * 推送版本文件到仓库
 * @param {Tag} tagConfig
 * @param {Context} context
 */
async function pushVersionFile(tagConfig, context) {
  if (!isDebugOpen) {
    try {
      const { getMsg } = tagConfig;
      const { branchName } = context;
      const message = getMsg(context);
      await executeGitAdd();
      await executeGitCommit(message);
      await executeGitPushBranch(branchName);
    } catch (err) {
      error(err);
      process.exit();
    }
  }
}

/**
 * 推送 tag 到仓库
 * @param {Tag} tagConfig
 * @param {Context} context
 */
async function pushTag(tagConfig, context) {
  if (!isDebugOpen) {
    try {
      const { getMsg } = tagConfig;
      const message = getMsg(context);
      const { tagName } = context;
      await executeGitPullAll();
      await executeGitCreateTag(tagName, message);
      await executeGitPushTag(tagName);
    } catch (err) {
      error(err);
      process.exit();
    }
  }
}

/**
 * 推送消息到企业微信
 * @param {Notify} notify
 * @param {Context} context
 */
async function notifyToWorkWechat(notify, context) {
  if (!isDebugOpen) {
    try {
      const { branchName } = context;
      const { getWebhookUrl, getContent, allowBranchs } = notify;
      if (allowBranchs && !allowBranchs.includes(branchName)) {
        return;
      }
      const url = getWebhookUrl(context);
      const message = getContent(context);
      await axios.post(url, {
        msgtype: 'markdown',
        markdown: {
          content: message,
        },
      });
    } catch (err) {
      error(err);
    }
  }
}

export default runTasks;
