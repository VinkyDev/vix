import {
  CloudServerOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  StopOutlined,
  ToolOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
} from "antd";
import React, { useState } from "react";

import { useMCPStore } from "@/store";
import { MCPServerStatus } from "@/types";

import AddServerModal from "./AddServerModal";
import EditServerModal from "./EditServerModal";
import MCPToolsModal from "./MCPToolsModal";
import ServerLogsModal from "./ServerLogsModal";
import "./index.scss";

const { Title, Text } = Typography;

const MCPSettings: React.FC = () => {
  const {
    services,
    startService,
    stopService,
    restartService,
    removeService,
    importConfiguration,
    exportConfiguration,
  } = useMCPStore();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [toolsModalVisible, setToolsModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [loadingServices, setLoadingServices] = useState<Set<string>>(
    new Set()
  );

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

  const handleRestartService = async (name: string) => {
    setLoadingServices((prev) => new Set(prev).add(name));
    try {
      await restartService(name);
      message.success(`服务 ${name} 重启成功`);
    } catch (error) {
      message.error(`服务 ${name} 重启失败: ${error}`);
    } finally {
      setLoadingServices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  const handleDeleteService = (name: string) => {
    Modal.confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除服务 "${name}" 吗？此操作不可撤销。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        removeService(name);
        message.success(`服务 ${name} 已删除`);
      },
    });
  };

  const handleEditService = (name: string) => {
    setSelectedService(name);
    setEditModalVisible(true);
  };

  const handleViewLogs = (name: string) => {
    setSelectedService(name);
    setLogsModalVisible(true);
  };

  const handleViewTools = (name: string) => {
    setSelectedService(name);
    setToolsModalVisible(true);
  };

  const handleExportConfig = () => {
    const config = exportConfiguration();
    const configStr = JSON.stringify({ mcpServers: config }, null, 2);
    setImportContent(configStr);
    setExportModalVisible(true);
  };

  const handleImportConfig = () => {
    setImportModalVisible(true);
  };

  const confirmImport = () => {
    try {
      const config = JSON.parse(importContent);
      if (config.mcpServers) {
        importConfiguration(config.mcpServers);
        message.success("配置导入成功");
        setImportModalVisible(false);
        setImportContent("");
      } else {
        message.error("配置格式错误：缺少 mcpServers 字段");
      }
    } catch (error) {
      message.error(`配置格式错误: ${error}`);
    }
  };

  const getStatusColor = (status: MCPServerStatus): string => {
    switch (status) {
      case MCPServerStatus.Running:
        return "green";
      case MCPServerStatus.Starting:
        return "orange";
      case MCPServerStatus.Stopping:
        return "orange";
      case MCPServerStatus.Error:
        return "red";
      default:
        return "default";
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
      case MCPServerStatus.Stopped:
        return "已停止";
      case MCPServerStatus.Error:
        return "错误";
      default:
        return "未知";
    }
  };

  const serviceList = Object.values(services).filter(
    (service) => service && service.config && service.config.name
  );

  return (
    <div className="mcp-settings">
      <div className="mcp-settings-header">
        <Title level={4}>
          <CloudServerOutlined /> MCP 服务管理
        </Title>
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
            type="primary"
          >
            添加服务
          </Button>
          <Button icon={<UploadOutlined />} onClick={handleImportConfig}>
            导入配置
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportConfig}>
            导出配置
          </Button>
        </Space>
      </div>

      <div className="mcp-settings-content">
        {serviceList.length === 0 ? (
          <Empty
            description="暂无 MCP 服务"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              type="primary"
            >
              添加第一个服务
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {serviceList.map((service) => (
              <Col key={service.config.name} lg={12} xl={8} xxl={6}>
                <Card
                  actions={[
                    (() => {
                      const isLoading = loadingServices.has(
                        service.config.name
                      );
                      const isRunning =
                        service.status === MCPServerStatus.Running;
                      const isStopping =
                        service.status === MCPServerStatus.Stopping;
                      const isStarting =
                        service.status === MCPServerStatus.Starting;

                      if (isRunning) {
                        return (
                          <Button
                            danger
                            disabled={isLoading}
                            icon={!isLoading ? <StopOutlined /> : undefined}
                            loading={isLoading}
                            onClick={() =>
                              handleStopService(service.config.name)
                            }
                            type="text"
                          >
                            {isLoading ? "停止中..." : "停止"}
                          </Button>
                        );
                      }

                      if (isStopping) {
                        return (
                          <Button danger disabled loading type="text">
                            停止中...
                          </Button>
                        );
                      }

                      if (isStarting) {
                        return (
                          <Button disabled loading type="primary">
                            启动中...
                          </Button>
                        );
                      }

                      return (
                        <Button
                          disabled={isLoading}
                          icon={!isLoading ? <PlayCircleOutlined /> : undefined}
                          loading={isLoading}
                          onClick={() =>
                            handleStartService(service.config.name)
                          }
                          type="primary"
                        >
                          {isLoading ? "启动中..." : "启动"}
                        </Button>
                      );
                    })(),
                    <Button
                      disabled={
                        service.status !== MCPServerStatus.Running ||
                        loadingServices.has(service.config.name)
                      }
                      icon={
                        !loadingServices.has(service.config.name) ? (
                          <ReloadOutlined />
                        ) : undefined
                      }
                      loading={loadingServices.has(service.config.name)}
                      onClick={() => handleRestartService(service.config.name)}
                      type="text"
                    >
                      {loadingServices.has(service.config.name)
                        ? "重启中..."
                        : "重启"}
                    </Button>,
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "tools",
                            label: "工具管理",
                            icon: <ToolOutlined />,
                            onClick: () => handleViewTools(service.config.name),
                          },
                          {
                            key: "edit",
                            label: "编辑",
                            icon: <EditOutlined />,
                            onClick: () =>
                              handleEditService(service.config.name),
                          },
                          {
                            key: "logs",
                            label: "查看日志",
                            icon: <EyeOutlined />,
                            onClick: () => handleViewLogs(service.config.name),
                          },
                          {
                            key: "delete",
                            label: "删除",
                            danger: true,
                            icon: <DeleteOutlined />,
                            onClick: () =>
                              handleDeleteService(service.config.name),
                          },
                        ],
                      }}
                      placement="bottomRight"
                    >
                      <Button icon={<SettingOutlined />} type="text" />
                    </Dropdown>,
                  ]}
                  className="mcp-service-card"
                  size="small"
                  title={
                    <div className="service-card-title">
                      <Text strong>{service.config.name}</Text>
                      <Tag color={getStatusColor(service.status)}>
                        {getStatusText(service.status)}
                      </Tag>
                    </div>
                  }
                >
                  <div className="service-card-content">
                    <div className="service-info">
                      <Text type="secondary">命令: </Text>
                      <Text code>
                        {service.config.command} {service.config.args.join(" ")}
                      </Text>
                    </div>
                    {service.pid && (
                      <div className="service-info">
                        <Text type="secondary">PID: </Text>
                        <Text>{service.pid}</Text>
                      </div>
                    )}
                    {service.isConnected && (
                      <div className="service-info">
                        <Text type="secondary">工具数量: </Text>
                        <Text>{service.tools.length}</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 添加服务模态框 */}
      <AddServerModal
        onCancel={() => setAddModalVisible(false)}
        visible={addModalVisible}
      />

      {/* 编辑服务模态框 */}
      <EditServerModal
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedService("");
        }}
        serverName={selectedService}
        visible={editModalVisible}
      />

      {/* 服务日志模态框 */}
      <ServerLogsModal
        onCancel={() => {
          setLogsModalVisible(false);
          setSelectedService("");
        }}
        serverName={selectedService}
        visible={logsModalVisible}
      />

      {/* MCP 工具管理模态框 */}
      <MCPToolsModal
        onCancel={() => {
          setToolsModalVisible(false);
          setSelectedService("");
        }}
        serverName={selectedService}
        visible={toolsModalVisible}
      />

      {/* 导出配置模态框 */}
      <Modal
        footer={[
          <Button key="close" onClick={() => setExportModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            onClick={() => {
              navigator.clipboard.writeText(importContent);
              message.success("配置已复制到剪贴板");
            }}
            type="primary"
          >
            复制配置
          </Button>,
        ]}
        onCancel={() => setExportModalVisible(false)}
        open={exportModalVisible}
        title="导出 MCP 配置"
        width={600}
      >
        <Upload.Dragger beforeUpload={() => false} showUploadList={false}>
          <pre className="config-preview">{importContent}</pre>
        </Upload.Dragger>
      </Modal>

      {/* 导入配置模态框 */}
      <Modal
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            取消
          </Button>,
          <Button key="import" onClick={confirmImport} type="primary">
            导入
          </Button>,
        ]}
        onCancel={() => setImportModalVisible(false)}
        open={importModalVisible}
        title="导入 MCP 配置"
        width={600}
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
            <FileTextOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持 JSON 配置文件</p>
        </Upload.Dragger>
        {importContent && (
          <div style={{ marginTop: 16 }}>
            <Text strong>配置预览:</Text>
            <pre
              style={{
                background: "#f5f5f5",
                padding: 8,
                borderRadius: 4,
                marginTop: 8,
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              {importContent}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MCPSettings;
