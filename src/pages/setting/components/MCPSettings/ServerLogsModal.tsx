import { ClearOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, message, Modal } from "antd";
import React, { useEffect, useRef } from "react";

import { useMCPStore } from "@/store";

interface ServerLogsModalProps {
  visible: boolean;
  serverName: string;
  onCancel: () => void;
}

const ServerLogsModal: React.FC<ServerLogsModalProps> = ({
  visible,
  serverName,
  onCancel,
}) => {
  const { services, clearServiceLogs } = useMCPStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const service = services[serverName];

  useEffect(() => {
    // 自动滚动到底部
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
    <Modal
      footer={[
        <Button icon={<ClearOutlined />} key="clear" onClick={handleClearLogs}>
          清空日志
        </Button>,
        <Button
          icon={<DownloadOutlined />}
          key="download"
          onClick={handleDownloadLogs}
        >
          下载日志
        </Button>,
        <Button key="close" onClick={onCancel} type="primary">
          关闭
        </Button>,
      ]}
      onCancel={onCancel}
      open={visible}
      style={{ top: 20 }}
      title={`服务日志: ${serverName}`}
      width={800}
    >
      <div className="log-viewer" ref={logContainerRef}>
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
    </Modal>
  );
};

export default ServerLogsModal;
