import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  StopOutlined,
  ToolOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  message,
  Modal,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";

import { useMCPStore } from "@/store";
import { MCPServerStatus } from "@/types";

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
    removeService,
    importConfiguration,
    exportConfiguration,
    initializeStateCallbacks,
  } = useMCPStore();

  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  const [configDrawerMode, setConfigDrawerMode] = useState<"add" | "edit">("add");
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [toolsDrawerVisible, setToolsDrawerVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [loadingServices, setLoadingServices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    initializeStateCallbacks();
  }, [initializeStateCallbacks]);

  const handleStartService = async (name: string) => {
    setLoadingServices((prev) => new Set(prev).add(name));
    try {
      await startService(name);
      message.success(`服务 ${name} 启动成功`);
    } catch (error) {
      message.error(`服务 ${name} 启动失败: ${error}`);
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

  const handleExportConfig = () => {
    const config = exportConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcp-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("配置已导出");
  };

  const handleImportConfig = () => {
    try {
      const config = JSON.parse(importContent);
      importConfiguration(config);
      setImportModalVisible(false);
      setImportContent("");
      message.success("配置导入成功");
    } catch (error) {
      message.error(`配置格式错误，请检查 JSON 格式: ${error}`);
    }
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
    const toolCount = service.tools.length;

    // 下拉菜单项
    const menuItems = [
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: () => handleEditService(serviceName),
      },
      {
        key: 'logs',
        label: '日志',
        icon: <FileTextOutlined />,
        onClick: () => handleViewLogs(serviceName),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteService(serviceName),
      },
    ];

    return (
      <Col key={serviceName} lg={8} sm={12} xl={6} xs={24}>
        <Card
          className="service-card"
          hoverable
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.3s ease",
          }}
        >
          {/* 卡片头部 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px"
          }}>
            <Title level={5} style={{ margin: 0, flex: 1 }}>
              {service.config.name}
            </Title>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
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
            </div>
          </div>

          {/* 操作按钮区域 - 单行布局 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px"
          }}>
            {/* 启动/停止按钮 */}
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
                启动
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
              trigger={['click']}
            >
              <Button
                icon={<MoreOutlined />}
                size="small"
                type="text"
              >
                更多
              </Button>
            </Dropdown>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* 页面标题和操作按钮 */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          MCP 服务管理
        </Title>
        <Space>
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
          <Button icon={<DownloadOutlined />} onClick={handleExportConfig}>
            导出配置
          </Button>
          <Upload
            accept=".json"
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                setImportContent(e.target?.result as string);
                setImportModalVisible(true);
              };
              reader.readAsText(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>导入配置</Button>
          </Upload>
        </Space>
      </div>

      {/* 服务卡片列表 */}
      {Object.keys(services).length === 0 ? (
        <Empty description="暂无 MCP 服务" style={{ margin: "60px 0" }} />
      ) : (
        <Row gutter={[16, 16]}>
          {Object.keys(services).map(renderServiceCard)}
        </Row>
      )}

      {/* 模态框和抽屉 */}
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

      {/* 导入配置模态框 */}
      <Modal
        cancelText="取消"
        okText="导入"
        onCancel={() => {
          setImportModalVisible(false);
          setImportContent("");
        }}
        onOk={handleImportConfig}
        open={importModalVisible}
        title="导入配置"
      >
        <Upload.Dragger
          accept=".json"
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImportContent(e.target?.result as string);
            };
            reader.readAsText(file);
            return false;
          }}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持 JSON 格式的配置文件</p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
}
