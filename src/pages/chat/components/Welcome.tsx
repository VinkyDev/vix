import { Flex, Image, Typography } from "antd";

import logo from "@/assets/logo.png";

const { Title } = Typography;

export const Welcome = () => {
  return (
    <Flex align="center" justify="center" style={{ marginTop: 40 }} vertical>
      <Image alt="logo" height={100} preview={false} src={logo} width={100} />
      <Title level={4}>你好, 我是 Vix</Title>
    </Flex>
  );
};

export default Welcome;
