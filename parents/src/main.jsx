import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { syncAppearance } from "./settings";
import "./styles.css";
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const apiBase = (import.meta.env.VITE_API_URL || 'https://erp-skillyon-b.vercel.app').replace(/\/$/, '');
    url = `${apiBase}${url}`;
  }
  return originalFetch(url, options);
};

import { ThemeProvider } from "./components/ThemeProvider";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
