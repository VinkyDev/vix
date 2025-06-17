import { CopyOutlined, UserOutlined } from "@ant-design/icons";
import { RolesType } from "@ant-design/x/es/bubble/BubbleList";

import MarkdownRender from "@/components/MarkdownRender";

import MessageAction from "./components/MessageAction";

export const actionItems = [
  {
    icon: <CopyOutlined />,
    key: "copy",
    label: "复制",
  },
];

export const roles: RolesType = {
  system: {
    messageRender: MarkdownRender,
    classNames: {
      avatar: "system-avatar",
      content: "system-content",
    },
  },
  assistant: {
    avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
    messageRender: MarkdownRender,
    placement: "start",
    footer: (content) => <MessageAction content={content} />,
  },
  user: {
    avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
    messageRender: MarkdownRender,
    placement: "end",
    footer: (content) => <MessageAction content={content} />,
  },
};
