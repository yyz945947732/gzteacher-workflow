import { defaults } from 'lodash-es';
import { sendMarkdown } from 'qywechat';

import {
  executeGitAdd,
  executeGitCommit,
  executeGitCreateTag,
  executeGitFetch,
  executeGitPushBranch,
  executeGitPushTag,
  getBranchName,
  getLatestTagName,
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
 * @typedef {import("../../types").WorkFlowConfig} WorkFlowConfig
 * @typedef {import("../../types").Context} Context
 * @typedef {import("../../types").Tag} Tag
 * @typedef {import("../../types").Notify} Notify
 * @typedef {import("../../types").Options} Options
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
      getMsg,
      allowBranchs,
    } = tag;
    await executeGitFetch();
    const branchName = await getBranchName();
    if (allowBranchs && !allowBranchs.includes(branchName)) {
      warn(
        `branch ${branchName} is not allowed. job finished with nothing to do.`
      );
      return;
    }
    const username = await getUserName();
    const preTagName = await getLatestTagName();
    const contextBase = defaults(
      { branchName, username, preTagName },
      DEFAULT_CONTEXT
    );

    /** @type Context */
    const context = { ...contextBase };

    // 第一次打 tag
    if (!preTagName) {
      if (!getFirstTagName) {
        warn(
          'missing getFirstTagName config. job finished with nothing to do.'
        );
        return;
      }
      [context.version, context.env, context.order, context.tagName] = createFirstTag(tag, context);
    } else {
      // 之前打过 tag
      [context.preVersion, context.preEnv, context.preOrder] = parseTagName(preTagName);
      if (getTagName) {
        context.tagName = getTagName(context);
        [context.version, context.env, context.order] = parseTagName(
          context.tagName
        );
      } else {
        context.version = getVersion(context);
        context.env = getEnv(context);
        context.order = getOrder(context);
        context.tagName = getFormatTagName(
          context.version,
          context.env,
          context.order
        );
      }
    }

    // 后面的操作都会产生副作用，调试模式再次此束
    if (isDebugOpen) {
      const message = getMsg(context);
      const fileName = getVersionFileName !== false ? getVersionFileName(context) : undefined;
      debug(`getVersion => ${context.version}`);
      debug(`getEnv => ${context.env}`);
      debug(`getOrder => ${context.order}`);
      debug(`getTagName => ${context.tagName}`);
      debug(`getVersionFileName => ${fileName}`);
      debug(`getMsg => ${message}`);
      debug(`context => ${JSON.stringify(context, null, 2)}`);
      success('调试完毕');
      return;
    }

    if (getVersionFileName !== false) {
      const versionFileName = getVersionFileName(context);
      const versionFilePath = await getVersionFilePath(versionFileName);
      const isUpdateSuccessed = await updateVersionFile(
        versionFilePath,
        context.tagName
      );
      if (!isUpdateSuccessed) {
        error(
          `update version file ${versionFileName} from path ${versionFilePath} failed.`
        );
      }
      await pushVersionFile(tag, context);
    }
    await pushTag(tag, context);
    if (notify && !silence) {
      await notifyToWorkWechat(notify, context);
    }
    success(`tag 上传成功: ${context.tagName}`);
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
function createFirstTag(tagConfig, ctx) {
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
  try {
    const { getMsg } = tagConfig;
    const { branchName } = context;
    const message = getMsg(context);
    await executeGitAdd();
    await executeGitCommit(message);
    await executeGitPushBranch(branchName);
  } catch (err) {
    error(err);
    throw new Error(`Failed to push version file: ${err.message}`);
  }
}

/**
 * 推送 tag 到仓库
 * @param {Tag} tagConfig
 * @param {Context} context
 */
async function pushTag(tagConfig, context) {
  try {
    const { getMsg } = tagConfig;
    const message = getMsg(context);
    const { tagName } = context;
    await executeGitCreateTag(tagName, message);
    await executeGitPushTag(tagName);
  } catch (err) {
    error(err);
    throw new Error(`Failed to push tag: ${err.message}`);
  }
}

/**
 * 推送消息到企业微信
 * @param {Notify} notify
 * @param {Context} context
 */
async function notifyToWorkWechat(notify, context) {
  try {
    const { branchName } = context;
    const { getWebhookUrl, getContent, allowBranchs } = notify;
    if (allowBranchs && !allowBranchs.includes(branchName)) {
      return;
    }
    if (!getWebhookUrl || !getContent) {
      return;
    }
    const url = getWebhookUrl(context);
    const content = getContent(context);
    if (!url || !content) {
      return;
    }
    await sendMarkdown({
      url,
      content,
    });
  } catch (err) {
    error(err);
  }
}

export default runTasks;
