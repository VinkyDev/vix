import { LinkOutlined } from "@ant-design/icons";
import { open } from "@tauri-apps/plugin-shell";
import {
  Button,
  Card,
  Flex,
  Input,
  List,
  message,
  Switch,
  Tag,
  Typography,
} from "antd";
import { debounce } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";

import { useApiKeyStore } from "@/store/apiKeyStore";
import { type Model, useModelStore } from "@/store/modelStore";

const { Text, Title } = Typography;

interface ProviderDetailProps {
  providerId: string;
  models: Model[];
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({
  providerId,
  models,
}) => {
  const { getApiKey, setApiKey } = useApiKeyStore();
  const { toggleModel, isModelEnabled } = useModelStore();
  const [tempApiKey, setTempApiKey] = useState("");

  const currentApiKey = getApiKey(providerId);
  const providerInfo = models[0];

  // 初始化
  useEffect(() => {
    setTempApiKey(currentApiKey || "");
  }, [currentApiKey, providerInfo.getApiKeyUrl]);

  // 防抖保存API Key
  const debouncedSaveApiKey = useCallback(
    debounce((value: string) => {
      if (value !== currentApiKey) {
        setApiKey(providerId, value);
        if (value) {
          message.success("API Key 已保存");
        }
      }
    }, 1000),
    [providerId, currentApiKey, setApiKey]
  );

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempApiKey(value);
    debouncedSaveApiKey(value);
  };

  const handleOpenApiKeyUrl = () => {
    if (providerInfo.getApiKeyUrl) {
      open(providerInfo.getApiKeyUrl);
    }
  };

  const handleModelToggle = (model: Model, enabled: boolean) => {
    toggleModel(model.modelId, enabled);
  };

  const enabledCount = models.filter(
    (m) => isModelEnabled(m.modelId)
  ).length;

  return (
    <div className="provider-detail">
      {/* 供应商头部信息 */}
      <Flex align="center" className="provider-header" justify="space-between">
        <Title level={4} style={{ margin: 0, fontSize: 18 }}>
          {providerInfo.providerName}
        </Title>
        <Tag color={currentApiKey ? "success" : "warning"}>
          {currentApiKey ? "已配置" : "未配置"}
        </Tag>
      </Flex>

      {/* API Key 配置区域 */}
      <Card
        className="api-section"
        size="small"
        styles={{
          header: { padding: "12px 16px", minHeight: "auto" },
          body: { padding: "12px 16px" },
        }}
        title={
          <Flex align="center" gap={8}>
            <Text style={{ fontSize: 14, fontWeight: 500 }}>API Key</Text>
            {providerInfo.getApiKeyUrl && (
              <Button
                icon={<LinkOutlined style={{ fontSize: 12 }} />}
                onClick={handleOpenApiKeyUrl}
                size="small"
                style={{ padding: 0, height: "auto" }}
                type="link"
              >
                获取
              </Button>
            )}
          </Flex>
        }
      >
        <Input
          onChange={handleApiKeyChange}
          placeholder="请输入API Key"
          style={{ fontSize: 13 }}
          value={tempApiKey}
        />
      </Card>

      {/* 模型列表 */}
      <Card
        className="models-section"
        size="small"
        styles={{
          header: { padding: "12px 16px", minHeight: "auto" },
          body: { padding: 0 },
        }}
        title={
          <Flex align="center" justify="space-between">
            <Text style={{ fontSize: 14, fontWeight: 500 }}>模型列表</Text>
            <Text style={{ fontSize: 12 }} type="secondary">
              已启用 {enabledCount}/{models.length}
            </Text>
          </Flex>
        }
      >
        <List
          dataSource={models}
          renderItem={(model) => {
            const isEnabled = isModelEnabled(model.modelId);

            return (
              <List.Item
                className="model-item"
                onClick={() => handleModelToggle(model, !isEnabled)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                }}
              >
                <List.Item.Meta
                  title={
                    <Flex align="center" gap={8}>
                      <Text
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: isEnabled ? "#1890ff" : undefined,
                        }}
                      >
                        {model.name}
                      </Text>
                      {model.thinking && (
                        <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>
                          推理
                        </Tag>
                      )}
                      {model.search && (
                        <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                          联网
                        </Tag>
                      )}
                    </Flex>
                  }
                />
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={isEnabled}
                    onChange={(checked) => handleModelToggle(model, checked)}
                    size="small"
                  />
                </div>
              </List.Item>
            );
          }}
          style={{
            maxHeight: 400,
            overflow: "auto",
          }}
        />
      </Card>
    </div>
  );
};

export default ProviderDetail;
