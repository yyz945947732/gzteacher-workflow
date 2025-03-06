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
    const { getVersionFileName, getMsg, allowBranchs } = tag;
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

    const context = await generateContext(tag, contextBase);
    if (!context) return;

    // 后面的操作都会产生副作用，调试模式在此结束。
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
  }
}

/**
 * 生成 context 上下文
 * @param {Tag} tag
 * @param {Context} contextBase
 * @returns {Promise<Context>} context
 */
async function generateContext(tag, contextBase) {
  /** @type Context */
  const context = { ...contextBase };
  const { getFirstTagName, getTagName, getVersion, getEnv, getOrder } = tag;
  if (!context.preTagName) {
    if (!getFirstTagName) {
      warn('missing getFirstTagName config. job finished with nothing to do.');
      return null;
    }
    return {
      ...context,
      ...createFirstTag(tag, context),
    };
  }
  [context.preVersion, context.preEnv, context.preOrder] = parseTagName(
    context.preTagName
  );
  context.tagName = getTagName
    ? getTagName(context)
    : getFormatTagName(getVersion(context), getEnv(context), getOrder(context));

  [context.version, context.env, context.order] = parseTagName(context.tagName);
  return context;
}

/**
 * 创建首个 tag
 * @param {Tag} tagConfig
 * @param {Context} ctx
 * @returns {{version: string, env: string, order: string, tagName: string}} ctx
 */
function createFirstTag(tagConfig, ctx) {
  const { getFirstTagName } = tagConfig;
  const tagName = getFirstTagName(ctx);
  debug(`getFirstTagName => ${tagName}`);
  const [version, env, order] = parseTagName(tagName);
  return { version, env, order, tagName };
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
    throw new Error(`Failed to push tag ${context.tagName}: ${err.message}`);
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
      warn('通知配置缺失，跳过通知');
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
    throw new Error(`Failed to notify to WorkWechat: ${err.message}`);
  }
}

export default runTasks;
