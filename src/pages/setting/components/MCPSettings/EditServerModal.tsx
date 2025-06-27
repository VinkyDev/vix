import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal } from "antd";
import React, { useEffect } from "react";

import { useMCPStore } from "@/store";

interface EditServerModalProps {
  visible: boolean;
  serverName: string;
  onCancel: () => void;
}

const EditServerModal: React.FC<EditServerModalProps> = ({
  visible,
  serverName,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { services, updateService } = useMCPStore();

  const service = services[serverName];

  useEffect(() => {
    if (visible && service) {
      // 将环境变量转换为表单格式
      const envVars = service.config.env
        ? Object.entries(service.config.env).map(([key, value]) => ({
            key,
            value,
          }))
        : [{ key: "", value: "" }];

      form.setFieldsValue({
        command: service.config.command,
        args: service.config.args.join(" "),
        cwd: service.config.cwd || "",
        envVars,
      });
    }
  }, [visible, service, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 处理环境变量
      const env: Record<string, string> = {};
      if (values.envVars) {
        values.envVars.forEach((item: { key: string; value: string }) => {
          if (item.key && item.value) {
            env[item.key] = item.value;
          }
        });
      }

      const configUpdate = {
        command: values.command,
        args: values.args ? values.args.split(/\s+/).filter(Boolean) : [],
        env: Object.keys(env).length > 0 ? env : undefined,
        cwd: values.cwd || undefined,
      };

      updateService(serverName, configUpdate);
      message.success(`服务 ${serverName} 更新成功`);
      onCancel();
    } catch (error) {
      console.error("更新服务失败:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!service) {
    return null;
  }

  return (
    <Modal
      cancelText="取消"
      destroyOnClose
      okText="保存"
      onCancel={handleCancel}
      onOk={handleSubmit}
      open={visible}
      title={`编辑服务: ${serverName}`}
      width={600}
    >
      <Form form={form} layout="vertical">
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

export default EditServerModal;
