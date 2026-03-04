import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext.jsx"; // ajuste o caminho se necessário
import { NexusProvider } from "./context/NexusContext.jsx"; // se você usa

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NexusProvider>
          <App />
        </NexusProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);