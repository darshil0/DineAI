import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import chatRouter from "./src/api/chat.js";
import { bootstrapSkills } from "./src/skills/bootstrap.js";
import { ingestRestaurants } from "./src/scripts/ingestRestaurants.js";

dotenv.config();

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
