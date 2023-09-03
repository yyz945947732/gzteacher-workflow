import { exec } from '../utils/index.js';
import { info, warn } from '../utils/log.js';

/**
 * 获取最新的 tag 名
 * @returns {Promise<string>} tag 名
 */
async function getLastedTagName() {
  try {
    const lastedTagName = await exec('git describe --tags --abbrev=0');
    return lastedTagName;
  } catch (err) {
    if (err.message.includes('No names found, cannot describe anything.')) {
      info(
        'No tag found in your project. trying to create first tag if you set getFirstTagName config...'
      );
      return '';
    }
    throw err;
  }
}

/**
 * 获取当前分支名
 * @returns {Promise<string>} 分支名
 */
async function getBranchName() {
  const branchName = await exec('git rev-parse --abbrev-ref HEAD');
  return branchName;
}

/**
 * 获取当前用户名
 * @returns {Promise<string>} 分支名
 */
async function getUserName() {
  try {
    const username = await exec('git config user.name');
    return username;
  } catch (err) {
    warn(err);
    return '未知';
  }
}

/**
 * 执行 `git add .` 命令
 */
async function executeGitAdd() {
  await exec('git add .');
}

/**
 * 执行 `git commit -m {message}` 命令
 *
 * @param {string} message
 */
async function executeGitCommit(message) {
  await exec(`git commit -m "${message}"`);
}

/**
 * 执行 `git push origin {branchName}` 命令
 *
 * @param {string} branchName
 */
async function executeGitPushBranch(branchName) {
  await exec(`git push origin ${branchName}`);
}

/**
 * 执行 `git pull --all` 命令
 */
async function executeGitPullAll() {
  await exec('git pull --all');
}

/**
 * 执行 `git tag --annotate --message="{message}" {tagName}` 命令
 *
 * @param {string} tagName
 * @param {string} message
 */
async function executeGitCreateTag(tagName, message) {
  await exec(`git tag --annotate --message="${message}" ${tagName}`);
}

/**
 * 执行 `git push origin {tagName}` 命令
 *
 * @param {string} tagName
 */
async function executeGitPushTag(tagName) {
  await exec(`git push origin ${tagName}`);
}

export {
  executeGitAdd,
  executeGitCommit,
  executeGitCreateTag,
  executeGitPullAll,
  executeGitPushBranch,
  executeGitPushTag,
  getBranchName,
  getLastedTagName,
  getUserName,
};
