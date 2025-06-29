import {
  CodeOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";

import { useMCPStore } from "@/store";
import { MCPTool, MCPToolResult } from "@/types";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface MCPToolsDrawerProps {
  visible: boolean;
  serviceName: string;
  onClose: () => void;
}

export default function MCPToolsDrawer({
  visible,
  serviceName,
  onClose,
}: MCPToolsDrawerProps) {
  const { services, callServiceTool } = useMCPStore();
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [form] = Form.useForm();
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<MCPToolResult | null>(null);

  const service = services[serviceName];
  const tools = useMemo(() => service?.tools || [], [service]);

  useEffect(() => {
    if (visible && tools.length > 0) {
      if (!selectedTool || !tools.find((t) => t.name === selectedTool.name)) {
        setSelectedTool(tools[0]);
      }
    } else {
      setSelectedTool(null);
    }
  }, [visible, tools, selectedTool]);

  useEffect(() => {
    form.resetFields();
    setResult(null);
  }, [selectedTool, form]);

  const handleToolSelect = (tool: MCPTool) => {
    setSelectedTool(tool);
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;

    const values = await form.validateFields();

    try {
      setExecuting(true);

      const args: Record<string, any> = {};
      Object.keys(values).forEach((key) => {
        const value = values[key];
        if (value !== undefined && value !== "" && value !== null) {
          const paramSchema = selectedTool.inputSchema?.properties?.[key];
          const paramType = paramSchema?.type;

          if (paramType === "object" || paramType === "array") {
            try {
              args[key] = JSON.parse(value);
            } catch {
              args[key] = value;
            }
          } else {
            args[key] = value;
          }
        }
      });

      const result = await callServiceTool(
        serviceName,
        selectedTool.name,
        args
      );
      setResult(result);
      message.success("工具执行成功");
    } catch (error) {
      message.error(`工具执行失败: ${error}`);
      setResult({
        content: [
          {
            type: "text",
            text: `错误: ${error}`,
          },
        ],
        isError: true,
      });
    } finally {
      setExecuting(false);
    }
  };

  const renderToolList = () => (
    <List
      dataSource={tools}
      itemLayout="horizontal"
      renderItem={(tool) => (
        <List.Item
          className={`tool-list-item ${
            selectedTool?.name === tool.name ? "selected" : ""
          }`}
          onClick={() => handleToolSelect(tool)}
          style={{
            cursor: "pointer",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "4px 0",
            backgroundColor:
              selectedTool?.name === tool.name ? "#f0f9ff" : "transparent",
            border:
              selectedTool?.name === tool.name
                ? "1px solid #1890ff"
                : "1px solid transparent",
            transition: "all 0.3s ease",
          }}
        >
          <List.Item.Meta
            avatar={
              <ToolOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
            }
            description={
              <Text
                style={{
                  fontSize: "12px",
                  display: "block",
                  maxHeight: "32px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "16px",
                }}
                title={tool.description || "暂无描述"}
                type="secondary"
              >
                {tool.description || "暂无描述"}
              </Text>
            }
            title={
              <Text strong style={{ fontSize: "14px" }}>
                {tool.name}
              </Text>
            }
          />
        </List.Item>
      )}
    />
  );

  const getFormInput = (
    paramType: string,
    paramSchema: any,
    paramName: string
  ) => {
    if (paramType === "string" && paramSchema.enum) {
      return <Input placeholder={`选择 ${paramName}`} />;
    }

    if (paramType === "object" || paramType === "array") {
      return (
        <TextArea placeholder={`请输入 JSON 格式的 ${paramName}`} rows={3} />
      );
    }

    return <Input placeholder={`请输入 ${paramName}`} />;
  };

  const renderParameterForm = () => {
    if (!selectedTool) return null;

    const schema = selectedTool.inputSchema;
    const properties = schema?.properties || {};
    const required = schema?.required || [];

    if (Object.keys(properties).length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "32px", color: "#999" }}>
          此工具无需参数
        </div>
      );
    }

    return (
      <Form form={form} layout="vertical" requiredMark={false}>
        {Object.entries(properties).map(
          ([paramName, paramSchema]: [string, any]) => {
            const isRequired = required.includes(paramName);
            const paramType = paramSchema.type || "string";

            return (
              <Form.Item
                key={paramName}
                label={
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <Text strong>{paramName}</Text>
                      {isRequired && <Tag color="red">必填</Tag>}
                      <Tag color="blue">{paramType}</Tag>
                    </Space>
                    {paramSchema.description && (
                      <Text style={{ fontSize: "12px" }} type="secondary">
                        {paramSchema.description}
                      </Text>
                    )}
                  </Space>
                }
                name={paramName}
                rules={[
                  {
                    required: isRequired,
                    message: `请输入 ${paramName}`,
                  },
                ]}
                style={{ marginBottom: "24px" }}
              >
                {getFormInput(paramType, paramSchema, paramName)}
              </Form.Item>
            );
          }
        )}
      </Form>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card
        size="small"
        style={{ marginTop: "16px" }}
        title={
          <Space>
            <CodeOutlined />
            <Text strong>执行结果</Text>
          </Space>
        }
      >
        {result.content.map((content, index) => (
          <div key={index} style={{ marginBottom: "8px" }}>
            {content.type === "text" && (
              <pre
                style={{
                  background: result.isError ? "#fff2f0" : "#f6ffed",
                  border: result.isError
                    ? "1px solid #ffccc7"
                    : "1px solid #b7eb8f",
                  borderRadius: "6px",
                  padding: "12px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  color: result.isError ? "#cf1322" : "#389e0d",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {content.text}
              </pre>
            )}
            {content.type === "image" && content.data && (
              <img
                alt="Tool result"
                src={`data:${content.mimeType || "image/png"};base64,${
                  content.data
                }`}
                style={{ maxWidth: "100%", borderRadius: "6px" }}
              />
            )}
          </div>
        ))}
      </Card>
    );
  };

  return (
    <Drawer
      onClose={onClose}
      open={visible}
      placement="right"
      styles={{ body: { padding: 0 } }}
      title={
        <Space>
          <ToolOutlined />
          <Text strong>工具管理 - {serviceName}</Text>
        </Space>
      }
      width="80%"
    >
      <Row style={{ height: "100%" }}>
        <Col
          span={8}
          style={{ borderRight: "1px solid #f0f0f0", height: "100%" }}
        >
          <div
            style={{
              padding: "8px",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {tools.length === 0 ? (
              <Empty
                description="暂无可用工具"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: "60px" }}
              />
            ) : (
              renderToolList()
            )}
          </div>
        </Col>

        <Col span={16} style={{ height: "100%" }}>
          {!selectedTool ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Empty
                description="请选择一个工具"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
              {/* 工具信息 */}
              <Card size="small" style={{ marginBottom: "16px" }}>
                <Title level={4} style={{ margin: "0 0 8px 0" }}>
                  {selectedTool.name}
                </Title>
                <Paragraph style={{ margin: "0 0 16px 0" }} type="secondary">
                  {selectedTool.description || "暂无描述"}
                </Paragraph>
              </Card>

              {/* 参数设置 - 合并了参数说明 */}
              <Card
                extra={
                  <Button
                    icon={
                      executing ? <LoadingOutlined /> : <PlayCircleOutlined />
                    }
                    loading={executing}
                    onClick={handleExecuteTool}
                    type="primary"
                  >
                    执行工具
                  </Button>
                }
                size="small"
                title="参数设置"
              >
                {renderParameterForm()}
              </Card>

              {/* 执行结果 */}
              {renderResult()}
            </div>
          )}
        </Col>
      </Row>
    </Drawer>
  );
}
