import { LinkOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useMemo } from "react";

import "./index.scss";

import { useModelStore } from "@/store/model";

export interface ActionBarItem {
  className?: string;
  icon?: React.ReactNode;
  key: string;
  label: string;
  onClick: () => void;
  show: boolean;
}

const ActionBar = ({
  attachmentsOpen,
  setAttachmentsOpen,
}: {
  attachmentsOpen: boolean;
  setAttachmentsOpen: (open: boolean) => void;
}) => {
  const { model, setUseThinking, useThinking } = useModelStore();

  const actionItems = useMemo<ActionBarItem[]>(() => {
    return [
      {
        className: "",
        icon: <LinkOutlined />,
        key: "file",
        label: "",
        onClick: () => {
          setAttachmentsOpen(!attachmentsOpen);
        },
        show: true,
      },
      {
        className: useThinking ? "action-bar-active" : "",
        icon: <NodeIndexOutlined />,
        key: "thinking",
        label: "深度思考",
        onClick: () => setUseThinking(!useThinking),
        show: model.thinking,
      },
    ];
  }, [
    useThinking,
    model.thinking,
    setUseThinking,
    attachmentsOpen,
    setAttachmentsOpen,
  ]);

  return (
    <Flex gap="small">
      {actionItems.map(
        (action) =>
          action.show && (
            <Button
              className={action.className}
              icon={action.icon}
              key={action.key}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )
      )}
    </Flex>
  );
};

export default ActionBar;
