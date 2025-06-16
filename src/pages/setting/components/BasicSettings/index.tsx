import {
  ClearOutlined,
  InfoCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Card, InputNumber, message, Tooltip, Typography } from "antd";
import { motion } from "motion/react";
import React from "react";

import { useMessageStore, useUserSettingsStore } from "@/store";

import "./index.scss";

const { Text, Title } = Typography;

const BasicSettings: React.FC = () => {
  const { contextWindowSize, setContextWindowSize } = useUserSettingsStore();
  const { addContextDivider, messages, maxMessages, setMaxMessages } =
    useMessageStore();

  const handleContextWindowSizeChange = (value: number | null) => {
    if (value && value >= 1 && value <= 100) {
      setContextWindowSize(value);
      message.success(`设置成功`);
    }
  };

  const handleMaxMessagesChange = (value: number | null) => {
    if (value && value >= 1 && value <= 100) {
      setMaxMessages(value);
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

    return { currentContextSize };
  };

  const { currentContextSize } = getContextStats();

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
            <MessageOutlined />
            消息配置
          </Title>
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
                addonAfter="条"
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
              <Text strong>历史记录保存条数</Text>
              <Tooltip
                placement="top"
                title="设置历史记录保存条数，超过该条数后，历史记录将被清除。"
              >
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <InputNumber
                addonAfter="条"
                className="context-size-input"
                max={100}
                min={1}
                onChange={handleMaxMessagesChange}
                size="small"
                value={maxMessages}
              />
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
