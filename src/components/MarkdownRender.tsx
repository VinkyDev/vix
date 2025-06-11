import type { BubbleProps } from "@ant-design/x";

import { Typography } from "antd";
import markdownit from "markdown-it";

const md = markdownit({ breaks: true, html: true });

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  return (
    <Typography.Paragraph>
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography.Paragraph>
  );
};

export default renderMarkdown;
