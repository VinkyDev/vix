import {
  CheckCircleFilled,
  CheckOutlined,
  FireOutlined,
  GithubOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
  VerifiedOutlined,
} from "@ant-design/icons";
import { open } from "@tauri-apps/plugin-shell";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { Rule } from "antd/es/form";
import { Fragment, useState } from "react";

import {
  getPopularTemplates,
  getTemplatesByCategory,
  mcpCategories,
  mcpTemplates,
} from "@/data/mcpMarket";
import { useMCPStore } from "@/store";
import { MCPMarketTemplate, MCPServerConfig } from "@/types/mcp";

const { Title, Text, Paragraph } = Typography;

interface MCPMarketDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface ServiceConfigModalProps {
  template: MCPMarketTemplate | null;
  visible: boolean;
  onClose: () => void;
  onAdd: (config: MCPServerConfig) => void;
}

// 服务配置模态框
const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  template,
  visible,
  onClose,
  onAdd,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!template) return;

    try {
      setLoading(true);
      const values = await form.validateFields();

      const env = { ...template.template.env };
      const args = [...template.template.args];

      template.params.forEach((param) => {
        const value = values[param.key];
        if (value !== undefined && value !== "") {
          if (param.position === "env") {
            env[param.key] = value;
          } else if (param.position === "args") {
            if (param.multiple) {
              const separator = param.separator || ",";
              const multipleValues = value
                .split(separator)
                .map((v: string) => v.trim())
                .filter((v: string) => v);
              args.push(...multipleValues);
            } else {
              args.push(value);
            }
          }
        }
      });

      const baseName = template.name;
      let serviceName = baseName;
      let counter = 1;

      const { services } = useMCPStore.getState();
      while (services[serviceName]) {
        serviceName = `${baseName}-${counter}`;
        counter++;
      }

      const config: MCPServerConfig = {
        name: serviceName,
        displayName: template.displayName,
        icon: template.icon || "🔧",
        command: template.template.command,
        args,
        env,
        cwd: template.template.cwd,
      };

      onAdd(config);
      form.resetFields();
      onClose();
      message.success(`已添加 ${template.displayName}`);
    } catch {
      message.error("添加服务失败，请检查配置");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      cancelText="取消"
      confirmLoading={loading}
      destroyOnHidden
      okText="添加服务"
      onCancel={handleClose}
      onOk={handleAdd}
      open={visible}
      title={
        <Space>
          <span style={{ fontSize: "18px" }}>{template?.icon}</span>
          <span>配置 {template?.displayName}</span>
        </Space>
      }
      width="100%"
    >
      {template && (
        <div style={{ marginBottom: "24px" }}>
          <Paragraph type="secondary">{template.description}</Paragraph>

          {/* 配置指引卡片 */}
          {template.guide && (
            <Alert
              action={
                <Button
                  onClick={() => {
                    Modal.info({
                      title: template.guide?.title,
                      width: 600,
                      content: (
                        <div>
                          <div style={{ marginBottom: "16px" }}>
                            <Text>{template.guide?.description}</Text>
                          </div>
                          <div style={{ marginBottom: "16px" }}>
                            {template.guide?.steps.map((step, index) => (
                              <div
                                key={index}
                                style={{
                                  marginBottom: "8px",
                                }}
                              >
                                <Text>
                                  <strong>{index + 1}.</strong> {step}
                                </Text>
                              </div>
                            ))}
                          </div>
                          {template.guide?.links &&
                            template.guide.links.length > 0 && (
                              <Alert
                                description={
                                  <div>
                                    {template.guide.links.map((link, index) => (
                                      <div key={index}>
                                        <a
                                          href={link.url}
                                          rel="noopener noreferrer"
                                          target="_blank"
                                        >
                                          {link.text}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                }
                                message="相关资源"
                                type="info"
                              />
                            )}
                        </div>
                      ),
                    });
                  }}
                  size="small"
                  type="primary"
                >
                  查看详细步骤
                </Button>
              }
              description={template.guide.description}
              message={
                <span>
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  {template.guide.title}
                </span>
              }
              style={{ marginBottom: 16 }}
              type="info"
            />
          )}

          {template.params.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircleFilled
                style={{
                  fontSize: "24px",
                  color: "#52c41a",
                  marginBottom: "8px",
                }}
              />
              <div>
                <Text strong>零配置服务</Text>
              </div>
              <Text type="secondary">无需额外配置，点击即可添加</Text>
            </div>
          ) : (
            <>
              <Divider orientation="left">配置参数</Divider>
              <Form form={form} layout="vertical">
                {template.params.map((param) => {
                  const rules: Rule[] = [];
                  if (param.required) {
                    rules.push({
                      required: true,
                      message: `请输入${param.label}`,
                    });
                  }
                  if (param.validation?.pattern) {
                    rules.push({
                      pattern: new RegExp(param.validation.pattern),
                      message:
                        param.validation.message || `${param.label}格式不正确`,
                    });
                  }

                  return (
                    <div key={param.key}>
                      <Form.Item
                        initialValue={param.defaultValue}
                        label={param.label}
                        name={param.key}
                        rules={rules}
                        tooltip={param.description}
                      >
                        <Input
                          placeholder={param.placeholder}
                          type={param.type === "number" ? "number" : "text"}
                        />
                      </Form.Item>
                    </div>
                  );
                })}
              </Form>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

// 服务卡片组件
const ServiceCard: React.FC<{
  template: MCPMarketTemplate;
  onConfigure: (template: MCPMarketTemplate) => void;
  isAdded: boolean;
}> = ({ template, onConfigure, isAdded }) => {
  return (
    <Card
      hoverable
      style={{
        height: "100%",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      styles={{ body: { padding: "20px" } }}
    >
      {/* 头部 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "32px", marginRight: "12px" }}>
          {template.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {template.displayName}
            </Title>
            <Space>
              {template.popular && (
                <Tooltip title="热门服务">
                  <FireOutlined style={{ color: "#ff4d4f" }} />
                </Tooltip>
              )}
              {template.official && (
                <Tooltip title="官方服务">
                  <VerifiedOutlined style={{ color: "#52c41a" }} />
                </Tooltip>
              )}
            </Space>
          </div>
        </div>
      </div>

      {/* 描述 */}
      <Paragraph
        ellipsis={{ rows: 2 }}
        style={{
          fontSize: "13px",
          color: "#666",
          marginBottom: "16px",
          minHeight: "40px",
        }}
      >
        {template.description}
      </Paragraph>

      {/* 标签 */}
      <div style={{ marginBottom: "16px" }}>
        {template.tags.slice(0, 3).map((tag) => (
          <Tag key={tag} style={{ marginBottom: "4px" }}>
            {tag}
          </Tag>
        ))}
        {template.tags.length > 3 && (
          <Tooltip
            title={
              <div>
                {template.tags.slice(3).map((tag) => (
                  <Tag key={tag} style={{ margin: "2px" }}>
                    {tag}
                  </Tag>
                ))}
              </div>
            }
          >
            <Tag style={{ marginBottom: "4px", cursor: "help" }}>
              +{template.tags.length - 3}
            </Tag>
          </Tooltip>
        )}
      </div>

      {/* 底部操作 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #f0f0f0",
          paddingTop: "16px",
          marginTop: "auto",
        }}
      >
        <Space>
          {template.repository && (
            <Tooltip title="查看源码">
              <Button
                icon={<GithubOutlined />}
                onClick={() => open(template.repository || "")}
                size="small"
                type="text"
              />
            </Tooltip>
          )}
          {template.documentation && (
            <Tooltip title="查看文档">
              <Button
                icon={<LinkOutlined />}
                onClick={() => open(template.documentation || "")}
                size="small"
                type="text"
              />
            </Tooltip>
          )}
        </Space>
        {isAdded ? (
          <Button
            disabled
            icon={<CheckOutlined />}
            style={{
              background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
              borderColor: "transparent",
              color: "#fff",
              fontWeight: 500,
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(82, 196, 26, 0.2)",
              cursor: "default",
              opacity: 0.8,
            }}
          >
            已添加
          </Button>
        ) : (
          <Button
            icon={<PlusOutlined />}
            onClick={() => onConfigure(template)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(24, 144, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(24, 144, 255, 0.3)";
            }}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              borderColor: "transparent",
              color: "#fff",
              fontWeight: 500,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            添加
          </Button>
        )}
      </div>
    </Card>
  );
};

// 主组件
const MCPMarketDrawer: React.FC<MCPMarketDrawerProps> = ({
  visible,
  onClose,
}) => {
  const { addService } = useMCPStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MCPMarketTemplate | null>(null);

  // 获取过滤后的模板
  const getFilteredTemplates = (): MCPMarketTemplate[] => {
    let templates = mcpTemplates;

    // 按分类过滤
    if (selectedCategory === "popular") {
      templates = getPopularTemplates();
    } else if (selectedCategory !== "all") {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // 按搜索关键词过滤
    if (searchQuery.trim()) {
      templates = templates.filter(
        (template) =>
          template.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return templates;
  };

  const handleConfigure = (template: MCPMarketTemplate) => {
    setSelectedTemplate(template);
    setConfigModalVisible(true);
  };

  const handleAddService = (config: MCPServerConfig) => {
    addService(config);
    setConfigModalVisible(false);
    setSelectedTemplate(null);
  };

  // 构建标签页
  const tabItems = [
    {
      key: "all",
      label: "全部",
      children: null,
    },
    {
      key: "popular",
      label: (
        <Space>
          <FireOutlined />
          热门
        </Space>
      ),
      children: null,
    },
    ...mcpCategories.map((category) => ({
      key: category.id,
      label: (
        <Space>
          <span>{category.icon}</span>
          {category.name}
        </Space>
      ),
      children: null,
    })),
  ];

  const filteredTemplates = getFilteredTemplates();

  return (
    <Fragment>
      <Drawer onClose={onClose} open={visible} title={null} width="100%">
        <div style={{ marginBottom: "24px" }}>
          <Input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 MCP 服务..."
            prefix={<SearchOutlined />}
            size="large"
            style={{ borderRadius: "8px" }}
            value={searchQuery}
          />
        </div>

        <Tabs
          activeKey={selectedCategory}
          items={tabItems}
          onChange={setSelectedCategory}
        />

        {/* 服务列表 */}
        {filteredTemplates.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#999",
            }}
          >
            <SearchOutlined
              style={{ fontSize: "48px", marginBottom: "16px" }}
            />
            <div>没有找到符合条件的服务</div>
            <Text type="secondary">尝试使用其他关键词或分类</Text>
          </div>
        ) : (
          <Fragment>
            <div style={{ marginBottom: "16px" }}>
              <Text type="secondary">
                找到 {filteredTemplates.length} 个服务
              </Text>
            </div>
            <Row gutter={[16, 16]}>
              {filteredTemplates.map((template) => {
                const isAdded = Object.values(
                  useMCPStore.getState().services
                ).some(
                  (service) =>
                    service.config?.name === template.name ||
                    (service.config?.name &&
                      service.config.name.startsWith(`${template.name}-`))
                );
                return (
                  <Col key={template.id} lg={6} md={8} sm={12} xs={24}>
                    <ServiceCard
                      isAdded={isAdded}
                      onConfigure={handleConfigure}
                      template={template}
                    />
                  </Col>
                );
              })}
            </Row>
          </Fragment>
        )}
      </Drawer>

      <ServiceConfigModal
        onAdd={handleAddService}
        onClose={() => {
          setConfigModalVisible(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        visible={configModalVisible}
      />
    </Fragment>
  );
};

export default MCPMarketDrawer;
