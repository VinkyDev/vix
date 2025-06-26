import { Avatar, List, Typography } from "antd";
import { motion } from "motion/react";
import React from "react";

import { useApiKeyStore } from "@/store/apiKeyStore";
import { type Model } from "@/store/modelStore";

const { Text } = Typography;

interface ProviderListProps {
  providers: string[];
  modelsByProvider: Record<string, Model[]>;
  selectedProviderId: string;
  onProviderSelect: (providerId: string) => void;
}

const ProviderList: React.FC<ProviderListProps> = ({
  providers,
  modelsByProvider,
  selectedProviderId,
  onProviderSelect,
}) => {
  const { getApiKey } = useApiKeyStore();

  const listData = providers.map((providerId) => {
    const providerModels = modelsByProvider[providerId];
    const providerInfo = providerModels[0];
    const hasApiKey = !!getApiKey(providerId);

    return {
      providerId,
      providerInfo,
      hasApiKey,
    };
  });

  return (
    <List
      className="provider-list-content"
      dataSource={listData}
      renderItem={(item, index) => {
        const isSelected = selectedProviderId === item.providerId;

        return (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            transition={{
              duration: 0.2,
              delay: index * 0.05,
            }}
          >
            <List.Item
              className={`provider-item ${isSelected ? "selected" : ""}`}
              onClick={() => onProviderSelect(item.providerId)}
              style={{
                cursor: "pointer",
                padding: "12px 16px",
                marginBottom: 8,
                borderRadius: 8,
                border: isSelected
                  ? "1px solid #1890ff"
                  : "1px solid transparent",
                background: isSelected ? "#f0f8ff" : "transparent",
                transition: "all 0.2s ease",
              }}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.providerInfo.icon} />}
                title={
                  <Text
                    className="provider-name"
                    style={{
                      fontSize: 14,
                      color: isSelected ? "#1890ff" : undefined,
                      fontWeight: isSelected ? 500 : 400,
                    }}
                  >
                    {item.providerInfo.providerName}
                  </Text>
                }
              />
            </List.Item>
          </motion.div>
        );
      }}
      size="small"
      style={{
        height: "100%",
        overflow: "auto",
        background: "transparent",
      }}
    />
  );
};

export default ProviderList;
