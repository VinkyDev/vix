import {
  ApiOutlined,
  BulbOutlined,
  EditOutlined,
  GlobalOutlined,
  RobotOutlined,
  ToolOutlined,
  TranslationOutlined,
} from "@ant-design/icons";

import "./index.scss";

import { Button, Dropdown, Flex, Select } from "antd";
import clsx from "clsx";
import { useMemo } from "react";

import { useMCPStore, useModelStore, useUserSettingsStore } from "@/store";
import { MCPServerStatus } from "@/types";

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
  const { 
    setUseThinking, 
    useThinking, 
    setUseSearch, 
    useSearch,
    selectedMCPServices,
    setSelectedMCPServices 
  } = useUserSettingsStore();
  const { services } = useMCPStore();

  const currentModel = getCurrentModel();
  const enabledModels = getEnabledModels();

  // 获取可用的MCP服务（已连接的服务）
  const availableMCPServices = useMemo(() => {
    return Object.entries(services)
      .filter(([_, service]) => service.status === MCPServerStatus.Running && service.isConnected)
      .map(([name, service]) => ({
        value: name,
        label: name,
        toolCount: service.tools.length,
      }));
  }, [services]);

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
        key: "mcp-services",
        render: () => {
          if (availableMCPServices.length === 0) {
            return (
              <Button disabled icon={<ApiOutlined />}>
                无可用工具
              </Button>
            );
          }

          return (
            <Select
              mode="multiple"
              onChange={setSelectedMCPServices}
              placeholder="选择工具服务"
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
                      共 {availableMCPServices.length} 个服务可用
                    </span>
                  </div>
                </div>
              )}
              style={{ minWidth: 150 }}
              value={selectedMCPServices}
            >
              {availableMCPServices.map((service) => (
                <Select.Option key={service.value} value={service.value}>
                  <Flex align="center" gap={8} justify="space-between">
                    <span>{service.label}</span>
                    <span style={{ fontSize: 12, color: "#999" }}>
                      {service.toolCount} 工具
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
    selectedMCPServices,
    setUseThinking,
    setUseSearch,
    setSelectedMCPServices,
    currentModel,
    enabledModels,
    availableMCPServices,
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
