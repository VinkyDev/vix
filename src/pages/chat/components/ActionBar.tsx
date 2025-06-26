import {
  BulbOutlined,
  EditOutlined,
  GlobalOutlined,
  RobotOutlined,
  ToolOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Flex, Select } from "antd";

import "./index.scss";

import clsx from "clsx";
import { useMemo } from "react";

import { useModelStore, useUserSettingsStore } from "@/store";

export interface ActionBarItem {
  className?: string;
  icon?: React.ReactNode;
  key: string;
  label?: string;
  onClick?: () => void;
  show?: boolean;
  render?: () => React.ReactNode;
}

const ActionBar = () => {
  const { getCurrentModel, getEnabledModels, setCurrentModelId } =
    useModelStore();
  const { setUseThinking, useThinking, setUseSearch, useSearch } =
    useUserSettingsStore();

  const currentModel = getCurrentModel();
  const enabledModels = getEnabledModels();

  const actionItems = useMemo<ActionBarItem[]>(() => {
    return [
      {
        key: "model-selector",
        render: () => {
          if (enabledModels.length === 0) {
            return (
              <Button disabled icon={<RobotOutlined />}>
                无可用模型
              </Button>
            );
          }

          return (
            <Select
              onChange={setCurrentModelId}
              placeholder="选择模型"
              popupRender={(menu) => (
                <div>
                  {menu}
                  <div
                    style={{
                      padding: "8px 12px",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#666" }}>
                      共 {enabledModels.length} 个模型可用
                    </span>
                  </div>
                </div>
              )}
              style={{ minWidth: 150 }}
              value={currentModel?.modelId}
            >
              {enabledModels.map((model) => (
                <Select.Option key={model.modelId} value={model.modelId}>
                  <Flex align="center" gap={8} justify="space-between">
                    <span style={{ fontFamily: "monospace", fontSize: 13 }}>
                      {model.name}
                    </span>
                  </Flex>
                </Select.Option>
              ))}
            </Select>
          );
        },
        show: true,
      },
      {
        className: useThinking ? "active" : undefined,
        icon: <BulbOutlined />,
        key: "thinking",
        label: "推理",
        onClick: () => setUseThinking(!useThinking),
        show: currentModel?.thinking || false,
      },
      {
        className: useSearch ? "active" : undefined,
        icon: <GlobalOutlined />,
        key: "search",
        label: "联网",
        onClick: () => setUseSearch(!useSearch),
        show: currentModel?.search || false,
      },
      {
        key: "skills",
        render: () => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "translate",
                    label: "翻译",
                    icon: <TranslationOutlined />,
                    onClick: async () => {},
                  },
                  {
                    key: "write",
                    label: "写作",
                    icon: <EditOutlined />,
                  },
                ],
              }}
            >
              <Button className="skill" icon={<ToolOutlined />}>
                技能
              </Button>
            </Dropdown>
          );
        },
        show: false,
      },
    ];
  }, [
    useThinking,
    useSearch,
    setUseThinking,
    setUseSearch,
    currentModel,
    enabledModels,
    setCurrentModelId,
  ]);

  return (
    <Flex gap="small">
      {actionItems.map(
        (action) =>
          action.show &&
          (action.render ? (
            <div key={action.key}>{action.render()}</div>
          ) : (
            <Button
              className={clsx(action.className, "action-button")}
              icon={action.icon}
              key={action.key}
              onClick={action.onClick}
            >
              {action?.label}
            </Button>
          ))
      )}
    </Flex>
  );
};

export default ActionBar;
