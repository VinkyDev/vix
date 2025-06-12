import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { useState } from "react";

import { ShortcutAction } from "./constants/shortcut";
import { useShortcut } from "./hooks";
import Demo from "./pages/demo";
import { toggleWindow } from "./utils";

const config: XProviderProps = {};

function App() {
  const [visible, setVisible] = useState(false);

  useShortcut(ShortcutAction.TOGGLE_WINDOW, async () => {
    const visible = await toggleWindow();
    setVisible(visible);
  });
  return (
    <XProvider {...config}>
      <div className="app-container" data-tauri-drag-region>
        <Demo visible={visible} />
      </div>
    </XProvider>
  );
}

export default App;
