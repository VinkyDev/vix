import type { BubbleProps } from "@ant-design/x";

import { Typography } from "antd";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import container from "markdown-it-container";
import { Token } from "markdown-it/index.js";
import { createRoot } from "react-dom/client";

import ToolCallCard from "../ToolCallCard";
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
  {
    name: "toolcall",
    className: "toolcall",
    openTag: "<toolcall>",
    closeTag: "</toolcall>",
  },
];

const md = markdownit({ breaks: true, html: true });

containerConfigs.forEach((config) => {
  md.use(container, config.name, {
    render(tokens: Token[], idx: number) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        if (config.name === "toolcall") {
          return `<div class="${config.className}" data-toolcall="true">\n`;
        }
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

const parseToolCallInfo = (content: string) => {
  const parts = content.split("|");
  if (parts.length >= 2) {
    return {
      toolName: parts[0].trim(),
      status: parts[1].trim() as "pending" | "success" | "error",
      result: parts[2]?.trim(),
      error: parts[1].trim() === "error" ? parts[2]?.trim() : undefined,
    };
  }
  return null;
};

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  const parsedContent = preprocessContent(content);
  const htmlContent = md.render(parsedContent);

  return (
    <Typography className="markdown-render">
      <div
        dangerouslySetInnerHTML={{
          __html: htmlContent,
        }}
        ref={(element) => {
          if (element) {
            const toolCallContainers = element.querySelectorAll(
              '.toolcall[data-toolcall="true"]'
            );

            toolCallContainers.forEach((container) => {
              const textContent = container.textContent?.trim();
              if (textContent) {
                const toolCallInfo = parseToolCallInfo(textContent);
                if (toolCallInfo) {
                  container.innerHTML = "";

                  const root = createRoot(container);
                  root.render(
                    <ToolCallCard
                      error={toolCallInfo.error}
                      result={toolCallInfo.result}
                      status={toolCallInfo.status}
                      toolName={toolCallInfo.toolName}
                    />
                  );
                }
              }
            });
          }
        }}
      />
    </Typography>
  );
};

export default renderMarkdown;
