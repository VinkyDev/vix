import { Empty, Flex, Spin, Typography } from "antd";
import { groupBy } from "lodash-es";
import { motion } from "motion/react";
import React from "react";

import { type Model, useModelStore } from "@/store";

import ProviderCard from "../ProviderCard";

const { Text } = Typography;

const ModelSelector: React.FC = () => {
  const { getCurrentModel, modelList, setCurrentModelId, loading } =
    useModelStore();
  const modelsByProvider = groupBy(modelList, "providerId");

  const handleModelSelect = (selectedModel: Model) => {
    setCurrentModelId(selectedModel.modelId);
  };

  if (loading) {
    return (
      <Flex
        align="center"
        className="model-selector-loading"
        justify="center"
        vertical
      >
        <Spin size="large" />
        <Text style={{ marginTop: 16 }} type="secondary">
          正在加载模型列表...
        </Text>
      </Flex>
    );
  }

  if (!modelList.length) {
    return (
      <Flex justify="center">
        <Empty
          description="暂无可用模型"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Flex>
    );
  }

  return (
    <Flex vertical>
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
    </Flex>
  );
};

export default ModelSelector;
