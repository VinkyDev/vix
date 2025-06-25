import { getCurrentWindow, PhysicalSize } from "@tauri-apps/api/window";
import { type } from "@tauri-apps/plugin-os";
import React, { useCallback, useEffect, useRef } from "react";

interface AutoSizeProps {
  ready?: boolean;
  children: React.ReactNode;
}

export const AutoSize: React.FC<AutoSizeProps> = ({
  ready = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeWindow = useCallback(async () => {
    const win = getCurrentWindow();
    if (!containerRef.current || !ready) return;

    await new Promise((r) => setTimeout(r, 50));
    const rect = containerRef.current.getBoundingClientRect();
    const factor = window.devicePixelRatio;
    const width = Math.ceil(rect.width * factor);
    const height = Math.ceil(rect.height * factor);

    const decorated = await win.isDecorated();
    const topPadding = decorated && (await type()) === "macos" ? 55 : 0;

    const newSize = new PhysicalSize(width, height + topPadding);

    await win.setSize(newSize);
    await new Promise((r) => setTimeout(r, 50));
    await win.show();
    await win.setFocus();
  }, [ready]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      resizeWindow();
    });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [ready, resizeWindow]);

  return <div ref={containerRef}>{children}</div>;
};
