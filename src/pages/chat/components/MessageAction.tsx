import { Actions } from "@ant-design/x";
import { ActionItem } from "@ant-design/x/es/actions/interface";
import { message } from "antd";

import { actionItems } from "@/pages/chat/constants";

const MessageAction = ({ content }: { content: string }) => {
  const handleAction = (item: ActionItem, content: string) => {
    const { key } = item;
    switch (key) {
      case "copy":
        navigator.clipboard
          .writeText(content.replace(/<think>[\s\S]*?<\/think>/g, ""))
          .then(() => {
            message.success("复制成功");
          })
          .catch(() => {
            message.error("复制失败");
          });
        break;
    }
  };

  return (
    <Actions
      items={actionItems}
      onClick={(item) => handleAction(item, content)}
    />
  );
};

export default MessageAction;
