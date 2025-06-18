import { CopyOutlined } from "@ant-design/icons";
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
      content: "system-content",
    },
  },
  assistant: {
    messageRender: MarkdownRender,
    placement: "start",
    classNames: {
      content: "assistant-content",
    },
    footer: (content) => <MessageAction content={content} />,
  },
  user: {
    messageRender: MarkdownRender,
    placement: "end",
    classNames: {
      content: "user-content",
    },
    footer: (content) => <MessageAction content={content} />,
  },
};
