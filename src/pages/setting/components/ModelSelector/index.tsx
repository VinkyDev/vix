import { CheckOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Card, Flex, Tag, Typography } from "antd";
import React from "react";

import { type Model, MODEL_LIST, useModelStore } from "@/store/model";

import "./index.scss";

const { Text, Title } = Typography;

interface ModelSelectorProps {
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ className }) => {
  const { model, setModel } = useModelStore();

  const handleModelSelect = (selectedModel: Model) => {
    setModel(selectedModel);
  };

  return (
    <div className={`model-selector ${className || ""}`}>
      <div className="model-selector-header">
        <Title level={4} style={{ margin: 0 }}>
          模型选择
        </Title>
        <Text type="secondary">选择您偏好的AI模型</Text>
      </div>

      <div className="model-list">
        {MODEL_LIST.map((item) => (
          <Card
            className={`model-card ${model.id === item.id ? "selected" : ""}`}
            hoverable
            key={item.id}
            onClick={() => handleModelSelect(item)}
            size="small"
          >
            <Flex align="center" justify="space-between">
              <div className="model-info">
                <Flex align="center" gap={8}>
                  <Text strong>{item.name}</Text>
                  {item.thinking && (
                    <Tag
                      color="blue"
                      icon={<ThunderboltOutlined />}
                      style={{ margin: 0 }}
                    >
                      推理
                    </Tag>
                  )}
                </Flex>
                <Text className="model-description" type="secondary">
                  {item.description}
                </Text>
              </div>
              {model.id === item.id && (
                <CheckOutlined className="selected-icon" />
              )}
            </Flex>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;
