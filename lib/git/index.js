import { exec } from "../utils/index.js";

/**
 * 获取最新的 tag 名
 * @returns {Promise<string>} tag 名
 */
async function getLastedTagName() {
  const lastedTagName = await exec("git describe --tags --abbrev=0");
  return lastedTagName;
}

/**
 * 获取最新的分支名
 * @returns {Promise<string>} 分支名
 */
async function getBranchName() {
  const branchName = await exec("git rev-parse --abbrev-ref HEAD");
  return branchName;
}

export { getLastedTagName, getBranchName };
