import { MenuFoldOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import "./index.scss";

const { Title } = Typography;

export const TitleBar = ({
  name,
  setDrawerOpen,
}: {
  name: string;
  setDrawerOpen: (open: boolean) => void;
}) => {
  const navigate = useNavigate();

  return (
    <Flex align="center" className="title-bar" justify="space-between">
      <Button
        icon={<MenuFoldOutlined />}
        onClick={() => setDrawerOpen(true)}
        shape="circle"
        type="text"
      />
      <Title className="title" level={5}>
        {name}
      </Title>
      <Button
        icon={<SettingOutlined />}
        onClick={() => navigate("/setting")}
        shape="circle"
        type="text"
      />
    </Flex>
  );
};
