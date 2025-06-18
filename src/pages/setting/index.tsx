import {
  CloseOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Space, Tabs } from "antd";
import { motion } from "motion/react";
import React from "react";
import { useNavigate } from "react-router-dom";

import BasicSettings from "./components/BasicSettings";
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
    <motion.div
      animate={{
        clipPath: "circle(150% at 0% 100%)",
      }}
      className="setting-overlay"
      exit={{
        clipPath: "circle(0% at 0% 100%)",
      }}
      initial={{
        clipPath: "circle(0% at 0% 100%)",
      }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
    >
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
    </motion.div>
  );
};

export default Setting;
