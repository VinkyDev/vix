import type { BubbleProps } from "@ant-design/x";

import { Typography } from "antd";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import container from "markdown-it-container";
import { Token } from "markdown-it/index.js";

import "./index.scss";
import "highlight.js/styles/github.css";

const md = markdownit({ breaks: true, html: true })
  .use(container, "think", {
    render(tokens: Token[], idx: number) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="think">\n`;
      } else {
        return `</div>\n`;
      }
    },
  })
  .use(container, "divider", {
    render(tokens: Token[], idx: number) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="divider">\n`;
      } else {
        return `</div>\n`;
      }
    },
  })
  .use((md) => {
    md.options.highlight = (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`;
      }

      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    };
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
