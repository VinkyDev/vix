import { CloudUploadOutlined } from "@ant-design/icons";
import { Attachments, Sender } from "@ant-design/x";
import { Attachment } from "@ant-design/x/es/attachments";
import { GetRef, message, Upload } from "antd";
import React from "react";

import { isFileTypeSupported, processFile } from "@/utils/file";

interface AttachmentHeaderProps {
  attachmentItems: Attachment[];
  attachmentsOpen: boolean;
  attachmentsRef: React.RefObject<GetRef<typeof Attachments>>;
  fileContents: Record<string, string>;
  senderRef: React.RefObject<GetRef<typeof Sender>>;
  setAttachmentItems: (items: Attachment[]) => void;
  setAttachmentsOpen: (open: boolean) => void;
  setFileContents: (contents: Record<string, string>) => void;
}

const AttachmentHeader: React.FC<AttachmentHeaderProps> = ({
  attachmentItems,
  attachmentsOpen,
  attachmentsRef,
  fileContents,
  senderRef,
  setAttachmentItems,
  setAttachmentsOpen,
  setFileContents,
}) => {
  return (
    <Sender.Header
      forceRender
      onOpenChange={setAttachmentsOpen}
      open={attachmentsOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
      title="附件"
    >
      <Attachments
        accept=".txt,.md,.docx,.xls,.xlsx,.csv,.json"
        beforeUpload={(file) => {
          if (!isFileTypeSupported(file)) {
            message.error("不支持的文件类型");
            return Upload.LIST_IGNORE;
          }
          return false;
        }}
        getDropContainer={() => senderRef.current?.nativeElement}
        items={attachmentItems}
        onChange={async ({ fileList }) => {
          setAttachmentItems(fileList);

          // 处理新上传的文件
          const newFileContents = { ...fileContents };

          for (const item of fileList) {
            if (item.originFileObj && !newFileContents[item.uid]) {
              try {
                const result = await processFile(item.originFileObj);
                if (result.success) {
                  newFileContents[item.uid] = result.content;
                  message.success(`文件 ${result.fileName} 上传成功`);
                } else {
                  message.error(
                    `文件 ${result.fileName} 上传失败: ${result.error}`
                  );
                }
              } catch (error) {
                message.error(`文件 ${item.name} 上传失败: ${error}`);
              }
            }
          }

          // 清理已删除文件的内容
          const currentUids = fileList.map((item) => item.uid);
          Object.keys(newFileContents).forEach((uid) => {
            if (!currentUids.includes(uid)) {
              delete newFileContents[uid];
            }
          });

          setFileContents(newFileContents);
        }}
        placeholder={{
          description: "支持 txt、md、docx、xls、xlsx、csv、json 文件",
          icon: <CloudUploadOutlined />,
          title: "点击或拖拽文件到此区域",
        }}
        ref={attachmentsRef}
      />
    </Sender.Header>
  );
};

export default AttachmentHeader;
