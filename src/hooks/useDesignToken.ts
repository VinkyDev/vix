import { theme } from 'antd';

export const useDesignToken = () => {
  const { token } = theme.useToken();
  return token;
}; 