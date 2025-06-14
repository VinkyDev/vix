import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";
import { AnimatePresence } from "motion/react";
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
  useHideOnBlur(false);

  return (
    <XProvider {...config}>
      <Router>
        <div className="app-container" data-tauri-drag-region>
          <AnimatedRoutes />
        </div>
      </Router>
    </XProvider>
  );
}

export default App;
