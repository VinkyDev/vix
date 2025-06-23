import {
  BulbOutlined,
  EditOutlined,
  // LinkOutlined,
  SettingOutlined,
  ToolOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Flex } from "antd";

import "./index.scss";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useModelStore, useUserSettingsStore } from "@/store";

export interface ActionBarItem {
  className?: string;
  icon?: React.ReactNode;
  key: string;
  label?: string;
  onClick?: () => void;
  show?: boolean;
  render?: () => React.ReactNode;
}

const ActionBar = () => {
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
      // {
      //   icon: <LinkOutlined />,
      //   key: "file",
      //   onClick: () => {},
      // },
      {
        className: useThinking ? "thinking-active" : "thinking",
        icon: <BulbOutlined />,
        key: "thinking",
        label: "推理",
        onClick: () => setUseThinking(!useThinking),
        show: getCurrentModel().thinking || false,
      },
      {
        key: "skills",
        render: () => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "translate",
                    label: "翻译",
                    icon: <TranslationOutlined />,
                    onClick: async () => {},
                  },
                  {
                    key: "write",
                    label: "写作",
                    icon: <EditOutlined />,
                  },
                ],
              }}
            >
              <Button className="skill" icon={<ToolOutlined />}>
                技能
              </Button>
            </Dropdown>
          );
        },
      },
    ];
  }, [useThinking, getCurrentModel, setUseThinking, navigate]);

  return (
    <Flex gap="small">
      {actionItems.map((action) =>
        (action.show ?? true) && action.render ? (
          action.render()
        ) : (
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
