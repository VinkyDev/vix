import {
  ClearOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Card, Flex, InputNumber, message, Space, Tooltip } from "antd";
import { motion } from "motion/react";
import React from "react";

import ShortcutInput from "@/components/ShortcutInput";
import { ShortcutKey, useMessageStore, useUserSettingsStore } from "@/store";

import "./index.scss";

const BasicSettings: React.FC = () => {
  const {
    contextWindowSize,
    setContextWindowSize,
    shortcuts,
    setShortcut,
    resetShortcuts,
  } = useUserSettingsStore();
  const {
    addContextDivider,
    messages,
    maxMessages,
    setMaxMessages,
    setMessages,
  } = useMessageStore();

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

  const handleClearHistory = () => {
    setMessages([]);
    message.success("已清除历史记录");
  };

  const handleShortcutChange = (key: ShortcutKey, value: string) => {
    setShortcut(key, value);
    message.success(`快捷键设置成功：${value}`);
  };

  const handleResetShortcuts = () => {
    resetShortcuts();
    message.success("快捷键已重置为默认值");
  };

  const getContextStats = () => {
    const totalMessages = messages.length;
    const lastDividerIndex = messages.reduce((acc, msg, index) => {
      if (msg.message.content.includes("<divider>")) {
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
      {/* 快捷键配置 */}
      <Card
        className="settings-card"
        size="small"
        title={
          <Space>
            <ThunderboltOutlined />
            快捷键配置
          </Space>
        }
      >
        <Space align="center">
          <span>唤起快捷键</span>
          <ShortcutInput
            onChange={(value) =>
              handleShortcutChange(ShortcutKey.ToggleWindow, value)
            }
            placeholder="点击设置快捷键"
            size="small"
            style={{ width: 180 }}
            value={shortcuts[ShortcutKey.ToggleWindow]}
          />
          <Tooltip title="重置快捷键">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetShortcuts}
              size="small"
              type="text"
            />
          </Tooltip>
        </Space>
      </Card>

      {/* 消息配置 */}
      <Card
        className="settings-card"
        size="small"
        title={
          <Space>
            <MessageOutlined />
            消息配置
          </Space>
        }
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Flex align="center" justify="space-between">
            <Space>
              <span>上下文窗口</span>
              <Tooltip title="设置AI在回复时能够参考的历史消息数量">
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </Space>
            <Space align="center">
              <InputNumber
                addonAfter="条"
                max={100}
                min={1}
                onChange={handleContextWindowSizeChange}
                size="small"
                style={{ width: 100 }}
                value={contextWindowSize}
              />
              <Tooltip title="清除上下文">
                <Button
                  danger
                  disabled={currentContextSize === 0}
                  ghost
                  icon={<ClearOutlined />}
                  onClick={handleClearContext}
                  size="small"
                  type="text"
                />
              </Tooltip>
            </Space>
          </Flex>

          <Flex align="center" justify="space-between">
            <Space>
              <span>保存条数</span>
              <Tooltip title="设置历史记录保存条数">
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </Space>
            <Space align="center">
              <InputNumber
                addonAfter="条"
                max={100}
                min={1}
                onChange={handleMaxMessagesChange}
                size="small"
                style={{ width: 100 }}
                value={maxMessages}
              />
              <Tooltip title="清除历史记录">
                <Button
                  danger
                  disabled={messages.length === 0}
                  ghost
                  icon={<DeleteOutlined />}
                  onClick={handleClearHistory}
                  size="small"
                  type="text"
                />
              </Tooltip>
            </Space>
          </Flex>
        </Space>
      </Card>
    </motion.div>
  );
};

export default BasicSettings;
