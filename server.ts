import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import chatRouter from "./src/api/chat.js";
import { bootstrapSkills } from "./src/skills/bootstrap.js";
import { ingestRestaurants } from "./src/scripts/ingestRestaurants.js";

// Fix: README instructs users to create .env.local, but dotenv.config() only
// loads .env by default. Load .env.local first, then fall back to .env so the
// GEMINI_API_KEY is actually found in both development and production setups.
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env if a key wasn't already set

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Agent Skills
  bootstrapSkills();

  // Ingest restaurants into Vector DB
  await ingestRestaurants();

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/chat", chatRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
