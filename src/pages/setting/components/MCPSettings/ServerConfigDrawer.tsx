import {
  CodeOutlined,
  FormOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Flex,
  Form,
  Input,
  message,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";

import JsonEditor, { JsonEditorRef } from "@/components/JsonEditor";
import { useMCPStore } from "@/store";
import { MCPServerConfig } from "@/types";

import {
  commandOptions,
  createConfigFromForm,
  formToJson,
  jsonToForm,
  parseJsonConfig,
  validateConfig,
} from "./helper";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ServerConfigDrawerProps {
  visible: boolean;
  mode: "add" | "edit";
  serverName?: string;
  onClose: () => void;
}

const ServerConfigDrawer: React.FC<ServerConfigDrawerProps> = ({
  visible,
  mode,
  serverName,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState<"form" | "json">("form");
  const [jsonValue, setJsonValue] = useState<string>("");
  const [jsonError, setJsonError] = useState<string>("");
  const jsonEditorRef = useRef<JsonEditorRef>(null);
  const { services, addService, updateService } = useMCPStore();

  const service = mode === "edit" && serverName ? services[serverName] : null;
  const isEdit = mode === "edit";

  // 切换编辑模式
  const handleModeSwitch = (checked: boolean) => {
    const newMode = checked ? "json" : "form";

    if (newMode === "json") {
      // 从表单模式切换到JSON模式
      const formData = form.getFieldsValue();
      const jsonData = formToJson(formData, isEdit, serverName);
      setJsonValue(jsonData);
    } else {
      // 从JSON模式切换到表单模式
      try {
        const formData = jsonToForm(jsonValue);
        form.setFieldsValue(formData);
        setJsonError("");
      } catch {
        message.error("JSON格式无效，无法切换到表单模式");
        return;
      }
    }

    setEditMode(newMode);
  };

  useEffect(() => {
    if (visible) {
      // 重置编辑模式为表单模式
      setEditMode("form");
      setJsonError("");

      if (isEdit && service) {
        // 编辑模式：填充现有数据
        const envVars = service.config.env
          ? Object.entries(service.config.env).map(([key, value]) => ({
              key,
              value,
            }))
          : [];

        const formData = {
          name: service.config.name,
          command: service.config.command,
          args: service.config.args.join(" "),
          cwd: service.config.cwd || "",
          envVars,
        };

        form.setFieldsValue(formData);
        setJsonValue(formToJson(formData, isEdit, serverName));
      } else {
        // 添加模式：初始化空表单
        const initialData = {
          name: "",
          command: "npx",
          args: "",
          cwd: "",
          envVars: [],
        };

        form.setFieldsValue(initialData);
        setJsonValue(formToJson(initialData, isEdit, serverName));
      }
    }
  }, [visible, isEdit, service, form]);

  const handleSubmit = async () => {
    try {
      let config: MCPServerConfig;

      if (editMode === "json") {
        // JSON模式：从JSON编辑器获取数据
        if (jsonError) {
          message.error("JSON格式错误，请检查后再提交");
          return;
        }

        try {
          config = parseJsonConfig(jsonValue);

          // 验证必填字段
          if (!validateConfig(config)) {
            message.error("配置中缺少必填字段：服务名或命令");
            return;
          }
        } catch (error) {
          message.error(
            error instanceof Error ? error.message : "JSON格式无效"
          );
          return;
        }
      } else {
        // 表单模式：从表单获取数据
        const values = await form.validateFields();
        config = createConfigFromForm(values);
      }

      // 检查服务名是否已存在（仅添加模式）
      if (!isEdit && services[config.name]) {
        message.error("服务名称已存在");
        return;
      }

      if (isEdit && serverName) {
        // 编辑模式
        const configUpdate = {
          command: config.command,
          args: config.args,
          env: config.env,
          cwd: config.cwd,
        };

        updateService(serverName, configUpdate);
        message.success(`服务 ${serverName} 更新成功`);
      } else {
        // 添加模式
        addService(config);
        message.success(`服务 ${config.name} 添加成功`);
      }

      handleClose();
    } catch (formError) {
      message.error(`操作失败，请检查输入: ${formError}`);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={handleClose}>取消</Button>
            <Button onClick={handleSubmit} type="primary">
              {isEdit ? "保存" : "添加"}
            </Button>
          </Space>
        </div>
      }
      onClose={handleClose}
      open={visible}
      placement="right"
      title={
        <Flex align="center" justify="space-between">
          <Title level={5} style={{ margin: 0 }}>
            {isEdit ? `编辑MCP服务: ${serverName}` : "添加 MCP 服务"}
          </Title>
          <Space align="center">
            <Text>{editMode === "form" ? "表单模式" : "JSON模式"}</Text>
            <FormOutlined
              style={{ color: editMode === "form" ? "#1890ff" : "#999" }}
            />
            <Switch
              checked={editMode === "json"}
              onChange={handleModeSwitch}
              size="small"
              style={{
                transform: "translateY(-2px)",
              }}
            />
            <CodeOutlined
              style={{ color: editMode === "json" ? "#1890ff" : "#999" }}
            />
          </Space>
        </Flex>
      }
      width={520}
    >
      <div style={{ padding: "0 0 24px 0", height: "100%" }}>
        {editMode === "json" ? (
          <>
            <JsonEditor
              config={{
                theme: "vs",
                validate: true,
                formatOnPaste: true,
              }}
              onChange={(value, isValid) => {
                setJsonValue(value || "");
                setJsonError(isValid ? "" : "JSON格式错误");
              }}
              ref={jsonEditorRef}
              value={jsonValue}
            />
            {jsonError && (
              <Alert
                message={jsonError}
                style={{ marginTop: 8 }}
                type="error"
              />
            )}
          </>
        ) : (
          <Form form={form} layout="vertical" size="large">
            {/* 基本信息卡片 */}
            <Card
              size="small"
              style={{ marginBottom: "16px" }}
              title="基本信息"
            >
              {!isEdit && (
                <Form.Item
                  label="服务名称"
                  name="name"
                  rules={[
                    { required: true, message: "请输入服务名称" },
                    {
                      pattern: /^[a-zA-Z0-9_-]+$/,
                      message: "服务名称只能包含字母、数字、下划线和横线",
                    },
                  ]}
                >
                  <Input
                    placeholder="例如: GitHub"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              )}

              <Form.Item
                label={
                  <Space>
                    <Text>命令</Text>
                    <Text style={{ fontSize: "12px" }} type="secondary">
                      选择要执行的命令
                    </Text>
                  </Space>
                }
                name="command"
                rules={[{ required: true, message: "请选择命令" }]}
              >
                <Select
                  options={commandOptions.map((option) => ({
                    ...option,
                    label: (
                      <div>
                        <div>{option.label}</div>
                      </div>
                    ),
                  }))}
                  placeholder="选择命令"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <Text>参数</Text>
                    <Text style={{ fontSize: "12px" }} type="secondary">
                      命令行参数，空格分隔
                    </Text>
                  </Space>
                }
                name="args"
                rules={[{ required: true, message: "请输入参数" }]}
              >
                <TextArea
                  placeholder="例如: -y @modelcontextprotocol/server-github"
                  rows={2}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <Text>工作目录</Text>
                    <Text style={{ fontSize: "12px" }} type="secondary">
                      可选，留空使用默认目录
                    </Text>
                  </Space>
                }
                name="cwd"
              >
                <Input
                  placeholder="留空使用默认目录"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>
            </Card>

            {/* 环境变量卡片 */}
            <Card size="small" title="环境变量">
              <Form.Item name="envVars" style={{ marginBottom: 0 }}>
                <Form.List name="envVars">
                  {(fields, { add, remove }) => (
                    <div>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "12px",
                            alignItems: "flex-start",
                          }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "key"]}
                            rules={[{ required: true, message: "变量名" }]}
                            style={{ margin: 0, flex: 1 }}
                          >
                            <Input
                              placeholder="变量名"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "value"]}
                            rules={[{ required: true, message: "变量值" }]}
                            style={{ margin: 0, flex: 2 }}
                          >
                            <Input.Password
                              placeholder="变量值"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                          <Button
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            style={{
                              marginTop: "6px",
                              borderRadius: "6px",
                            }}
                            type="text"
                          />
                        </div>
                      ))}
                      <Button
                        block
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                        style={{
                          borderRadius: "8px",
                          height: "40px",
                          marginTop: "8px",
                        }}
                        type="dashed"
                      >
                        添加环境变量
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Form.Item>
            </Card>
          </Form>
        )}
      </div>
    </Drawer>
  );
};

export default ServerConfigDrawer;
