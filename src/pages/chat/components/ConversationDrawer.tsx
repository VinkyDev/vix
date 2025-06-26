import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { App, Button, Drawer, Flex, Input, List, Modal } from "antd";
import { Fragment, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMessageStore } from "@/store";
export const ConversationDrawer = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { message, modal } = App.useApp();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameId, setRenameId] = useState<string>("");
  const [renameTitle, setRenameTitle] = useState("");

  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    renameConversation,
    switchConversation,
  } = useMessageStore(
    useShallow((state) => ({
      conversations: state.conversations,
      currentConversationId: state.currentConversationId,
      createConversation: state.createConversation,
      deleteConversation: state.deleteConversation,
      renameConversation: state.renameConversation,
      switchConversation: state.switchConversation,
    }))
  );

  const conversationItems = Object.values(conversations).sort((a, b) => {
    const timeA = a.messages.length > 0 ? a.updatedAt : a.createdAt;
    const timeB = b.messages.length > 0 ? b.updatedAt : b.createdAt;
    return timeB - timeA;
  });

  const handleCreateConversation = () => {
    createConversation();
    message.success("已创建新对话");
    setOpen(false);
  };

  const handleRename = (id: string, currentTitle: string) => {
    setRenameId(id);
    setRenameTitle(currentTitle);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = () => {
    if (renameTitle.trim()) {
      renameConversation(renameId, renameTitle.trim());
      message.success("重命名成功");
      setRenameModalOpen(false);
      setRenameId("");
      setRenameTitle("");
    }
  };

  const handleRenameCancel = () => {
    setRenameModalOpen(false);
    setRenameId("");
    setRenameTitle("");
  };

  const handleDelete = (id: string, title: string) => {
    modal.confirm({
      centered: true,
      title: "确认删除",
      content: `确定要删除对话 "${title}" 吗？此操作不可撤销。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      autoFocusButton: null,
      onOk: () => {
        deleteConversation(id);
        message.success("对话已删除");
      },
    });
  };

  const handleSwitchConversation = (id: string) => {
    if (id !== currentConversationId) {
      switchConversation(id);
      setOpen(false);
    }
  };

  return (
    <Fragment>
      <Drawer
        autoFocus
        className="conversation-drawer"
        closeIcon={false}
        mask={false}
        open={open}
        placement="left"
        rootStyle={{
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
          overflow: "hidden",
        }}
        styles={{
          body: { padding: 0 },
        }}
        width={300}
      >
        <Flex style={{ height: "100%" }} vertical>
          <Flex
            align="center"
            justify="space-between"
            style={{
              padding: "10px 20px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Button
              icon={<PlusOutlined />}
              onClick={handleCreateConversation}
              type="text"
            >
              新建对话
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
              shape="circle"
              type="text"
            />
          </Flex>

          <Flex style={{ flex: 1, padding: "0 20px 20px", overflow: "auto" }}>
            {conversationItems.length > 0 ? (
              <List
                dataSource={conversationItems}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => handleSwitchConversation(item.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      margin: "4px 0",
                      backgroundColor:
                        item.id === currentConversationId
                          ? "#e6f4ff"
                          : "transparent",
                      border:
                        item.id === currentConversationId
                          ? "1px solid #91caff"
                          : "1px solid transparent",
                    }}
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "14px",
                          color:
                            item.id === currentConversationId
                              ? "#1677ff"
                              : "#262626",
                        }}
                      >
                        {item.title}
                      </div>
                      <Flex gap={4}>
                        <Button
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(item.id, item.title);
                          }}
                          size="small"
                          style={{
                            opacity: 0.6,
                            fontSize: "12px",
                          }}
                          type="text"
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.title);
                          }}
                          size="small"
                          style={{
                            opacity: 0.6,
                            fontSize: "12px",
                          }}
                          type="text"
                        />
                      </Flex>
                    </Flex>
                  </List.Item>
                )}
                style={{ width: "100%" }}
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{
                  height: "200px",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                暂无对话
              </Flex>
            )}
          </Flex>
        </Flex>
      </Drawer>

      <Modal
        cancelText="取消"
        centered
        okText="确认"
        onCancel={handleRenameCancel}
        onOk={handleRenameSubmit}
        open={renameModalOpen}
        title="重命名对话"
      >
        <Input
          autoFocus
          onChange={(e) => setRenameTitle(e.target.value)}
          onPressEnter={handleRenameSubmit}
          placeholder="请输入对话标题"
          value={renameTitle}
        />
      </Modal>
    </Fragment>
  );
};
