import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import "./index.css";

import { NexusProvider } from "./context/NexusContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <NexusProvider>
        <App />
      </NexusProvider>
    </BrowserRouter>
  </React.StrictMode>
);