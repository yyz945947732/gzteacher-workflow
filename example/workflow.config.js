/**
 * @typedef {import("../index.d.ts").WorkFlowConfig} WorkFlowConfig
 */

/**
 * @type {WorkFlowConfig}
 */
const config = {
  /**
   * tag 相关配置
   *
   * 支持格式：{version}-{env}-{order}
   */
  tag: {
    /**
     * 配置获取 tag 格式 {version}-{env}-{order} 中 version 值的方法。
     *
     * 默认取上一个标签中 version 的值。
     * @default ({ preVersion }) => preVersion
     */
    getVersion: ({ preVersion }) => preVersion,
    /**
     * 配置获取 tag 格式 {version}-{env}-{order} 中 env 值的方法。
     *
     * 默认取上一个标签中 env 的值。
     * @default ({ preEnv }) => preEnv
     */
    getEnv: ({ branchName }) => {
      if (branchName === 'master') {
        return 'prod';
      }
      return 'dev';
    },
    /**
     * 配置获取 tag 格式 {version}-{env}-{order} 中 order 值的方法。
     *
     * 默认取上一个标签中 order 的值加 1。
     * @default ({ preOrder }) => `${Number(preOrder) + 1}`
     */
    getOrder: ({ preOrder }) => `${Number(preOrder) + 1}`,
    /**
     * 配置获取 tagName 的方法。结果将替换原 {version}-{env}-{order} 格式的组装。
     *
     * @default undefined
     */
    getTagName: ({ preVersion, preEnv, preOrder }) => {
      const order = Number(preOrder) + 1;
      return `${preVersion}-${preEnv}-${order}`;
    },
    /**
     * 配置获取 commit 内容的方法。
     * @default ({ tagName }) => `chore: release ${tagName}`
     */
    getMsg: ({ tagName }) => `🔖 ${tagName}`,
    /**
     * 配置获取版本号文件名的方法，`false` 时关闭更新版本号文件的行为。
     * @default "VERSION"
     */
    getVersionFileName: ({ branchName }) => {
      if (branchName !== 'master') {
        return 'VERSION.DEV';
      }
      return 'VERSION';
    },
    /**
     * 配置获取第一个 tag 名的方法，将在仓库还没有 tag 记录时使用。
     *
     * `undefined` 时不自动提交第一个 tag。
     * @default undefined
     */
    getFirstTagName: ({ branchName }) => {
      if (branchName === 'master') {
        return '1.0.0-prod-1';
      }
      return '1.0.0-dev-1';
    },
    /**
     * 允许触发 tag 流程的分支名。
     *
     * `undefined` 时不限制分支名。
     * @default undefined
     */
    allowBranchs: ['master', 'dev', 'test'],
  },
  /**
   * 企业微信消息通知相关配置
   * @see https://developer.work.weixin.qq.com/document/path/91770
   */
  notify: {
    /**
     * 配置获取消息机器人 webhook 的方法。
     *
     * 添加机器人方法: https://developer.work.weixin.qq.com/document/path/91770
     *
     * `undefined` 时不发送消息。
     * @default undefined
     */
    getWebhookUrl: () => 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=<your key>',
    /**
     * 配置获取消息内容的方法。支持 md 格式。
     *
     * `undefined` 时不发送消息。
     * @see https://developer.work.weixin.qq.com/document/path/91770
     * @default undefined
     */
    getContent: ({ username, tagName }) => `前端项目正式环境更新。\n
          >项目:<font color="comment">前端项目名</font>
          >执行人:<font color="comment">${username}</font>
          >TAG:<font color="comment">${tagName}</font>`,
    /**
     * 允许触发消息通知流程的分支名。
     *
     * `undefined` 时不限制分支名。
     * @default undefined
     */
    allowBranchs: ['master'],
  },
};

export default config;
