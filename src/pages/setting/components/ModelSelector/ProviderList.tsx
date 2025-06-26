import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, List, Tooltip, Typography } from "antd";
import { motion } from "motion/react";
import React from "react";

import { useApiKeyStore } from "@/store/apiKeyStore";
import { type Model } from "@/store/modelStore";

const { Text, Title } = Typography;

interface ProviderListProps {
  providers: string[];
  modelsByProvider: Record<string, Model[]>;
  selectedProviderId: string;
  collapsed: boolean;
  onProviderSelect: (providerId: string) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

const ProviderList: React.FC<ProviderListProps> = ({
  providers,
  modelsByProvider,
  selectedProviderId,
  collapsed,
  onProviderSelect,
  onCollapsedChange,
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
    <div className="provider-list-container">
      <Button
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapsedChange(!collapsed)}
        style={{
          width: "100%",
          marginBottom: 8,
          height: 32,
        }}
        type="text"
      >
        {!collapsed && "收起"}
      </Button>

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
              {collapsed ? (
                <Tooltip
                  placement="right"
                  title={
                    <div>
                      <div>{item.providerInfo.providerName}</div>
                      {item.providerInfo.providerTags && (
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                          {item.providerInfo.providerTags.join(", ")}
                        </div>
                      )}
                    </div>
                  }
                >
                  <div
                    className={`provider-item-collapsed ${isSelected ? "selected" : ""}`}
                    onClick={() => onProviderSelect(item.providerId)}
                    style={{
                      cursor: "pointer",
                      padding: "8px",
                      marginBottom: 8,
                      borderRadius: 8,
                      border: isSelected
                        ? "2px solid #1890ff"
                        : "2px solid transparent",
                      background: isSelected ? "#f0f8ff" : "transparent",
                      transition: "all 0.2s ease",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar size={24} src={item.providerInfo.icon} />
                  </div>
                </Tooltip>
              ) : (
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
                  <Flex align="center" gap={8}>
                    <Avatar size={32} src={item.providerInfo.icon} />
                    <Flex gap={4} vertical>
                      <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                        {item.providerInfo.providerName}
                      </Title>
                      {item.providerInfo.providerTags && (
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          {item.providerInfo.providerTags.join(", ")}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </List.Item>
              )}
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
    </div>
  );
};

export default ProviderList;
