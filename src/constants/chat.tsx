import { CopyOutlined, UserOutlined } from "@ant-design/icons";
import { Bubble } from "@ant-design/x";
import { GetProp } from "antd";

import MarkdownRender from "@/components/MarkdownRender";

export const actionItems = [
  {
    icon: <CopyOutlined />,
    key: "copy",
    label: "复制",
  },
];

export const roles: GetProp<typeof Bubble.List, "roles"> = {
  assistant: {
    avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
    messageRender: MarkdownRender,
    placement: "start",
  },
  user: {
    avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
    messageRender: MarkdownRender,
    placement: "end",
  },
};
