import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, List, Tooltip, Typography } from "antd";
import { motion } from "motion/react";
import React from "react";

import { useDesignToken } from "@/hooks";
import { useApiKeyStore } from "@/store/apiKeyStore";
import { type Model } from "@/store/modelStore";

import "./ProviderList.scss";

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
  const token = useDesignToken();

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
        className="collapse-toggle-btn"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapsedChange(!collapsed)}
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
              className="motion-item"
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
                    <div className="tooltip-content">
                      <div className="provider-name">{item.providerInfo.providerName}</div>
                      {item.providerInfo.providerTags && (
                        <div className="provider-tags-tooltip">
                          {item.providerInfo.providerTags.join(", ")}
                        </div>
                      )}
                    </div>
                  }
                >
                  <div
                    className={`provider-item-collapsed ${isSelected ? "selected" : ""}`}
                    onClick={() => onProviderSelect(item.providerId)}
                  >
                    <Avatar 
                      className="avatar-collapsed"
                      size={token.fontSize * 1.5} 
                      src={item.providerInfo.icon} 
                    />
                  </div>
                </Tooltip>
              ) : (
                <List.Item
                  className={`provider-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onProviderSelect(item.providerId)}
                >
                  <Flex align="center" gap={token.marginXS}>
                    <Avatar size={token.controlHeight} src={item.providerInfo.icon} />
                    <Flex className="provider-info" gap={token.marginXXS} vertical>
                      <Title className="provider-title" level={5}>
                        {item.providerInfo.providerName}
                      </Title>
                      {item.providerInfo.providerTags && (
                        <Text className="provider-tags">
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
      />
    </div>
  );
};

export default ProviderList;
