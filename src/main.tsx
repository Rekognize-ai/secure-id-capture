import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanupExpiredImages } from "./services/imageCleanup";

// Security: Clean up expired biometric images from localStorage on startup
cleanupExpiredImages();

createRoot(document.getElementById("root")!).render(<App />);
