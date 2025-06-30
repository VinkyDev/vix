import { ReloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Button, Card, message, Space, Tooltip } from "antd";
import { motion } from "motion/react";
import React from "react";

import ShortcutInput from "@/components/ShortcutInput";
import { ShortcutKey, useUserSettingsStore } from "@/store";

import "./index.scss";

const BasicSettings: React.FC = () => {
  const { shortcuts, setShortcut, resetShortcuts } = useUserSettingsStore();

  const handleShortcutChange = (key: ShortcutKey, value: string) => {
    setShortcut(key, value);
    message.success(`快捷键设置成功：${value}`);
  };

  const handleResetShortcuts = () => {
    resetShortcuts();
    message.success("快捷键已重置为默认值");
  };

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
    </motion.div>
  );
};

export default BasicSettings;
