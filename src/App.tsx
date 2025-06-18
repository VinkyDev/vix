import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { Flex, Spin } from "antd";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import FadeWrapper from "./components/FadeWrapper";
import { ShortcutAction } from "./constants/shortcut";
import { useHideOnBlur, useShortcut } from "./hooks";
import Chat from "./pages/chat";
import Setting from "./pages/setting";
import { useModelStore } from "./store";
import { emitter, toggleWindow } from "./utils";

const config: XProviderProps = {};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout">
      <Routes key={location.pathname} location={location}>
        <Route
          element={
            <FadeWrapper>
              <Chat />
            </FadeWrapper>
          }
          path="/"
        />
        <Route element={<Setting />} path="/setting" />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { fetchModelList, loading } = useModelStore();

  // 获取模型列表
  useEffect(() => {
    fetchModelList();
  }, [fetchModelList]);

  // 失去焦点隐藏
  useHideOnBlur();

  // 快捷键注册
  useShortcut(ShortcutAction.TOGGLE_WINDOW, async () => {
    const visiable = await toggleWindow();
    emitter.emit("toggle-window", visiable);
  });

  return (
    <XProvider {...config}>
      <Router>
        <div className="app-container" data-tauri-drag-region>
          {loading ? (
            <Flex align="center" className="app-loading" justify="center">
              <Spin />
            </Flex>
          ) : (
            <AnimatedRoutes />
          )}
        </div>
      </Router>
    </XProvider>
  );
}

export default App;
