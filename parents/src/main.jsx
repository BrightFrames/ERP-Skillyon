import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { syncAppearance } from "./settings";

syncAppearance();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
