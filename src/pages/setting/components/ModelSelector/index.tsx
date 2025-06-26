import { Empty, Flex, Layout, Spin, Typography } from "antd";
import { groupBy } from "lodash-es";
import { motion } from "motion/react";
import React, { useState } from "react";

import { useModelStore } from "@/store";

import ProviderDetail from "./ProviderDetail";
import ProviderList from "./ProviderList";
import "./index.scss";

const { Text } = Typography;
const { Sider, Content } = Layout;

const ModelSelector: React.FC = () => {
  const { modelList, loading } = useModelStore();
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const modelsByProvider = groupBy(modelList, "providerId");
  const providers = Object.keys(modelsByProvider);

  // 初始化时选择第一个供应商
  React.useEffect(() => {
    if (providers.length > 0 && !selectedProviderId) {
      setSelectedProviderId(providers[0]);
    }
  }, [providers, selectedProviderId]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
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

  const selectedProviderModels = selectedProviderId
    ? modelsByProvider[selectedProviderId]
    : [];

  return (
    <div className="model-selector-container">
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Layout
          className="model-selector-layout"
          style={{
            height: "100%",
            background: "transparent",
            gap: 24,
          }}
        >
          {/* 左侧供应商列表 */}
          <Sider
            className="provider-sidebar"
            style={{
              background: "transparent",
              borderRadius: 8,
              overflow: "hidden",
            }}
            width={160}
          >
            <ProviderList
              modelsByProvider={modelsByProvider}
              onProviderSelect={handleProviderSelect}
              providers={providers}
              selectedProviderId={selectedProviderId}
            />
          </Sider>

          {/* 右侧供应商详情 */}
          <Content className="provider-content">
            {selectedProviderId && selectedProviderModels.length > 0 && (
              <ProviderDetail
                models={selectedProviderModels}
                providerId={selectedProviderId}
              />
            )}
          </Content>
        </Layout>
      </motion.div>
    </div>
  );
};

export default ModelSelector;
