import {
  CheckOutlined,
  CopyOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  KeyOutlined,
  LinkOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { open } from "@tauri-apps/plugin-shell";
import {
  Card,
  Collapse,
  Dropdown,
  Flex,
  Input,
  message,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import { motion } from "motion/react";
import React, { useState } from "react";

import type { Model } from "@/store/modelStore";

import { useApiKeyStore } from "@/store/apiKeyStore";

import "./index.scss";

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface ProviderCardProps {
  providerId: string;
  models: Model[];
  currentModelId: string;
  onModelSelect: (model: Model) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerId,
  models,
  currentModelId,
  onModelSelect,
}) => {
  const { getApiKey, setApiKey } = useApiKeyStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [activePanel, setActivePanel] = useState<string | string[]>([]);
  const currentApiKey = getApiKey(providerId);
  const providerInfo = models[0];

  const handleEditApiKey = () => {
    setTempApiKey(currentApiKey || "");
    setEditModalVisible(true);
  };

  const handleSaveApiKey = () => {
    setApiKey(providerId, tempApiKey);
    setEditModalVisible(false);
    message.success("API Key 保存成功");
  };

  const handleOpenApiKeyUrl = () => {
    if (providerInfo.getApiKeyUrl) {
      open(providerInfo.getApiKeyUrl);
    }
  };

  const apiKeyMenuItems = [
    {
      key: "view",
      label: `${showApiKey ? "隐藏" : "查看"} API Key`,
      icon: showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />,
      onClick: () => setShowApiKey(!showApiKey),
      disabled: !currentApiKey,
    },
    {
      key: "edit",
      label: "编辑 API Key",
      icon: <EditOutlined />,
      onClick: handleEditApiKey,
    },
    {
      key: "get",
      label: "获取 API Key",
      icon: <LinkOutlined />,
      onClick: handleOpenApiKeyUrl,
    },
  ];

  const renderModelList = () => (
    <Flex gap={8} vertical>
      {models.map((model, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          key={model.modelId}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Card
            className={`model-card ${
              currentModelId === model.modelId ? "selected" : ""
            }`}
            hoverable
            onClick={() => onModelSelect(model)}
            size="small"
          >
            <Flex align="center" justify="space-between">
              <div className="model-info">
                <Flex align="center" gap={8}>
                  <Text strong>{model.name}</Text>
                  <Space size={0}>
                    {model.thinking && (
                      <Tag className="tag" color="blue">
                        推理
                      </Tag>
                    )}
                    {model.search && (
                      <Tag className="tag" color="cyan">
                        联网搜索
                      </Tag>
                    )}
                  </Space>
                </Flex>
                <Text className="model-description" type="secondary">
                  {model.description}
                </Text>
              </div>
              {currentModelId === model.modelId && (
                <motion.div
                  animate={{ scale: 1 }}
                  initial={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckOutlined className="selected-icon" />
                </motion.div>
              )}
            </Flex>
          </Card>
        </motion.div>
      ))}
    </Flex>
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="provider-card"
      initial={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <Flex
          align="center"
          className="provider-header"
          justify="space-between"
        >
          <Flex className="provider-info" vertical>
            <Title className="provider-name" level={5}>
              {providerInfo.providerName}
            </Title>
            <Text className="provider-desc" type="secondary">
              {models.length} 个模型
            </Text>
          </Flex>

          <Space size={4}>
            <Dropdown
              menu={{ items: apiKeyMenuItems }}
              placement="bottomRight"
              trigger={["click", "hover"]}
            >
              {currentApiKey ? (
                <Tag
                  className="status-tag"
                  color="success"
                  icon={<KeyOutlined />}
                >
                  已配置
                </Tag>
              ) : (
                <Tag
                  className="status-tag"
                  color="warning"
                  icon={<KeyOutlined />}
                >
                  未配置
                </Tag>
              )}
            </Dropdown>
          </Space>
        </Flex>

        {/* API Key 快速查看区域 */}
        {currentApiKey && showApiKey && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="api-key-preview"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              className="api-key-input"
              placeholder="API Key"
              prefix={<KeyOutlined style={{ color: "#1890ff" }} />}
              readOnly
              size="small"
              suffix={
                <CopyOutlined
                  onClick={() =>
                    navigator.clipboard
                      .writeText(currentApiKey)
                      .then(() => {
                        message.success("复制成功");
                      })
                      .catch(() => {
                        message.error("复制失败");
                      })
                  }
                  style={{ color: "#1890ff" }}
                />
              }
              value={currentApiKey}
            />
          </motion.div>
        )}

        <Collapse
          activeKey={activePanel}
          className="models-collapse"
          ghost
          onChange={setActivePanel}
          size="small"
        >
          <Panel
            header={
              <Flex align="center" gap={8}>
                <RobotOutlined />
                <Text strong>模型列表 ({models.length})</Text>
              </Flex>
            }
            key="models"
          >
            {renderModelList()}
          </Panel>
        </Collapse>
      </Card>

      <Modal
        cancelText="取消"
        centered
        okText="保存"
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveApiKey}
        open={editModalVisible}
        title={
          <Space>
            <KeyOutlined />
            编辑 {providerInfo.providerName} API Key
          </Space>
        }
        width={400}
      >
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 2 }}
          className="api-key-textarea"
          onChange={(e) => setTempApiKey(e.target.value)}
          placeholder={`请输入 ${providerInfo.providerName} API Key`}
          value={tempApiKey}
        />
      </Modal>
    </motion.div>
  );
};

export default ProviderCard;
