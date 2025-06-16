export const getErrorMessage = (error: Error) => {
  const match = error.message.match(/status\s(\d{3})/);
  const status = match ? parseInt(match[1], 10) : null;

  switch (status) {
    case 401:
      return "API Key 无效，请检查！";
    case 403:
      return "访问受限，请检查 ACL、角色！";
    case 404:
      return "模型/路径不存在，请确认 endpoint、版本！";
    case 422:
      return "输入语义错误，请调整内容，确保格式正确！";
    case 429:
      return "调用频率超限，请延迟或退避重试！";
    case 409:
      return "资源冲突，请等待或修改请求逻辑！";
    case 500:
      return "服务端问题，请重试或联系支持！";
    case 502:
      return "网络问题，请重试连接或超时配置！";
    default:
      return "请求失败，请重试！";
  }
};
