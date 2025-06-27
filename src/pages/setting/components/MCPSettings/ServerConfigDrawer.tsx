import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useEffect } from "react";

import { useMCPStore } from "@/store";
import { MCPServerConfig } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ServerConfigDrawerProps {
  visible: boolean;
  mode: "add" | "edit";
  serverName?: string;
  onClose: () => void;
}

// 命令选项
const commandOptions = [
  { label: "npx", value: "npx", description: "Node.js 包执行器" },
];

const ServerConfigDrawer: React.FC<ServerConfigDrawerProps> = ({
  visible,
  mode,
  serverName,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { services, addService, updateService } = useMCPStore();

  const service = mode === "edit" && serverName ? services[serverName] : null;
  const isEdit = mode === "edit";

  useEffect(() => {
    if (visible) {
      if (isEdit && service) {
        // 编辑模式：填充现有数据
        const envVars = service.config.env
          ? Object.entries(service.config.env).map(([key, value]) => ({
              key,
              value,
            }))
          : [];

        form.setFieldsValue({
          name: service.config.name,
          command: service.config.command,
          args: service.config.args.join(" "),
          cwd: service.config.cwd || "",
          envVars: envVars.length > 0 ? envVars : [{ key: "", value: "" }],
        });
      } else {
        // 添加模式：初始化空表单
        form.setFieldsValue({
          name: "",
          command: "npx",
          args: "",
          cwd: "",
          envVars: [{ key: "", value: "" }],
        });
      }
    }
  }, [visible, isEdit, service, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 检查服务名是否已存在（仅添加模式）
      if (!isEdit && services[values.name]) {
        message.error("服务名称已存在");
        return;
      }

      // 处理环境变量
      const env: Record<string, string> = {};
      if (values.envVars) {
        values.envVars.forEach((item: { key: string; value: string }) => {
          if (item.key && item.value) {
            env[item.key] = item.value;
          }
        });
      }

      if (isEdit && serverName) {
        // 编辑模式
        const configUpdate = {
          command: values.command,
          args: values.args ? values.args.split(/\s+/).filter(Boolean) : [],
          env: Object.keys(env).length > 0 ? env : undefined,
          cwd: values.cwd || undefined,
        };

        updateService(serverName, configUpdate);
        message.success(`服务 ${serverName} 更新成功`);
      } else {
        // 添加模式
        const config: MCPServerConfig = {
          name: values.name,
          command: values.command,
          args: values.args ? values.args.split(/\s+/).filter(Boolean) : [],
          env: Object.keys(env).length > 0 ? env : undefined,
          cwd: values.cwd || undefined,
        };

        addService(config);
        message.success(`服务 ${values.name} 添加成功`);
      }

      handleClose();
    } catch (error) {
      message.error(`操作失败，请检查输入: ${error}`);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      destroyOnClose
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
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? `编辑服务: ${serverName}` : "添加 MCP 服务"}
          </Title>
        </Space>
      }
      width={520}
    >
      <div style={{ padding: "0 0 24px 0" }}>
        <Form
          form={form}
          layout="vertical"
          size="large"
          style={{ maxWidth: "100%" }}
        >
          {/* 基本信息卡片 */}
          <Card size="small" style={{ marginBottom: "16px" }} title="基本信息">
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
      </div>
    </Drawer>
  );
};

export default ServerConfigDrawer;
