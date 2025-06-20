import { BulbOutlined, LinkOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import "./index.scss";

import { useModelStore, useUserSettingsStore } from "@/store";

export interface ActionBarItem {
  className?: string;
  icon?: React.ReactNode;
  key: string;
  label?: string;
  onClick?: () => void;
  show?: boolean;
}

const ActionBar = ({
  attachmentsOpen,
  setAttachmentsOpen,
}: {
  attachmentsOpen: boolean;
  setAttachmentsOpen: (open: boolean) => void;
}) => {
  const { getCurrentModel } = useModelStore();
  const { setUseThinking, useThinking } = useUserSettingsStore();
  const navigate = useNavigate();

  const actionItems = useMemo<ActionBarItem[]>(() => {
    return [
      {
        icon: <SettingOutlined />,
        key: "setting",
        onClick: () => {
          navigate("/setting");
        },
      },
      {
        icon: <LinkOutlined />,
        key: "file",
        onClick: () => {
          setAttachmentsOpen(!attachmentsOpen);
        },
      },
      {
        className: useThinking ? "thinking-active" : "thinking",
        icon: <BulbOutlined />,
        key: "thinking",
        label: "推理",
        onClick: () => setUseThinking(!useThinking),
        show: getCurrentModel().thinking || false,
      },
    ];
  }, [
    useThinking,
    getCurrentModel,
    setUseThinking,
    attachmentsOpen,
    setAttachmentsOpen,
    navigate,
  ]);

  return (
    <Flex gap="small">
      {actionItems.map(
        (action) =>
          (action.show ?? true) && (
            <Button
              className={action.className}
              icon={action.icon}
              key={action.key}
              onClick={action.onClick}
            >
              {action?.label}
            </Button>
          )
      )}
    </Flex>
  );
};

export default ActionBar;
