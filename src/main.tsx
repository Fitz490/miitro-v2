import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@/lib/api-client-react";

// All /api requests use relative paths:
//   • Production: Vercel rewrites proxy them to the Railway backend
//     (see vercel.json), so cookies are first-party and never blocked.
//   • Local dev: the Vite proxy in vite.config.ts handles them.
//
// Override with VITE_API_URL at build time only if you need a different backend.
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
