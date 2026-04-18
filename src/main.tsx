import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@/lib/api-client-react";

// In production (Vercel), there is no Vite proxy — API calls must go to the
// real backend.  Use VITE_API_URL env var if set, otherwise fall back to the
// production API origin.  In local dev (import.meta.env.DEV === true) the
// Vite proxy in vite.config.ts handles it, so we skip setBaseUrl entirely.
const apiUrl = import.meta.env.VITE_API_URL || (!import.meta.env.DEV && "https://miitro-api-production.up.railway.app");
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
