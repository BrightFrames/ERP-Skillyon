import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { syncAppearance } from "./settings";
import "./styles.css";
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    url = `${apiBase}${url}`;
  }
  return originalFetch(url, options);
};

syncAppearance();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
