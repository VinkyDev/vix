import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { App, Button, Drawer, Flex, Input, List, Modal } from "antd";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMessageStore } from "@/store";

import "./index.scss";

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
        styles={{
          body: { padding: 0 },
        }}
        width={300}
      >
        <Flex className="drawer-container" vertical>
          <Flex
            align="center"
            className="header"
            justify="space-between"
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

          <Flex className="content">
            {conversationItems.length > 0 ? (
              <List
                className="conversation-list"
                dataSource={conversationItems}
                renderItem={(item) => (
                  <List.Item
                    className={clsx(
                      "conversation-item",
                      item.id === currentConversationId && "active"
                    )}
                    onClick={() => handleSwitchConversation(item.id)}
                  >
                    <Flex
                      align="center"
                      className={clsx(
                        "conversation-content",
                        item.id === currentConversationId && "active"
                      )}
                      justify="space-between"
                    >
                      <div className="conversation-title">
                        {item.title}
                      </div>
                      <Flex className="conversation-actions" gap={4}>
                        <Button
                          className="action-btn"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(item.id, item.title);
                          }}
                          size="small"
                          type="text"
                        />
                        <Button
                          className="action-btn"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.title);
                          }}
                          size="small"
                          type="text"
                        />
                      </Flex>
                    </Flex>
                  </List.Item>
                )}
              />
            ) : (
              <Flex
                align="center"
                className="empty-state"
                justify="center"
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