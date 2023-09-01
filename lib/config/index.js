/**
 * @typedef {import("../../index.d.ts").WorkFlowConfig} WorkFlowConfig
 */

/**
 * @type {WorkFlowConfig}
 */
const defaultConfig = {
  tag: {
    getPrefix: ({ prefix }) => {
      return prefix;
    },
    getEnv: ({ env }) => {
      return env;
    },
    getVersion: ({ version }) => {
      return `${Number(version) + 1}`;
    },
    getMsg: ({ tagName }) => {
      return `chore: release ${tagName}`;
    },
    getVersionFileName: () => {
      return "VERSION";
    },
    getFirstTag: undefined,
    allowBranchs: undefined,
  },
  notify: undefined,
};

export { defaultConfig };
