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

import { Badge, Button, Checkbox, Dropdown, Flex, Popover, Select } from "antd";
import clsx from "clsx";
import { useEffect, useMemo } from "react";

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
    setSelectedMCPServices,
  } = useUserSettingsStore();
  const { services } = useMCPStore();

  const currentModel = getCurrentModel();
  const enabledModels = getEnabledModels();

  // 获取可用的MCP服务（已连接的服务）
  const availableMCPServices = useMemo(() => {
    return Object.entries(services)
      .filter(
        ([_, service]) =>
          service.status === MCPServerStatus.Running && service.isConnected
      )
      .map(([name, service]) => ({
        value: name,
        label: name,
        toolCount: service.tools.length,
      }));
  }, [services]);

  // 自动清理不再可用的已选中服务
  useEffect(() => {
    const availableServiceNames = new Set(
      availableMCPServices.map((s) => s.value)
    );
    const validSelectedServices = selectedMCPServices.filter((serviceName) =>
      availableServiceNames.has(serviceName)
    );

    if (validSelectedServices.length !== selectedMCPServices.length) {
      setSelectedMCPServices(validSelectedServices);
    }
  }, [availableMCPServices, selectedMCPServices, setSelectedMCPServices]);

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

          const popoverContent = (
            <div style={{ width: 280, maxHeight: 320, overflowY: "auto" }}>
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  marginBottom: "8px",
                }}
              >
                <Button
                  onClick={() => {
                    if (
                      selectedMCPServices.length === availableMCPServices.length
                    ) {
                      setSelectedMCPServices([]);
                    } else {
                      setSelectedMCPServices(
                        availableMCPServices.map((s) => s.value)
                      );
                    }
                  }}
                  size="small"
                  style={{
                    padding: 0,
                    height: "auto",
                    color: "#1677ff",
                    fontSize: "12px",
                  }}
                  type="link"
                >
                  {selectedMCPServices.length === availableMCPServices.length
                    ? "清空选择"
                    : "全选"}
                </Button>
              </div>

              <div style={{ padding: "0 4px" }}>
                {availableMCPServices.map((service) => {
                  const isSelected = selectedMCPServices.includes(
                    service.value
                  );
                  return (
                    <div
                      key={service.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          setSelectedMCPServices(
                            selectedMCPServices.filter(
                              (s) => s !== service.value
                            )
                          );
                        } else {
                          setSelectedMCPServices([
                            ...selectedMCPServices,
                            service.value,
                          ]);
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        marginBottom: "4px",
                      }}
                    >
                      <Flex align="center" gap={8} justify="space-between">
                        <Flex align="center" gap={8}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {}} // 由外层点击事件处理
                          />
                          <ApiOutlined
                            style={{ fontSize: 12, color: "#1677ff" }}
                          />
                          <span style={{ fontSize: "14px" }}>
                            {service.label}
                          </span>
                        </Flex>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#999",
                            background: "#f5f5f5",
                            padding: "2px 6px",
                            borderRadius: "8px",
                          }}
                        >
                          {service.toolCount}
                        </span>
                      </Flex>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderTop: "1px solid #f0f0f0",
                  marginTop: "8px",
                  background: "#fafafa",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                共 {availableMCPServices.length} 个服务可用
                {selectedMCPServices.length > 0 && (
                  <span style={{ marginLeft: 8, color: "#1677ff" }}>
                    • 已选 {selectedMCPServices.length} 个
                  </span>
                )}
              </div>
            </div>
          );

          return (
            <Popover
              content={popoverContent}
              placement="bottomLeft"
              trigger="click"
            >
              <Badge
                count={selectedMCPServices.length}
                size="small"
                style={{
                  backgroundColor: "#1677ff",
                }}
              >
                <Button
                  icon={<ApiOutlined />}
                  shape="circle"
                  style={{
                    background:
                      selectedMCPServices.length > 0 ? "#e4edff" : undefined,
                    borderColor:
                      selectedMCPServices.length > 0 ? "#76a3ff" : undefined,
                    color:
                      selectedMCPServices.length > 0 ? "#0058ff" : undefined,
                  }}
                />
              </Badge>
            </Popover>
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
