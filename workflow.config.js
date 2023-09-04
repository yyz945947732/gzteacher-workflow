// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
/**
 * @typedef {import("./types/index").WorkFlowConfig} WorkFlowConfig
 */

/**
 * @type {WorkFlowConfig}
 */
const config = {
  // {version}-{env}-{order}
  tag: {
    getEnv: ({ branchName }) => {
      if (branchName === 'master') {
        return 'prod';
      }
      return 'dev';
    },
    getMsg: ({ tagName }) => `🔖 ${tagName}`,
    getVersionFileName: ({ branchName }) => {
      if (branchName !== 'master') {
        return 'VERSION.DEV';
      }
      return 'VERSION';
    },
    getFirstTagName: ({ branchName }) => {
      if (branchName === 'master') {
        return '1.0.0-prod-1';
      }
      return '1.0.0-dev-1';
    },
    allowBranchs: ['master', 'dev', 'test'],
  },
  notify: {
    getWebhookUrl: () => process.env.WEBHOOK_URL,
    getContent: ({ username, tagName }) => `前端项目正式环境更新。\n
      >项目:<font color="comment">项目名字</font>
      >执行人:<font color="comment">${username}</font>
      >TAG:<font color="comment">${tagName}</font>`,
    allowBranchs: ['master'],
  },
};

export default config;
