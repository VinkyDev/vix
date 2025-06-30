import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ShopOutlined,
  StopOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Flex,
  message,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

import { useMCPStore } from "@/store";
import { MCPServerStatus } from "@/types";

import MCPMarketDrawer from "./MCPMarketDrawer";
import MCPToolsDrawer from "./MCPToolsDrawer";
import ServerConfigDrawer from "./ServerConfigDrawer";
import ServerLogsDrawer from "./ServerLogsDrawer";
import "./index.scss";

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function MCPSettings() {
  const {
    services,
    startService,
    stopService,
    restartService,
    removeService,
    initializeStateCallbacks,
  } = useMCPStore();

  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  const [configDrawerMode, setConfigDrawerMode] = useState<"add" | "edit">(
    "add"
  );
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [toolsDrawerVisible, setToolsDrawerVisible] = useState(false);
  const [marketDrawerVisible, setMarketDrawerVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [loadingServices, setLoadingServices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    initializeStateCallbacks();
  }, [initializeStateCallbacks]);

  const handleStartService = async (name: string) => {
    setLoadingServices((prev) => new Set(prev).add(name));
    try {
      const service = services[name];
      const isErrorStatus = service?.status === MCPServerStatus.Error;

      if (isErrorStatus) {
        await restartService(name);
        message.success(`服务 ${name} 重启成功`);
      } else {
        await startService(name);
        message.success(`服务 ${name} 启动成功`);
      }
    } catch (error) {
      const service = services[name];
      const isErrorStatus = service?.status === MCPServerStatus.Error;
      const actionText = isErrorStatus ? "重启" : "启动";
      message.error(`服务 ${name} ${actionText}失败: ${error}`);
    } finally {
      setLoadingServices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  const handleStopService = async (name: string) => {
    setLoadingServices((prev) => new Set(prev).add(name));
    try {
      await stopService(name);
      message.success(`服务 ${name} 停止成功`);
    } catch (error) {
      message.error(`服务 ${name} 停止失败: ${error}`);
    } finally {
      setLoadingServices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  const handleEditService = (name: string) => {
    setSelectedService(name);
    setConfigDrawerMode("edit");
    setConfigDrawerVisible(true);
  };

  const handleDeleteService = (name: string) => {
    confirm({
      title: "确认删除",
      content: `确定要删除服务 "${name}" 吗？`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        removeService(name);
        message.success(`服务 ${name} 已删除`);
      },
    });
  };

  const handleViewTools = (name: string) => {
    setSelectedService(name);
    setToolsDrawerVisible(true);
  };

  const handleViewLogs = (name: string) => {
    setSelectedService(name);
    setLogsModalVisible(true);
  };

  const getStatusColor = (status: MCPServerStatus): string => {
    switch (status) {
      case MCPServerStatus.Running:
        return "#52c41a";
      case MCPServerStatus.Starting:
        return "#1890ff";
      case MCPServerStatus.Stopping:
        return "#faad14";
      case MCPServerStatus.Error:
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusText = (status: MCPServerStatus): string => {
    switch (status) {
      case MCPServerStatus.Running:
        return "运行中";
      case MCPServerStatus.Starting:
        return "启动中";
      case MCPServerStatus.Stopping:
        return "停止中";
      case MCPServerStatus.Error:
        return "错误";
      default:
        return "已停止";
    }
  };

  const renderServiceCard = (serviceName: string) => {
    const service = services[serviceName];
    if (!service) return null;

    const isLoading = loadingServices.has(serviceName);
    const isRunning = service.status === MCPServerStatus.Running;
    const isError = service.status === MCPServerStatus.Error;
    const toolCount = service.tools.length;

    // 下拉菜单项
    const menuItems = [
      {
        key: "edit",
        label: "编辑",
        icon: <EditOutlined />,
        onClick: () => handleEditService(serviceName),
      },
      {
        key: "logs",
        label: "日志",
        icon: <FileTextOutlined />,
        onClick: () => handleViewLogs(serviceName),
      },
      {
        type: "divider" as const,
      },
      {
        key: "delete",
        label: "删除",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteService(serviceName),
      },
    ];

    return (
      <Col
        key={serviceName}
        lg={8}
        sm={12}
        style={{ height: "fit-content" }}
        xl={6}
        xs={24}
      >
        <Card
          className="service-card"
          hoverable
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease",
          }}
        >
          <Flex gap={20} vertical>
            <Flex justify="space-between">
              <Flex align="center" gap={8}>
                <span style={{ fontSize: 22 }}>
                  {service.config.icon || "🔧"}
                </span>
                <Flex vertical>
                  <Title ellipsis level={5} style={{ margin: 0, width: 150 }}>
                    {service.config.displayName || service.config.name}
                  </Title>
                  {service.config.displayName && (
                    <Text
                      ellipsis
                      style={{ fontSize: "12px" }}
                      type="secondary"
                    >
                      {service.config.name}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Flex align="center" gap={6}>
                <Text style={{ fontSize: "12px" }} type="secondary">
                  {getStatusText(service.status)}
                </Text>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: getStatusColor(service.status),
                  }}
                />
              </Flex>
            </Flex>
            <Flex align="center" gap={8} justify="space-between">
              {isRunning ? (
                <Button
                  danger
                  icon={<StopOutlined />}
                  loading={isLoading}
                  onClick={() => handleStopService(serviceName)}
                  size="small"
                  type="text"
                >
                  停止
                </Button>
              ) : (
                <Button
                  icon={<PlayCircleOutlined />}
                  loading={isLoading}
                  onClick={() => handleStartService(serviceName)}
                  size="small"
                  style={{ color: "#1890ff" }}
                  type="text"
                >
                  {isError ? "重启" : "启动"}
                </Button>
              )}

              {/* 工具管理按钮 */}
              <Badge color="#1890ff" count={toolCount} size="small">
                <Button
                  disabled={!isRunning}
                  icon={<ToolOutlined />}
                  onClick={() => handleViewTools(serviceName)}
                  size="small"
                  type="text"
                >
                  工具
                </Button>
              </Badge>

              {/* 更多操作下拉菜单 */}
              <Dropdown
                menu={{
                  items: menuItems,
                }}
                placement="bottomRight"
                trigger={["hover"]}
              >
                <Button icon={<MoreOutlined />} size="small" type="text">
                  更多
                </Button>
              </Dropdown>
            </Flex>
          </Flex>
        </Card>
      </Col>
    );
  };

  return (
    <Flex style={{ height: "100%" }} vertical>
      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Button
          icon={<ShopOutlined />}
          onClick={() => setMarketDrawerVisible(true)}
        >
          MCP 市场
        </Button>
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            setConfigDrawerMode("add");
            setConfigDrawerVisible(true);
          }}
          type="primary"
        >
          添加服务
        </Button>
      </Flex>

      {Object.keys(services).length === 0 ? (
        <Empty description="暂无 MCP 服务" style={{ margin: "60px 0" }} />
      ) : (
        <Row
          gutter={[16, 16]}
          style={{
            overflow: "auto",
          }}
        >
          {Object.keys(services).map(renderServiceCard)}
        </Row>
      )}

      <ServerConfigDrawer
        mode={configDrawerMode}
        onClose={() => {
          setConfigDrawerVisible(false);
          setConfigDrawerMode("add");
          setSelectedService("");
        }}
        serverName={configDrawerMode === "edit" ? selectedService : undefined}
        visible={configDrawerVisible}
      />

      <ServerLogsDrawer
        onClose={() => {
          setLogsModalVisible(false);
          setSelectedService("");
        }}
        serverName={selectedService}
        visible={logsModalVisible}
      />

      <MCPToolsDrawer
        onClose={() => {
          setToolsDrawerVisible(false);
          setSelectedService("");
        }}
        serviceName={selectedService}
        visible={toolsDrawerVisible}
      />

      <MCPMarketDrawer
        onClose={() => setMarketDrawerVisible(false)}
        visible={marketDrawerVisible}
      />
    </Flex>
  );
}
