import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { useState } from "react";

import { ShortcutAction } from "./constants/shortcut";
import { useHideOnBlur, useShortcut } from "./hooks";
import Demo from "./pages/chat";
import { toggleWindow } from "./utils";

const config: XProviderProps = {};

function App() {
  const [visible, setVisible] = useState(false);

  useShortcut(ShortcutAction.TOGGLE_WINDOW, async () => {
    const visible = await toggleWindow();
    setVisible(visible);
  });

  useHideOnBlur(false);

  return (
    <XProvider {...config}>
      <div className="app-container" data-tauri-drag-region>
        <Demo visible={visible} />
      </div>
    </XProvider>
  );
}

export default App;
