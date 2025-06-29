import {
  CheckCircleOutlined,
  LoadingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Card, Flex, Spin, Typography } from "antd";
import { useState } from "react";

import "./index.scss";

const { Text } = Typography;

interface ToolCallCardProps {
  toolName: string;
  status: "pending" | "success" | "error";
  result?: string;
  error?: string;
}

const ToolCallCard: React.FC<ToolCallCardProps> = ({
  toolName,
  status,
  result,
  error,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return (
          <Spin indicator={<LoadingOutlined spin style={{ fontSize: 14 }} />} />
        );
      case "success":
        return (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 14 }} />
        );
      case "error":
        return (
          <CheckCircleOutlined style={{ color: "#ff4d4f", fontSize: 14 }} />
        );
      default:
        return <ToolOutlined style={{ fontSize: 14 }} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "正在调用工具...";
      case "success":
        return "工具调用完成";
      case "error":
        return "工具调用失败";
      default:
        return "工具调用";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "#1890ff";
      case "success":
        return "#52c41a";
      case "error":
        return "#ff4d4f";
      default:
        return "#8c8c8c";
    }
  };

  return (
    <Card
      className={`tool-call-card ${status}`}
      size="small"
      style={{
        marginBottom: 8,
        borderColor: getStatusColor(),
        backgroundColor: status === "pending" ? "#f0f9ff" : undefined,
      }}
    >
      <Flex
        align="center"
        gap={20}
        justify="space-between"
        onClick={() => setExpanded(!expanded)}
      >
        <Flex align="center" justify="space-between">
          {getStatusIcon()}
          <Text strong style={{ marginLeft: 8, fontSize: 13 }}>
            {toolName}
          </Text>
          <Text style={{ marginLeft: 8, fontSize: 12 }} type="secondary">
            {getStatusText()}
          </Text>
        </Flex>
        {(result || error) && (
          <Text style={{ fontSize: 12, cursor: "pointer" }} type="secondary">
            {expanded ? "收起" : "展开"}
          </Text>
        )}
      </Flex>

      {expanded && (result || error) && (
        <div className="tool-call-result">
          <Text
            style={{
              fontSize: 12,
              fontFamily: "monospace",
              color: error ? "#ff4d4f" : "#262626",
            }}
          >
            {error || result}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ToolCallCard;
