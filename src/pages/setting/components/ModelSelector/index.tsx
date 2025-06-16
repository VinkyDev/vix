import { RobotOutlined } from "@ant-design/icons";
import { Empty, Spin, Typography } from "antd";
import { groupBy } from "lodash-es";
import { motion } from "motion/react";
import React from "react";

import { type Model, useModelStore } from "@/store";

import ProviderCard from "../ProviderCard";
import "./index.scss";

const { Text, Title } = Typography;

const ModelSelector: React.FC = () => {
  const { getCurrentModel, modelList, setCurrentModelId, loading } =
    useModelStore();
  const modelsByProvider = groupBy(modelList, "providerId");

  const handleModelSelect = (selectedModel: Model) => {
    setCurrentModelId(selectedModel.modelId);
  };

  if (loading) {
    return (
      <div className="model-selector-loading">
        <Spin size="large" />
        <Text style={{ marginTop: 16 }} type="secondary">
          正在加载模型列表...
        </Text>
      </div>
    );
  }

  if (!modelList.length) {
    return (
      <div className="model-selector-empty">
        <Empty
          description="暂无可用模型"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="model-selector">
      <Title className="section-title" level={5}>
        <RobotOutlined />
        模型配置
      </Title>
      <div className="providers-container">
        {Object.entries(modelsByProvider).map(
          ([providerId, providerModels], index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              key={providerId}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <ProviderCard
                currentModelId={getCurrentModel().modelId}
                models={providerModels}
                onModelSelect={handleModelSelect}
                providerId={providerId}
              />
            </motion.div>
          )
        )}
      </div>

      <motion.div
        animate={{ opacity: 1 }}
        className="model-selector-footer"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Text className="footer-text" type="secondary">
          <RobotOutlined style={{ marginRight: 4 }} />
          当前选择: <Text strong>{getCurrentModel().name}</Text>
        </Text>
      </motion.div>
    </div>
  );
};

export default ModelSelector;
