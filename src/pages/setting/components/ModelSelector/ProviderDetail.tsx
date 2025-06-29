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
import React, { useEffect, useState } from "react";

import { useDesignToken } from "@/hooks";
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
  const token = useDesignToken();

  const currentApiKey = getApiKey(providerId);
  const providerInfo = models[0];

  useEffect(() => {
    setTempApiKey(currentApiKey || "");
  }, [currentApiKey, providerInfo.getApiKeyUrl]);

  const handleSaveApiKey = () => {
    if (tempApiKey !== currentApiKey) {
      setApiKey(providerId, tempApiKey);
      if (tempApiKey) {
        message.success("API Key 已保存");
      }
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempApiKey(value);
  };

  const handleOpenApiKeyUrl = () => {
    if (providerInfo.getApiKeyUrl) {
      open(providerInfo.getApiKeyUrl);
    }
  };

  const handleModelToggle = (model: Model, enabled: boolean) => {
    toggleModel(model.modelId, enabled);
  };

  const enabledCount = models.filter((m) => isModelEnabled(m.modelId)).length;

  return (
    <div className="provider-detail">
      <Flex align="center" className="provider-header" justify="space-between">
        <Title level={4} style={{ margin: 0, fontSize: token.fontSizeLG }}>
          {providerInfo.providerName}
        </Title>
        <Tag color={currentApiKey ? "success" : "warning"}>
          {currentApiKey ? "已配置" : "未配置"}
        </Tag>
      </Flex>

      <Card
        className="api-section"
        size="small"
        styles={{
          header: {
            padding: `${token.paddingSM}px ${token.padding}px`,
            minHeight: "auto",
          },
          body: { padding: `${token.paddingSM}px ${token.padding}px` },
        }}
        title={
          <Flex align="center" gap={token.marginXS}>
            <Text style={{ fontSize: token.fontSize, fontWeight: 500 }}>
              API Key
            </Text>
            {providerInfo.getApiKeyUrl && (
              <Button
                icon={<LinkOutlined style={{ fontSize: token.fontSizeSM }} />}
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
          onBlur={handleSaveApiKey}
          onChange={handleApiKeyChange}
          placeholder="请输入API Key"
          style={{ fontSize: token.fontSizeSM }}
          value={tempApiKey}
        />
      </Card>

      <Card
        className="models-section"
        size="small"
        styles={{
          header: {
            padding: `${token.paddingSM}px ${token.padding}px`,
            minHeight: "auto",
          },
          body: { padding: 0 },
        }}
        title={
          <Flex align="center" justify="space-between">
            <Text style={{ fontSize: token.fontSize, fontWeight: 500 }}>
              模型列表
            </Text>
            <Text style={{ fontSize: token.fontSizeSM }} type="secondary">
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
                  padding: `${token.paddingSM}px ${token.padding}px`,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  cursor: "pointer",
                }}
              >
                <List.Item.Meta
                  description={
                    <Text
                      style={{ fontSize: token.fontSizeSM }}
                      type="secondary"
                    >
                      {model.description}
                    </Text>
                  }
                  title={
                    <Flex align="center" gap={token.marginXS}>
                      <Text
                        style={{
                          fontFamily: "monospace",
                          fontSize: token.fontSize,
                          color: isEnabled ? token.colorPrimary : undefined,
                        }}
                      >
                        {model.name}
                      </Text>
                      {model.thinking && <Tag color="purple">推理</Tag>}
                      {model.search && <Tag color="cyan">联网</Tag>}
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
            maxHeight: token.controlHeightLG * 10,
            overflow: "auto",
          }}
        />
      </Card>
    </div>
  );
};

export default ProviderDetail;
