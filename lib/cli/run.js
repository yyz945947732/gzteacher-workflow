import { getMergedConfig } from "../utils/index.js";

/**
 * @typedef {import("../../index.d.ts").WorkFlowConfig} WorkFlowConfig
 * @typedef {import("../../index.d.ts").Options} Options
 */

/**
 * 执行任务
 * @param {Options} options
 */
async function runTasks(options) {
  const mergedConfig = await getMergedConfig();
  const { silence } = options;

  console.dir(mergedConfig);
}

export { runTasks };
