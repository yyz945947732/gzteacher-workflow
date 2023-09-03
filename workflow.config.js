/**
 * @typedef {import("./index.d.ts").WorkFlowConfig} WorkFlowConfig
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
      return branchName;
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
      if (branchName === 'test') {
        return '1.0.0-test-1';
      }
      return '1.0.0-dev-1';
    },
    allowBranchs: ['master', 'dev', 'test'],
  },
  notify: {
    getWebhookUrl: () => 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1d610f08-9e33-46df-8f1b-5e31045e267e',
    getContent: ({ username, tagName }) => `测试工具，打扰了，可以屏蔽我。\n
      >项目:<font color="comment">嗡嗡嗡</font>
      >执行人:<font color="comment">${username}</font>
      >TAG:<font color="comment">${tagName}</font>`,
    allowBranchs: ['master'],
  },
};

export default config;
