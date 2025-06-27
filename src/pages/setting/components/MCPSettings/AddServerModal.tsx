import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal } from "antd";
import React from "react";

import { useMCPStore } from "@/store";
import { MCPServerConfig } from "@/types";

interface AddServerModalProps {
  visible: boolean;
  onCancel: () => void;
}

const AddServerModal: React.FC<AddServerModalProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { addService, services } = useMCPStore();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 检查服务名是否已存在
      if (services[values.name]) {
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

      const config: MCPServerConfig = {
        name: values.name,
        command: values.command,
        args: values.args ? values.args.split(/\s+/).filter(Boolean) : [],
        env: Object.keys(env).length > 0 ? env : undefined,
        cwd: values.cwd || undefined,
      };

      addService(config);
      message.success(`服务 ${values.name} 添加成功`);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("添加服务失败:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      cancelText="取消"
      destroyOnHidden
      okText="添加"
      onCancel={handleCancel}
      onOk={handleSubmit}
      open={visible}
      title="添加 MCP 服务"
      width={600}
    >
      <Form
        form={form}
        initialValues={{
          envVars: [{ key: "", value: "" }],
        }}
        layout="vertical"
      >
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
          <Input placeholder="例如: GitHub" />
        </Form.Item>

        <Form.Item
          label="命令"
          name="command"
          rules={[{ required: true, message: "请输入命令" }]}
        >
          <Input placeholder="例如: npx" />
        </Form.Item>

        <Form.Item
          label="参数"
          name="args"
          rules={[{ required: true, message: "请输入参数" }]}
        >
          <Input placeholder="例如: -y @modelcontextprotocol/server-github" />
        </Form.Item>

        <Form.Item label="工作目录" name="cwd">
          <Input placeholder="留空使用默认目录" />
        </Form.Item>

        <Form.Item label="环境变量">
          <Form.List name="envVars">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div className="env-item" key={key}>
                    <Form.Item
                      {...restField}
                      name={[name, "key"]}
                      rules={[{ required: true, message: "请输入变量名" }]}
                      style={{ margin: 0, flex: 1 }}
                    >
                      <Input placeholder="变量名" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      rules={[{ required: true, message: "请输入变量值" }]}
                      style={{ margin: 0, flex: 2 }}
                    >
                      <Input.Password placeholder="变量值" />
                    </Form.Item>
                    <Button
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      type="text"
                    />
                  </div>
                ))}
                <Button
                  className="add-env-btn"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  type="dashed"
                >
                  添加环境变量
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddServerModal;
