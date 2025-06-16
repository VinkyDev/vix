import {
  ClearOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  InputNumber,
  message,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { motion } from "motion/react";
import React from "react";

import { useMessageStore, useUserSettingsStore } from "@/store";

import "./index.scss";

const { Text, Title } = Typography;

const BasicSettings: React.FC = () => {
  const { contextWindowSize, setContextWindowSize } = useUserSettingsStore();
  const { addContextDivider, messages } = useMessageStore();

  const handleContextWindowSizeChange = (value: number | null) => {
    if (value && value >= 1 && value <= 100) {
      setContextWindowSize(value);
      message.success(`设置成功`);
    }
  };

  const handleClearContext = () => {
    addContextDivider();
    message.success("已清除当前上下文");
  };

  const getContextStats = () => {
    const totalMessages = messages.length;
    const lastDividerIndex = messages.reduce((acc, msg, index) => {
      if (msg.message.type === "divider") {
        return index;
      }
      return acc;
    }, -1);
    const currentContextSize =
      lastDividerIndex === -1
        ? totalMessages
        : totalMessages - lastDividerIndex - 1;

    return { totalMessages, currentContextSize };
  };

  const { totalMessages, currentContextSize } = getContextStats();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="basic-settings"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="basic-settings-card">
        <div className="basic-settings-header">
          <Title className="settings-title" level={5}>
            <SettingOutlined />
            基础配置
          </Title>
          <Text className="settings-desc" type="secondary">
            管理对话上下文和历史记录设置
          </Text>
        </div>

        <div className="settings-content">
          {/* 上下文窗口长度设置 */}
          <div className="setting-item">
            <div className="setting-label">
              <Text strong>上下文窗口长度</Text>
              <Tooltip
                placement="top"
                title="设置AI在回复时能够参考的历史消息数量。较大的值能提供更好的上下文理解，但会消耗更多token。"
              >
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <InputNumber
                addonAfter="条消息"
                className="context-size-input"
                max={100}
                min={1}
                onChange={handleContextWindowSizeChange}
                size="small"
                value={contextWindowSize}
              />
            </div>
          </div>

          {/* 当前上下文状态 */}
          <div className="setting-item">
            <div className="setting-label">
              <Text strong>当前上下文状态</Text>
              <Tooltip
                placement="top"
                title="显示当前有效的上下文消息数量和历史记录总数"
              >
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <Space direction="vertical" size={2}>
                <Text className="context-stats" type="secondary">
                  <HistoryOutlined /> 当前上下文: {currentContextSize} 条消息
                </Text>
                <Text className="context-stats" type="secondary">
                  历史记录总数: {totalMessages} 条消息
                </Text>
              </Space>
            </div>
          </div>

          {/* 清除上下文按钮 */}
          <div className="setting-item">
            <div className="setting-label">
              <Text strong>上下文管理</Text>
              <Tooltip
                placement="top"
                title="添加分割线清除当前上下文，但保留历史记录。新的对话将从分割线后重新开始计算上下文。"
              >
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <Button
                className="clear-context-btn"
                disabled={currentContextSize === 0}
                icon={<ClearOutlined />}
                onClick={handleClearContext}
                size="small"
              >
                清除当前上下文
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BasicSettings;
