import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeTableauExtension } from "@/lib/tableauApi";

// Initialize Tableau Extension if running in Tableau context
// This can detect if we're running in Tableau or standalone mode
initializeTableauExtension().catch(err => {
  console.warn("Not running as a Tableau extension or initialization failed:", err);
});

createRoot(document.getElementById("root")!).render(<App />);
