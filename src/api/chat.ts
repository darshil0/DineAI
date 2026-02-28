import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { buildProfile } from "../services/profileBuilder.js";
import { recommendCandidates } from "../services/ragRecommender.js";
import { analyzeTrends } from "../services/trendAnalyst.js";
import { finalizeRecommendations } from "../services/finalizer.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Zod schema for validating the incoming chat request body
const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  history: z.string().optional().default("[]"),
  currentProfile: z.string().optional().default("{}"),
});

router.post("/", upload.single("image"), async (req, res) => {
  // In Express 5, async errors are automatically caught and passed to next(err).
  // We remove the try/catch block to leverage this.

  // Validate request body
  const validatedBody = ChatRequestSchema.safeParse(req.body);
  if (!validatedBody.success) {
    return res.status(400).json({
      error: "Invalid request data",
      details: validatedBody.error.format(),
    });
  }

  const { message, history, currentProfile } = validatedBody.data;
  const imageFile = req.file;

  // Truncate history to the last 6 messages to keep prompt size manageable
  let truncatedHistory = history;
  try {
    const historyArray = JSON.parse(history);
    if (Array.isArray(historyArray) && historyArray.length > 6) {
      truncatedHistory = JSON.stringify(historyArray.slice(-6));
    }
  } catch (e) {
    logger.warn("ChatApi", "Failed to parse history for truncation:", e);
  }

  // 1. Profile Builder Agent
  const userTasteProfile = await buildProfile(
    message,
    truncatedHistory,
    currentProfile,
    imageFile,
  );

  // 2 & 3. Run RAG Recommender and Trend Analyst in parallel
  const [candidateList, trendReportText] = await Promise.all([
    recommendCandidates(userTasteProfile),
    analyzeTrends(userTasteProfile),
  ]);

  // 4. Recommendation Finalizer Agent
  const finalRecommendations = await finalizeRecommendations(
    userTasteProfile,
    message,
    candidateList,
    trendReportText,
  );

  res.json({
    profile: userTasteProfile,
    trends: trendReportText,
    recommendations: finalRecommendations,
  });
});

export default router;
