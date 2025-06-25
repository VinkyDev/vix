import type { BubbleProps } from "@ant-design/x";

import { Typography } from "antd";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import container from "markdown-it-container";
import { Token } from "markdown-it/index.js";

import "./index.scss";
import "highlight.js/styles/github.css";

const containerConfigs = [
  {
    name: "think",
    className: "think",
    openTag: "<think>",
    closeTag: "</think>",
  },
  {
    name: "divider",
    className: "divider",
    openTag: "<divider>",
    closeTag: "</divider>",
  },
];

const md = markdownit({ breaks: true, html: true });

containerConfigs.forEach((config) => {
  md.use(container, config.name, {
    render(tokens: Token[], idx: number) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="${config.className}">\n`;
      } else {
        return `</div>\n`;
      }
    },
  });
});

md.use((md) => {
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
  let processedContent = content;

  containerConfigs.forEach((config) => {
    if (config.openTag && config.closeTag) {
      const openRegex = new RegExp(
        config.openTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g"
      );
      const closeRegex = new RegExp(
        config.closeTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g"
      );

      processedContent = processedContent
        .replace(openRegex, `:::${config.name}\n`)
        .replace(closeRegex, `\n:::\n`);
    }
  });

  return processedContent;
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
