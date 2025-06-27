import {
  CloseOutlined,
  CloudServerOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Space, Tabs } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

import BasicSettings from "./components/BasicSettings";
import MCPSettings from "./components/MCPSettings";
import ModelSelector from "./components/ModelSelector";
import "./index.scss";

const Setting: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  const tabItems = [
    {
      key: "models",
      label: (
        <Space>
          <RobotOutlined />
          <span>模型配置</span>
        </Space>
      ),
      children: <ModelSelector />,
    },
    {
      key: "mcp",
      label: (
        <Space>
          <CloudServerOutlined />
          <span>MCP 服务</span>
        </Space>
      ),
      children: <MCPSettings />,
    },
    {
      key: "basic",
      label: (
        <Space>
          <SettingOutlined />
          <span>基础配置</span>
        </Space>
      ),
      children: <BasicSettings />,
    },
  ];

  return (
    <div className="setting-container">
      <Button
        className="close-button"
        icon={<CloseOutlined />}
        onClick={handleClose}
        shape="circle"
        type="text"
      />
      <Tabs
        centered
        className="setting-tabs"
        defaultActiveKey="models"
        items={tabItems}
        size="small"
      />
    </div>
  );
};

export default Setting;
