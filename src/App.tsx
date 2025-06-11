import "./App.scss";

import { XProvider, XProviderProps } from "@ant-design/x";

import Demo from "./pages/demo";

const config: XProviderProps = {};

function App() {
  return (
    <XProvider {...config}>
      <Demo />
    </XProvider>
  );
}

export default App;
