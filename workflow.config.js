// {prefix}-{env}-{version}
export default {
  tag: {
    getEnv: ({ branchName }) => {
      if (branchName === "master") {
        return "prod";
      }
      return "dev";
    },
    getVersion: ({ version }) => {
      return version;
    },
    getPrefix: ({ prefix }) => {
      return prefix;
    },
    getMsg: ({ tagName }) => {
      return `🔖 ${tagName}`;
    },
    getVersionFile: ({ branchName }) => {
      if (branchName !== "master") {
        return "VERSION.DEV";
      }
      return "VERSION";
    },
    getFirstTag: ({ branchName }) => {
      if (branchName === "master") {
        return "1.0.0-prod-1";
      }
      return "1.0.0-dev-1";
    },
    allowBranchs: ["master", "dev"],
  },
  notify: {
    getUrl: () =>
      "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=e8cc0952-11ac-4c18-96c3-4b6821836fc8",
    getMsg: ({ username, tagName }) => {
      return `前端项目正式环境更新，测试环境即将被覆盖，请通知相关测试人员并重新发布测试环境。\n
      >项目:<font color="comment">综合管理平台</font>
      >执行人:<font color="comment">${username || "未知"}</font>
      >TAG:<font color="comment">${tagName}</font>`;
    },
    allowBranchs: ["master"],
  },
};
