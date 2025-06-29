import {
  ApiOutlined,
  BugOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Flex, Tag, Typography } from "antd";
import { FallbackProps } from "react-error-boundary";

import "./index.scss";

const { Text, Title } = Typography;

interface ErrorFallbackProps extends Partial<FallbackProps> {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo?: {
    type: "promise" | "window" | "component";
    source?: string;
  } | null;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  errorInfo,
}) => {
  const handleReload = () => {
    resetErrorBoundary();
    window.location.reload();
  };

  const getErrorTypeInfo = () => {
    switch (errorInfo?.type) {
      case "promise":
        return {
          icon: <ApiOutlined />,
          title: "网络请求出错",
          description: "网络请求或异步操作遇到错误，请检查网络连接后重试",
          tag: { color: "warning", text: "Promise Error" },
        };
      case "window":
        return {
          icon: <BugOutlined />,
          title: "JavaScript 运行错误",
          description: "代码执行过程中遇到错误，请重新加载应用",
          tag: { color: "error", text: "Runtime Error" },
        };
      case "component":
        return {
          icon: <ThunderboltOutlined />,
          title: "组件渲染错误",
          description: "页面组件渲染时发生错误，请尝试刷新页面",
          tag: { color: "processing", text: "Component Error" },
        };
      default:
        return {
          icon: <ExclamationCircleFilled />,
          title: "哎呀，出了点问题",
          description: "应用程序遇到了意外错误，请尝试重新加载",
          tag: { color: "default", text: "Unknown Error" },
        };
    }
  };

  const errorTypeInfo = getErrorTypeInfo();

  return (
    <div className="error-fallback">
      <Flex
        align="center"
        className="error-fallback-content"
        gap={24}
        justify="center"
        vertical
      >
        <div className="error-icon">{errorTypeInfo.icon}</div>

        <div className="error-info">
          <Flex
            align="center"
            gap={12}
            justify="center"
            style={{ marginBottom: 12 }}
          >
            <Title className="error-title" level={4} style={{ margin: 0 }}>
              {errorTypeInfo.title}
            </Title>
            <Tag color={errorTypeInfo.tag.color} style={{ margin: 0 }}>
              {errorTypeInfo.tag.text}
            </Tag>
          </Flex>
          <Text className="error-description" type="secondary">
            {errorTypeInfo.description}
          </Text>
        </div>

        <div className="error-details" title={error.message}>
          <Text className="error-message" type="danger">
            {error.message}
          </Text>
          {errorInfo?.source && (
            <Text
              className="error-source"
              style={{ fontSize: "12px", opacity: 0.7 }}
              type="secondary"
            >
              来源: {errorInfo.source}
            </Text>
          )}
        </div>

        <Flex gap={16}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReload}
            size="large"
            type="primary"
          >
            重新加载
          </Button>
          <Button onClick={resetErrorBoundary} size="large">
            重试
          </Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default ErrorFallback;
