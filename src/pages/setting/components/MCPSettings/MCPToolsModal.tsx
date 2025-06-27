import {
  ApiOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";

import { useMCPStore } from "@/store";
import { MCPTool, MCPToolResult } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface MCPToolsModalProps {
  visible: boolean;
  serverName: string;
  onCancel: () => void;
}

const MCPToolsModal: React.FC<MCPToolsModalProps> = ({
  visible,
  serverName,
  onCancel,
}) => {
  const { services, callServiceTool, refreshServiceData } = useMCPStore();

  const [toolResults, setToolResults] = useState<Record<string, MCPToolResult>>(
    {}
  );
  const [form] = Form.useForm();

  const service = services[serverName];
  const isConnected = service?.isConnected || false;
  const tools = service?.tools || [];

  const handleRefreshTools = async () => {
    if (service?.isConnected) {
      try {
        await refreshServiceData(serverName);
        message.success("工具列表已刷新");
      } catch (error) {
        message.error(`刷新失败: ${error}`);
      }
    }
  };

  const handleCallTool = async (tool: MCPTool) => {
    try {
      const values = await form.validateFields();
      const toolArgs = values[`args_${tool.name}`] || {};

      // 尝试解析 JSON 参数
      let parsedArgs = {};
      if (typeof toolArgs === "string" && toolArgs.trim()) {
        try {
          parsedArgs = JSON.parse(toolArgs);
        } catch {
          // 如果不是 JSON，将其作为普通字符串参数
          parsedArgs = { input: toolArgs };
        }
      } else if (typeof toolArgs === "object") {
        parsedArgs = toolArgs;
      }

      const result = await callServiceTool(serverName, tool.name, parsedArgs);
      setToolResults((prev) => ({
        ...prev,
        [tool.name]: result,
      }));
      message.success(`工具 ${tool.name} 执行成功`);
    } catch (error) {
      message.error(`工具执行失败: ${error}`);
    }
  };

  const renderToolParameters = (tool: MCPTool) => {
    const { properties, required = [] } = tool.inputSchema;

    if (!properties || Object.keys(properties).length === 0) {
      return <Text type="secondary">此工具不需要参数</Text>;
    }

    return (
      <div>
        <Text strong>参数:</Text>
        <div style={{ marginTop: 8 }}>
          {Object.entries(properties).map(
            ([paramName, paramSchema]: [string, any]) => (
              <div key={paramName} style={{ marginBottom: 8 }}>
                <Space>
                  <Tag color={required.includes(paramName) ? "red" : "blue"}>
                    {paramName}
                  </Tag>
                  <Text type="secondary">
                    {paramSchema.type}
                    {required.includes(paramName) && "(必需)"}
                  </Text>
                </Space>
                {paramSchema.description && (
                  <div style={{ marginLeft: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: "12px" }} type="secondary">
                      {paramSchema.description}
                    </Text>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderToolResult = (tool: MCPTool) => {
    const result = toolResults[tool.name];
    if (!result) return null;

    return (
      <Alert
        description={
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {result.content.map((content, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                {content.type === "text" && (
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
                    {content.text}
                  </pre>
                )}
                {content.type === "image" && content.data && (
                  <img
                    alt="Tool result"
                    src={`data:${content.mimeType};base64,${content.data}`}
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                )}
              </div>
            ))}
          </div>
        }
        message="执行结果"
        style={{ marginTop: 16 }}
        type={result.isError ? "error" : "success"}
      />
    );
  };

  if (!service) {
    return null;
  }

  return (
    <Modal
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      onCancel={onCancel}
      open={visible}
      style={{ top: 20 }}
      title={`MCP 工具管理: ${serverName}`}
      width={800}
    >
      <div>
        {/* 连接状态和操作 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space align="center">
            <ApiOutlined />
            <Text strong>连接状态:</Text>
            <Tag color={isConnected ? "green" : "red"}>
              {isConnected ? "已连接" : "未连接"}
            </Tag>
            {isConnected && (
              <>
                <Divider type="vertical" />
                <Text type="secondary">已加载 {tools.length} 个工具</Text>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshTools}
                  size="small"
                >
                  刷新工具
                </Button>
              </>
            )}
          </Space>
        </Card>

        {!isConnected && (
          <Alert
            description="请先启动 MCP 服务。服务启动后，工具列表将自动加载。"
            message="MCP 服务未连接"
            style={{ marginBottom: 16 }}
            type="warning"
          />
        )}

        {isConnected && tools.length === 0 && (
          <Alert
            description="此 MCP 服务没有提供任何工具。"
            message="暂无可用工具"
            style={{ marginBottom: 16 }}
            type="info"
          />
        )}

        {/* 工具列表 */}
        {isConnected && tools.length > 0 && (
          <div>
            <Title level={5}>
              <CodeOutlined /> 可用工具 ({tools.length})
            </Title>
            <Form form={form}>
              <Collapse ghost>
                {tools.map((tool) => (
                  <Panel
                    extra={
                      <Button
                        icon={<PlayCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallTool(tool);
                        }}
                        size="small"
                        type="primary"
                      >
                        执行工具
                      </Button>
                    }
                    header={
                      <Space>
                        <Text strong>{tool.name}</Text>
                        <Text type="secondary">- {tool.description}</Text>
                      </Space>
                    }
                    key={tool.name}
                  >
                    <div style={{ paddingLeft: 16 }}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="描述">
                          {tool.description}
                        </Descriptions.Item>
                      </Descriptions>

                      {/* 参数说明 */}
                      <div style={{ marginTop: 16 }}>
                        {renderToolParameters(tool)}
                      </div>

                      {/* 参数输入 */}
                      <div style={{ marginTop: 16 }}>
                        <Text strong>执行参数 (JSON 格式):</Text>
                        <Form.Item
                          name={`args_${tool.name}`}
                          style={{ marginTop: 8 }}
                        >
                          <TextArea
                            placeholder='例如: {"owner": "facebook", "repo": "react"}'
                            rows={4}
                          />
                        </Form.Item>
                      </div>

                      {/* 执行结果 */}
                      {renderToolResult(tool)}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </Form>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MCPToolsModal;
