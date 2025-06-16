import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { Spin } from "antd";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import FadeWrapper from "./components/FadeWrapper";
import { useHideOnBlur } from "./hooks";
import Chat from "./pages/chat";
import Setting from "./pages/setting";
import { useModelStore } from "./store";

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

  useEffect(() => {
    fetchModelList();
  }, [fetchModelList]);
  useHideOnBlur(false);

  return (
    <XProvider {...config}>
      <Router>
        <div className="app-container" data-tauri-drag-region>
          {loading ? (
            <div className="app-loading">
              <Spin />
            </div>
          ) : (
            <AnimatedRoutes />
          )}
        </div>
      </Router>
    </XProvider>
  );
}

export default App;
