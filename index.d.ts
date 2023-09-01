/** workflow.config.js 配置 */
export interface WorkFlowConfig {
  /**
   * tag 相关配置，`undefined` 时关闭  tag 行为
   */
  tag?: Tag;
  /**
   * 企业微信消息通知相关配置，`undefined` 时关闭消息通知行为
   * @default undefined
   */
  notify?: Notify;
}

/**
 * tag 相关配置
 *
 * 支持格式：{prefix}-{env}-{version}
 */
export interface Tag {
  /**
   * 配置获取 tag 格式 {prefix}-{env}-{version} 中 prefix 值的方法。
   *
   * 默认取上一个标签中 prefix 的值。
   * @default ({ prefix }) => prefix
   */
  getPrefix?: (ctx: Context) => string;
  /**
   * 配置获取 tag 格式 {prefix}-{env}-{version} 中 env 值的方法。
   *
   * 默认取上一个标签中 env 的值。
   * @default ({ env }) => env
   */
  getEnv?: (ctx: Context) => string;
  /**
   * 配置获取 tag 格式 {prefix}-{env}-{version} 中 version 值的方法。
   *
   * 默认取上一个标签中 version 的值加 1。
   * @default ({ version }) => `${Number(version) + 1}`
   */
  getVersion?: (ctx: Context) => string;
  /**
   * 配置获取 commit 内容的方法。
   * @default ({ tagName }) => `chore: release ${tagName}`
   */
  getMsg?: (ctx: Context) => string;
  /**
   * 配置获取版本号文件名的方法，`false` 时关闭更新版本号文件的行为。
   * @default "VERSION"
   */
  getVersionFileName?: ((ctx: Context) => string) | false;
  /**
   * 配置获取第一个 tag 名的方法，将在仓库还没有 tag 记录时使用。
   *
   * `undefined` 时不自动提交第一个 tag。
   * @default undefined
   */
  getFirstTag?: (ctx: Context) => string;
  /**
   * 允许触发 tag 流程的分支名。
   *
   * `undefined` 时不限制分支名。
   * @default undefined
   */
  allowBranchs?: string[];
}

/**
 * 企业微信消息通知相关配置
 * @see https://developer.work.weixin.qq.com/document/path/91770
 */
export interface Notify {
  /**
   * 配置获取消息机器人 webhook 的方法。
   *
   * 添加机器人方法: https://developer.work.weixin.qq.com/document/path/91770
   *
   * `undefined` 时不发送消息。
   * @default undefined
   */
  getUrl?: (ctx: Context) => string;
  /**
   * 配置获取消息内容的方法。支持 md 格式。
   *
   * `undefined` 时不发送消息。
   * @see https://developer.work.weixin.qq.com/document/path/91770
   * @default undefined
   */
  getMsg?: (ctx: Context) => string;
  /**
   * 允许触发消息通知流程的分支名。
   *
   * `undefined` 时不限制分支名。
   * @default undefined
   */
  allowBranchs?: string[];
}

/**
 * 流程上下文信息
 *
 * 将在执行 getXXX 类方法时作为参数传入。
 */
export interface Context {
  /**
   * 标签格式 {prefix}-{env}-{version}
   *
   * 获取上一个标签中的 `prefix` 部分内容。
   */
  prefix: string;
  /**
   * 标签格式 {prefix}-{env}-{version}
   *
   * 获取上一个标签中的 `env` 部分内容。
   */
  env: string;
  /**
   * 标签格式 {prefix}-{env}-{version}
   *
   * 获取上一个标签中的 `version` 部分内容。
   */
  version: string;
  /**
   * 标签格式 {prefix}-{env}-{version}
   *
   * 获取新生成的 tag 名。
   */
  tagName: string;
  /**
   * 标签格式 {prefix}-{env}-{version}
   *
   * 获取上一个 tag 名。
   */
  preTagName: string;
  /**
   * 获取当前 git 用户名
   */
  username: string;
  /**
   * 获取当前分支名
   */
  branchName: string;
}

/**
 * 执行命令可传参数
 */
export interface Options {
  /**
   * 跳过消息通知的步骤
   */
  silence: boolean;
}
