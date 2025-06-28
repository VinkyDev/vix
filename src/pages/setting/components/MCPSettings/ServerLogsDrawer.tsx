import { ClearOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Drawer, message, Space, Typography } from "antd";
import React, { useEffect, useRef } from "react";

import { useMCPStore } from "@/store";

const { Title } = Typography;

interface ServerLogsDrawerProps {
  visible: boolean;
  serverName: string;
  onClose: () => void;
}

const ServerLogsDrawer: React.FC<ServerLogsDrawerProps> = ({
  visible,
  serverName,
  onClose,
}) => {
  const { services, clearServiceLogs } = useMCPStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const service = services[serverName];

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [service?.logs]);

  const handleClearLogs = () => {
    clearServiceLogs(serverName);
    message.success("日志已清空");
  };

  const handleDownloadLogs = () => {
    if (!service?.logs || service.logs.length === 0) {
      message.warning("暂无日志内容");
      return;
    }

    const logContent = service.logs.join("\n");
    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${serverName}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("日志已下载");
  };

  const renderLogLine = (log: string, index: number) => {
    let className = "log-line";

    if (log.includes("[STDOUT]")) {
      className += " log-stdout";
    } else if (log.includes("[STDERR]")) {
      className += " log-stderr";
    } else if (log.includes("[ERROR]")) {
      className += " log-error";
    } else if (
      log.includes("Starting") ||
      log.includes("started") ||
      log.includes("Server")
    ) {
      className += " log-info";
    }

    return (
      <div className={className} key={index}>
        {log}
      </div>
    );
  };

  if (!service) {
    return null;
  }

  return (
    <Drawer
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button icon={<ClearOutlined />} onClick={handleClearLogs}>
              清空日志
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadLogs}>
              下载日志
            </Button>
            <Button onClick={onClose} type="primary">
              关闭
            </Button>
          </Space>
        </div>
      }
      onClose={onClose}
      open={visible}
      placement="right"
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            服务日志: {serverName}
          </Title>
        </Space>
      }
      width="80%"
    >
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          className="log-viewer"
          ref={logContainerRef}
          style={{
            height: "100%",
            background: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: "8px",
            padding: "16px",
            fontFamily:
              "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
            fontSize: "13px",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            overflowY: "auto",
          }}
        >
          {service.logs.length === 0 ? (
            <div
              className="log-line"
              style={{ color: "#888", fontStyle: "italic" }}
            >
              暂无日志输出
            </div>
          ) : (
            service.logs.map(renderLogLine)
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ServerLogsDrawer;
