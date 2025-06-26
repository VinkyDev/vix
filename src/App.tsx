import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { App as AntdApp, ConfigProvider, Flex, Spin, ThemeConfig } from "antd";
import { useEffect } from "react";
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
  },
};

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes key={location.pathname} location={location}>
      <Route element={<Chat />} path="/" />
      <Route element={<Setting />} path="/setting" />
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
      </ConfigProvider>
    </XProvider>
  );
}

export default App;
