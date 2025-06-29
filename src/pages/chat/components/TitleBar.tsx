import { MenuFoldOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";

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
    <Flex
      align="center"
      justify="space-between"
      style={{
        marginBottom: 5,
      }}
    >
      <Button
        icon={<MenuFoldOutlined />}
        onClick={() => setDrawerOpen(true)}
        shape="circle"
        type="text"
      />
      <Title
        level={5}
        style={{
          marginBottom: 0,
          width: "60%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
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
