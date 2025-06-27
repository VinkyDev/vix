import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { App as AntdApp, ConfigProvider, Flex, Spin, ThemeConfig } from "antd";
import { useEffect } from "react";
import { AliveScope, KeepAlive } from "react-activation";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import { useShortcut } from "./hooks";
import Chat from "./pages/chat";
import Setting from "./pages/setting";
import { ShortcutKey, useModelStore } from "./store";
import { emitter, toggleWindow } from "./utils";

const config: XProviderProps = {};

const theme: ThemeConfig = {
  components: {
    Button: {
      defaultBg: "#fafafa",
    },
    Select: {
      selectorBg: "#fafafa",
    },
  },
};

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route
        element={
          <KeepAlive id="chat">
            <Chat />
          </KeepAlive>
        }
        path="/"
      />
      <Route
        element={
          <KeepAlive id="setting">
            <Setting />
          </KeepAlive>
        }
        path="/setting"
      />
    </Routes>
  );
}

function App() {
  const { fetchModelList, loading } = useModelStore();

  // 获取模型列表
  useEffect(() => {
    fetchModelList();
  }, [fetchModelList]);

  // 快捷键注册
  useShortcut(ShortcutKey.ToggleWindow, async () => {
    const visiable = await toggleWindow();
    emitter.emit("toggle-window", visiable);
  });

  return (
    <XProvider {...config}>
      <ConfigProvider theme={theme}>
        <AliveScope>
          <Router>
            <div className="app-container" data-tauri-drag-region>
              <AntdApp style={{ height: "100%" }}>
                {loading ? (
                  <Flex align="center" className="app-loading" justify="center">
                    <Spin />
                  </Flex>
                ) : (
                  <AppRoutes />
                )}
              </AntdApp>
            </div>
          </Router>
        </AliveScope>
      </ConfigProvider>
    </XProvider>
  );
}

export default App;
