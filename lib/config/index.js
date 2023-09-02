/**
 * @typedef {import("../../index.d.ts").WorkFlowConfig} WorkFlowConfig
 */

/**
 * @type {WorkFlowConfig}
 */
const defaultConfig = {
  tag: {
    getVersion: ({ preVersion }) => preVersion,
    getEnv: ({ preEnv }) => preEnv,
    getOrder: ({ preOrder }) => `${Number(preOrder) + 1}`,
    getMsg: ({ tagName }) => `chore: release ${tagName}`,
    getVersionFileName: () => 'VERSION',
    getFirstTagName: undefined,
    allowBranchs: undefined,
  },
  notify: undefined,
};

export default defaultConfig;
