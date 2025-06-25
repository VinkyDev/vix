import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { Flex, Spin } from "antd";
import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import { AutoSize } from "./components/AutoSize";
import { useHideOnBlur, useShortcut } from "./hooks";
import Chat from "./pages/chat";
import Setting from "./pages/setting";
import { ShortcutKey, useModelStore } from "./store";
import { emitter, toggleWindow } from "./utils";

const config: XProviderProps = {};

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

  // 失去焦点隐藏
  useHideOnBlur(false);

  // 快捷键注册
  useShortcut(ShortcutKey.ToggleWindow, async () => {
    const visiable = await toggleWindow();
    emitter.emit("toggle-window", visiable);
  });

  return (
    <XProvider {...config}>
      <Router>
        <AutoSize>
          <div className="app-container">
            {loading ? (
              <Flex align="center" className="app-loading" justify="center">
                <Spin />
              </Flex>
            ) : (
              <AppRoutes />
            )}
          </div>
        </AutoSize>
      </Router>
    </XProvider>
  );
}

export default App;
