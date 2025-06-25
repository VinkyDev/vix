import { invoke } from "@tauri-apps/api/core";
import { once } from "@tauri-apps/api/event";

interface PageContent {
  title: string;
  content: string;
  url: string;
}

export const getWebsiteContent = async (url: string): Promise<string> => {
  await invoke("get_page_content", {
    url,
  });

  return new Promise((resolve) => {
    once<PageContent>("page-content-received", (event) => {
      resolve(
        `标题：${
          event.payload.title
        }\n\n主要内容：${event.payload.content.slice(2000)}`
      );
    });
  });
};
