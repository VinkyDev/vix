import { NodeIndexOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useMemo } from "react";

import "./index.scss";

import { useModelStore } from "@/store/model";

export interface ActionBarItem {
  className?: string;
  key: string;
  label: string;
  onClick: () => void;
  show: boolean;
}

const ActionBar = () => {
  const { model, setUseThinking, useThinking } = useModelStore();

  const actionItems = useMemo<ActionBarItem[]>(() => {
    return [
      {
        className: useThinking ? "action-bar-active" : "",
        key: "thinking",
        label: "深度思考",
        onClick: () => setUseThinking(!useThinking),
        show: model.thinking,
      },
    ];
  }, [useThinking, model.thinking, setUseThinking]);

  return (
    <Flex gap="small">
      {actionItems.map(
        (action) =>
          action.show && (
            <Button
              className={action.className}
              icon={<NodeIndexOutlined />}
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
