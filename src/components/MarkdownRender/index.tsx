import type { BubbleProps } from "@ant-design/x";

import { Typography } from "antd";
import markdownit from "markdown-it";
import container from "markdown-it-container";
import { Token } from "markdown-it/index.js";

import "./index.scss";

const md = markdownit({ breaks: true, html: true }).use(container, "think", {
  render(tokens: Token[], idx: number) {
    const token = tokens[idx];
    if (token.nesting === 1) {
      return `<div class="think">\n`;
    } else {
      return `</div>\n`;
    }
  },
});

const preprocessContent = (content: string) => {
  return content
    .replace(/<think>/g, ":::think\n")
    .replace(/<\/think>/g, "\n:::\n");
};

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  const parsedContent = preprocessContent(content);

  return (
    <Typography>
      <div
        dangerouslySetInnerHTML={{
          __html: md.render(parsedContent),
        }}
      />
    </Typography>
  );
};

export default renderMarkdown;
