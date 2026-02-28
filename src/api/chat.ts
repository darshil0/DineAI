import { Router } from "express";
import multer from "multer";
import { buildProfile } from "../services/profileBuilder.js";
import { recommendCandidates } from "../services/ragRecommender.js";
import { analyzeTrends } from "../services/trendAnalyst.js";
import { finalizeRecommendations } from "../services/finalizer.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { message, history, currentProfile } = req.body;
    const imageFile = req.file;

    // 1. Profile Builder Agent
    const userTasteProfile = await buildProfile(
      message,
      history,
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
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

export default router;
